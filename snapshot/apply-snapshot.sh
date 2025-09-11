#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SNAP_DIR="$ROOT_DIR/snapshot"

timestamp() { date -u +"%Y%m%dT%H%M%SZ"; }

backup_and_copy() {
  local src="$1"
  local dest="$2"
  if [ ! -f "$src" ]; then
    echo "Snapshot source $src does not exist. Aborting." >&2
    exit 1
  fi
  if [ -f "$dest" ]; then
    local bak="${dest}.bak.$(timestamp)"
    echo "Backing up existing $dest -> $bak"
    cp "$dest" "$bak"
  fi
  echo "Copying $src -> $dest"
  cp "$src" "$dest"
}

echo "This script will apply snapshot files into: $ROOT_DIR"
echo "It will backup existing files with a .bak.TIMESTAMP suffix before overwriting."
read -p "Proceed and apply snapshot files? (yes/no) " yn
if [ "$yn" != "yes" ]; then
  echo "Aborted by user. No changes applied."; exit 0
fi

FILES=(
  "app.js"
  "index.html"
  "style.css"
  "netlify/functions/commit-contacts.js"
  "README-AUTO-COMMIT.md"
  ".github/scripts/prune-backups.js"
  ".github/workflows/prune-backups.yml"
)

for f in "${FILES[@]}"; do
  SNAP_SRC="$SNAP_DIR/$(basename "$f")"
  # Handle nested paths
  if [[ "$f" == netlify/* ]]; then
    SNAP_SRC="$SNAP_DIR/netlify_commit_contacts.js"
  elif [[ "$f" == .github/scripts/* ]]; then
    SNAP_SRC="$SNAP_DIR/.github_scripts_prune_backups.js"
  elif [[ "$f" == .github/workflows/* ]]; then
    SNAP_SRC="$SNAP_DIR/.github_workflow_prune_backups.yml"
  fi

  DEST="$ROOT_DIR/$f"
  mkdir -p "$(dirname "$DEST")"
  backup_and_copy "$SNAP_SRC" "$DEST"
done

echo "Snapshot applied. Please review changes and commit locally."
echo "To commit and push, run the following from the repo root:"
cat <<'CMD'
git add -A
git commit -m "Apply snapshot: enhanced persistence, auto-commit, merge UI"
git push origin main
CMD

echo "If you want to push to a new branch and open a PR instead, run:"
cat <<'CMD'
git checkout -b snapshot/auto-commit-$(date -u +%Y%m%dT%H%M%SZ)
git add -A
git commit -m "Snapshot: enhanced persistence and auto-commit"
git push -u origin HEAD
CMD

echo "Done."
