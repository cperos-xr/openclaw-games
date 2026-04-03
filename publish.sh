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
# Mirror only content we intentionally want live in the publish repo.
rsync_output=$(rsync -avL --delete \
  --include='index.html' \
  --include='standard-game-runtime.js' \
  --include='standard-game-style.css' \
  --include='LAYOUT-GUIDE.md' \
  --include='GAME-TEMPLATE.html' \
  --include='GAME-TEMPLATE-ASHMORE.html' \
  --include='GAME-TEMPLATE-FREQUENCY.html' \
  --include='GAME-TEMPLATE-VERTICAL.html' \
  --include='STANDARD-ENGINE-GUIDE.md' \
  --include='001-clockwork-lighthouse/' \
  --include='001-clockwork-lighthouse/**' \
  --include='002-the-hollow-of-saint-vex/' \
  --include='002-the-hollow-of-saint-vex/**' \
  --include='003-ashmore-sanatorium/' \
  --include='003-ashmore-sanatorium/**' \
  --include='004-the-frequency-of-the-dead/' \
  --include='004-the-frequency-of-the-dead/**' \
  --include='005-the-last-showmans-carnival/' \
  --include='005-the-last-showmans-carnival/**' \
  --include='006-pressure-point/' \
  --include='006-pressure-point/**' \
  --include='007-curtain-call/' \
  --include='007-curtain-call/**' \
  --include='008-frostbite-station/' \
  --include='008-frostbite-station/**' \
  --include='009-verdant-requiem/' \
  --include='009-verdant-requiem/**' \
  --include='010-vanity-of-dreams/' \
  --include='010-vanity-of-dreams/**' \
  --include='011-starlight-derelict/' \
  --include='011-starlight-derelict/**' \
  --include='012-subway-ghost-train/' \
  --include='012-subway-ghost-train/**' \
  --include='013-sand-that-speaks/' \
  --include='013-sand-that-speaks/**' \
  --include='014-deep-cathedral/' \
  --include='014-deep-cathedral/**' \
  --include='015-last-broadcast/' \
  --include='015-last-broadcast/**' \
  --include='016-the-clockmakers-folly/' \
  --include='016-the-clockmakers-folly/**' \
  --exclude='*' \
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
