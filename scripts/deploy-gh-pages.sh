#!/usr/bin/env bash
set -e

echo "=== Building production bundle for GitHub Pages ==="
npm run build

WORKTREE_DIR="/tmp/gh-pages-deploy-$$"
rm -rf "$WORKTREE_DIR"

echo "=== Creating gh-pages worktree ==="
git worktree add -B gh-pages "$WORKTREE_DIR"

echo "=== Cleaning worktree and copying dist ==="
cd "$WORKTREE_DIR"
git rm -rf . 2>/dev/null || true
cp -R /Users/taklatvs/Desktop/maheshhh/dist/* .
cp /Users/taklatvs/Desktop/maheshhh/dist/.* . 2>/dev/null || true

git add -A
git commit -m "deploy: GitHub Pages static build $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

echo "=== Pushing to origin gh-pages ==="
git push -u origin gh-pages --force

cd /Users/taklatvs/Desktop/maheshhh
git worktree remove "$WORKTREE_DIR" --force

echo "=== Successfully deployed to gh-pages branch! ==="

