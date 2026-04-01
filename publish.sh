#!/bin/bash
# Description: Automatically stages, commits, and pushes any changes (new games) to GitHub.
# Designed to be run manually, via a cron job, or triggered by an OpenClaw agent.

cd "$(dirname "$0")" || exit 1

# Check if git is initialized
if [ ! -d .git ]; then
  echo "Error: Not a git repository. Please run 'git init' and add a remote origin."
  exit 1
fi

echo "Checking for changes..."
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to publish. Everything is up to date."
  exit 0
fi

echo "Adding changes..."
git add .

echo "Committing..."
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Auto-publish games: $timestamp"

echo "Pushing to GitHub..."
git push origin main

echo "Successfully published to GitHub Pages!"
