#!/bin/bash
# Description: Automatically stages, commits, and pushes any changes (new games) to GitHub.
# Supports two modes:
#   1. Direct: Run manually or via cron to publish immediately.
#   2. Signal-based: Run via cron every minute. If PUBLISH_REQUEST exists in the
#      agent workspace, publish and write PUBLISH_RESULT back so the containerized
#      agent can confirm success.

SCRIPT_DIR="/Volumes/ai-stack/openclaw-games"
WORKSPACE_GAMES="/Volumes/ai-stack/openclaw-PointClickStudio/openclaw-data/workspace/games"
SIGNAL_DIR="${HOME:-/Users/cperos}/openclaw-signals"
SIGNAL_FILE="$SIGNAL_DIR/PUBLISH_REQUEST"
RESULT_FILE="$SIGNAL_DIR/PUBLISH_RESULT"

cd "$SCRIPT_DIR" || exit 1

# ── Helper: write result back to workspace so the agent can read it ──
write_result() {
  local status="$1"
  local message="$2"
  local git_output="$3"
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  cat > "$RESULT_FILE" <<EOJSON
{
  "status": "$status",
  "timestamp": "$timestamp",
  "message": "$message",
  "gitOutput": "$git_output"
}
EOJSON
}

# ── Signal-based mode: check for trigger file ──
# When called with --watch, only publish if a request file exists.
if [ "$1" = "--watch" ]; then
  if [ ! -f "$SIGNAL_FILE" ]; then
    exit 0  # No request — nothing to do
  fi
  echo "$(date): Publish request detected, processing..."
  rm -f "$SIGNAL_FILE"
fi

# ── Pre-flight checks ──
if [ ! -d .git ]; then
  echo "Error: Not a git repository."
  [ "$1" = "--watch" ] && write_result "error" "Not a git repository at $SCRIPT_DIR" ""
  exit 1
fi

# ── Sync games from workspace source-of-truth ──
echo "Syncing latest agent games..."
# Exclude-based approach -- new game folders auto-appear without any allowlist changes.
rsync_output=$(rsync -avL --delete \
  --exclude='.git' \
  --exclude='publish.sh' \
  --exclude='build-standard-games.mjs' \
  --exclude='standard-game-validation.mjs' \
  --exclude='pipeline-state.json' \
  --exclude='PUBLISH_REQUEST' \
  --exclude='PUBLISH_RESULT' \
  --exclude='audit-summary.md' \
  --exclude='solvability-summary.md' \
  --exclude='game20-script.json' \
  --exclude='001-lighthouse-blackwater-point' \
  --exclude='001-the-clockwork-lighthouse-ARCHIVE' \
  --exclude='001-the-clockwork-lighthouse' \
  --exclude='archives-*' \
  --exclude='LAYOUT-GUIDE-OLD.md' \
  "$WORKSPACE_GAMES/" "$SCRIPT_DIR/" 2>&1)
rsync_status=$?

echo "$rsync_output"

if [ $rsync_status -ne 0 ]; then
  echo "Error: rsync failed."
  if [ "$1" = "--watch" ]; then
    write_result "error" "rsync failed" "$rsync_output"
  fi
  exit 1
fi

touch "$SCRIPT_DIR/.nojekyll"

# ── Check for changes ──
echo "Checking for changes..."
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to publish. Everything is up to date."
  if [ "$1" = "--watch" ]; then
    write_result "success" "No changes to publish. Everything is already up to date." ""
  fi
  exit 0
fi

# ── Commit and push ──
echo "Adding changes..."
git add -A
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
git_output=$(git commit -m "Auto-publish games: $timestamp" 2>&1)
echo "$git_output"

push_output=$(git push origin main 2>&1)
push_status=$?
echo "$push_output"

if [ $push_status -eq 0 ]; then
  echo "Successfully published to GitHub Pages!"
  if [ "$1" = "--watch" ]; then
    write_result "success" "Successfully published to GitHub Pages!" "$git_output"
  fi
  exit 0
else
  echo "Error: git push failed."
  if [ "$1" = "--watch" ]; then
    write_result "error" "git push failed" "$push_output"
  fi
  exit 1
fi
