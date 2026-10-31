# AGENT_RULES: interview-fe-data
Common rules and token flow live in `<private-memory-repo>`: `rules/COMMON_RULES.md`, `rules/TOKEN_FLOW.md`, templates in `templates/` (ask Parker if you lack access). This file only adds repo facts; keep it about 30 lines.

## Start (token flow)
- Read `PROJECT_CONTEXT.md`, then `graphify-out/GRAPH_REPORT.md`. Query by exact names (`graphify explain "Name"`, `graphify path "A" "B"`); open only needed line ranges, each file once. Refresh: `graphify update .` (no model calls; the report is committed, the rest of `graphify-out/` is ignored).
- Small task (copy, style, one file): do it directly. Big task: plan (≤ 20 lines) → small steps with checks → handoff → paid review of plan + diff only.
- Free agents: no work outside the plan, no new dependencies, no merging.

## Stack
- Private content repo for interview-senior-fe: bilingual JSON, JSON Schema, Markdown plans, WebP mockups, Node 22 `.mjs` scripts. No package.json; run scripts with Node.

## Checks (run before PR, paste results)
- `node scripts/validate.mjs .`, `node scripts/check-content.mjs .`, `node scripts/check-plan.mjs . --strict`, `node scripts/sync-plan-index.mjs --check`, `node scripts/check-practice.mjs . --strict`, `node scripts/sync-practice-index.mjs --check`.
- After content edits run the matching `sync-kb-index.mjs` / `sync-plan-index.mjs` / `sync-practice-index.mjs` first.
- CI: `validate.yml`, `context-check.yml`, `redeploy.yml` (deploy hook on `main`).

## Where things live
- `knowledge-base/`, `plan/`, `practice/` (each with an index), `qna/questions.json` (single bank, never split), `schema/`, `scripts/`, `plans/`, `mockups/`. Every string in `en` and `vi`.

## Forbidden
- No personal email, phone, secrets or deploy hook URLs. Never invent content.
- Never name or link this repo from public repos. Never touch PR #27 in interview-senior-fe.
- Never merge without Parker's OK (merging `main` can deploy).

## PRs
- `<type>/<topic>` branch, one PR, plain title (`Plan: …`, `content: …`). Non-exempt changes update `PROJECT_CONTEXT.md` §8 and §9.
