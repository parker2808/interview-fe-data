# Agent rules — interview-fe-data

Read `PROJECT_CONTEXT.md` in full and `docs/LESSONS.md` before starting; append one line per new lesson.
These are the canonical agent rules. `AGENT_RULES.md` points here for older links.

## Start and scope
- Work in a T3 worktree on a feature branch, never in the main checkout on `main`.
- One task = one branch/worktree = one PR. Stay in scope and do not edit another agent's branch.
- Read `graphify-out/GRAPH_REPORT.md` for navigation; open only the files needed for the task.
- For a big task, write a plan before coding and a spec in `docs/specs/` when needed.
- Run agent work through `~/ai-tools/t3-run.sh` so its watchdog reports failures and switches models.
- Do small tasks directly; keep bigger tasks in small, checked steps.
- Agents on free models must stay within the plan, add no dependencies, and never merge.

## Project and content
- This private content repo supplies bilingual JSON to the `interview-senior-fe` app at build time.
- Node 22 scripts live in `scripts/`; there is no root `package.json`.
- Content lives in `knowledge-base/`, `plan/`, `practice/`, and one `qna/questions.json` bank.
- Keep both `en` and `vi` for every user-facing string; write natural Vietnamese, never literal translations.
- Preserve existing heading anchors and allowed block types; change only the content needed.
- Never invent facts or metrics. Mark unknowns **(uncertain)**.
- After content edits, run the matching `sync-kb-index.mjs`, `sync-plan-index.mjs`, or `sync-practice-index.mjs`.

## Safety and coordination
- Never commit Parker's personal email or phone; use `<email>` and `<phone>` placeholders.
- Never commit, paste, or log secrets, tokens, passcodes, or deploy hook URLs.
- Public repos must refer to private repos only as `<private-content-repo>` or `<private-memory-repo>`.
- Never touch PR #27 in `interview-senior-fe`.
- Never merge to `main` without Parker explicitly saying “merge”; a merge may deploy the app.
- Coordinate content shape changes with the app repo and wait for Parker's approval before merging.

## Checks and PRs
- Before a PR, run `node scripts/validate.mjs .` and `node scripts/check-content.mjs .`.
- Also run `node scripts/check-plan.mjs . --strict` and `node scripts/sync-plan-index.mjs --check`.
- Also run `node scripts/check-practice.mjs . --strict` and `node scripts/sync-practice-index.mjs --check`.
- Report check results to Parker in plain Vietnamese.
- Open one PR to `main` from a `<type>/<topic>` branch; never push directly to `main`.
- Every PR to `main` must update `PROJECT_CONTEXT.md` §8 status and §9 changelog.
- CI checks that file exists at HEAD and, for non-exempt changes, appears in the diff; it does not parse sections.
- `docs/`, `knowledge-base/`, `plan/`, `practice/`, `qna/`, `mockups/`, and `manifest.json` are exempt.
- Changes to `scripts/`, `schema/`, `.github/`, `README.md`, or other root files are not exempt.
- The `skip-context` label bypasses the CI requirement.
