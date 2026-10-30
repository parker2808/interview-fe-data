#!/usr/bin/env bash
# Fails if BASE...HEAD touches non-exempt files without touching PROJECT_CONTEXT.md.
set -euo pipefail
files=$(git diff --name-only "$1...$2")
echo "Changed files:"; echo "$files"
if echo "$files" | grep -qx 'PROJECT_CONTEXT.md'; then echo "OK: PROJECT_CONTEXT.md updated."; exit 0; fi
outside=$(echo "$files" | grep -v -E '^(docs|knowledge-base|plan|practice|qna|mockups)/|^manifest\.json$' | grep -v '^$' || true)
if [ -z "$outside" ]; then echo "OK: only exempt paths changed."; exit 0; fi
echo "Non-exempt files:"; echo "$outside"
echo "::error::Update PROJECT_CONTEXT.md (§8 status, §9 changelog) or add the 'skip-context' label."
exit 1
