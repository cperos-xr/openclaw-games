#!/bin/bash
# Description: Automatically stages, commits, and pushes any changes (new games) to GitHub.
# Designed to be run manually, via a cron job, or triggered by an OpenClaw agent.

cd "$(dirname "$0")" || exit 1

# Check if git is initialized
if [ ! -d .git ]; then
  echo "Error: Not a git repository."
  exit 1
fi

echo "Syncing latest agent games..."
rsync -avL --delete --exclude='.git' --exclude='publish.sh' --exclude='.nojekyll' --exclude='README.md' /Volumes/ai-stack/openclaw-PointClickStudio/openclaw-data/workspace/games/ /Volumes/ai-stack/openclaw-games/

echo "Checking for changes..."
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to publish. Everything is up to date."
  exit 0
fi

echo "Adding changes..."
git add .
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Auto-publish actual games: $timestamp"
git push origin main
echo "Successfully published to GitHub Pages!"
