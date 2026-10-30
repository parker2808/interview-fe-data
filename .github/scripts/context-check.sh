#!/usr/bin/env bash
# Requires PROJECT_CONTEXT.md at HEAD and an update for non-exempt BASE...HEAD changes.
set -euo pipefail
if ! git cat-file -e "$2:PROJECT_CONTEXT.md" 2>/dev/null; then
  echo "::error::PROJECT_CONTEXT.md must exist at HEAD; restore the file."
  exit 1
fi
files=$(git diff --name-only "$1...$2")
echo "Changed files:"; echo "$files"
if echo "$files" | grep -qx 'PROJECT_CONTEXT.md'; then echo "OK: PROJECT_CONTEXT.md updated."; exit 0; fi
outside=$(echo "$files" | grep -v -E '^(docs|knowledge-base|plan|practice|qna|mockups)/|^manifest\.json$' | grep -v '^$' || true)
if [ -z "$outside" ]; then echo "OK: only exempt paths changed."; exit 0; fi
echo "Non-exempt files:"; echo "$outside"
echo "::error::Update PROJECT_CONTEXT.md or add the 'skip-context' label."
exit 1
