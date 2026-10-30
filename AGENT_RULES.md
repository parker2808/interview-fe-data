# AGENT_RULES.md

## Common rules

Source: `ai-memory/rules/COMMON_RULES.md` (copied verbatim below).

# COMMON_RULES — Parker's flow (all agents, all repos)

Source of truth for every agent (T3, Codex, Cursor, OpenCode, Grok Bot) working on `parker2808` repos.
Built only from what the repos, PR history, CI and bot exports actually show (rebuilt 2026-10-31). Project rule files (`AGENT_RULES.md` in each repo) add to these, never relax them.

## 1. Before you start
- Read the repo's `AGENTS.md` and `PROJECT_CONTEXT.md` in full first. They hold confirmed facts, forbidden items and status.
- Read this file. If a project rule and this file disagree, the stricter one wins; ask Parker if unsure.
- Check `git status` and the open PRs first; preserve other people's work.

## 2. Branches, commits, PRs
- One task = one branch (or git worktree) = one PR to `main`. Never push or commit to `main` directly.
- Branch names: `<type>/<short-kebab-topic>` with type `feat|fix|chore|docs|content|plan` (e.g. `fix/desktop-chapter-drawer`, `chore/project-context`). Cloud agents may add a short suffix (`cursor/<topic>-<4hex>`).
- One agent per branch/worktree. Never commit to another agent's branch, never share a working tree.
- Stay in your task's scope. Write anything out of scope into PROJECT_CONTEXT open items instead of doing it.
- PR title: short, plain, says what changed. lil.p uses conventional commits (enforced by commitlint); the other repos use a plain sentence title ("Fix …", "Add …", "Plan: …", "content: …"). PR number is appended on squash merge (`(#57)`).
- PR body: what's in it, constraints respected, checks run (commands + result), and what Parker still needs to decide. Say clearly if it must not be merged yet.
- Stacked PRs are OK. Multi-PR work can go to an integration/preview branch first.
- Monitor CI until every check is green; fix failures yourself and report the check status.

## 3. Merging (absolute)
- **Never merge, deploy, or close a PR without Parker's explicit OK ("merge").** Open the PR and stop. One PR at a time.
- Only exception: `parker2808/ai-memory` may be auto-merged after a secrets/PII scan passes.
- **Never touch PR #27 in `interview-senior-fe`** (GitHub OAuth, in development).

## 4. PROJECT_CONTEXT.md + context-check CI
- Every PR to `main` that changes files outside the exempt paths must update `PROJECT_CONTEXT.md` (status/open items + changelog sections) in the same PR.
- CI `context-check` fails if `PROJECT_CONTEXT.md` is missing at HEAD or not in the diff for non-exempt changes. Exempt: `docs/` (plus content folders in interview-fe-data).
- The `skip-context` label bypasses the check; use only when Parker agrees.
- Record new decisions from Parker (with date) in PROJECT_CONTEXT.md in your PR. Never invent rules.

## 5. Privacy and secrets (absolute)
- Never commit, paste, print or log secrets: `.env` values, tokens, passcodes, API keys, deploy hook URLs, auth codes. Not in code, PRs, logs or chat.
- Never commit Parker's phone number or personal email. Use `<email>` and `<phone>` placeholders.
- Public repos: `lil.p`, `lil.j`, `interview-senior-fe`. Never name or link private repos there (write `<private-content-repo>`).
- Private: `interview-fe-data`, `ai-memory`.

## 6. Facts and content
- Never invent facts, dates, metrics, memories, places, captions or confirmations. Mark unknowns as **(uncertain)** or leave blank and list them as open items.
- No hard-coded content where the project keeps it in data (DB/CMS in lil.p, `site/content.json` in lil.j, JSON data repo for interview-senior-fe).
- Bilingual EN + VI where the project is bilingual. Vietnamese must read naturally, never a literal translation.
- Free services only ($0 hosting: Vercel, Render free, TiDB, Cloudinary); no paid packages/extensions.

## 7. Talking to Parker
- Reply in plain, natural Vietnamese, short and concrete (he is often on his iPhone). No stiff literal translation, no em dashes.
- Give short options when a decision is needed; send results for review first (screenshots for UI work).
- If facts are missing, stop and ask; don't guess.
- Parker tests UI on iPhone 14 Pro Max (430×932) first.

## 8. Checks before opening a PR
- Run the repo's own checks (listed in its project rules) and paste the results in the PR body.
- Run a secrets/PII grep on the diff (tokens, `@` emails, phone numbers) before pushing.
- Package managers: lil.p uses pnpm (workspace, husky + commitlint); interview-senior-fe uses npm (`package-lock.json`); lil.j and interview-fe-data have no package manager (static site / JSON + node scripts).

## Project rules for interview-fe-data

- **Stack and package manager:** This private repository stores bilingual JSON, JSON Schema, Markdown plans, WebP mockups, and Node.js `.mjs` validation scripts. There is no root `package.json` or root lockfile; run the scripts directly with Node. GitHub Actions uses Node 22 for content validation.
- **Required checks before a PR:** Run `node scripts/validate.mjs .`, `node scripts/check-content.mjs .`, `node scripts/check-plan.mjs . --strict`, `node scripts/sync-plan-index.mjs --check`, `node scripts/check-practice.mjs . --strict`, and `node scripts/sync-practice-index.mjs --check`. The Validate content workflow runs all except `sync-plan-index.mjs --check`; `check-content.mjs` also checks the knowledge-base index. After editing content, run the matching `sync-kb-index.mjs`, `sync-plan-index.mjs`, or `sync-practice-index.mjs` to regenerate its index before checking.
- **CI workflows:** `.github/workflows/validate.yml` validates content on PRs and pushes to `main`; `.github/workflows/context-check.yml` requires `PROJECT_CONTEXT.md` at HEAD and, for non-exempt PRs to `main`, in the diff (unless `skip-context` is applied); `.github/workflows/redeploy.yml` triggers a Vercel deploy hook on pushes to `main` when its secret is configured.
- **Context updates:** For changes outside `docs/`, `knowledge-base/`, `plan/`, `practice/`, `qna/`, `mockups/`, and `manifest.json`, update §8 status and §9 changelog in `PROJECT_CONTEXT.md`. The check only verifies the file's presence in the diff; the section updates are a review requirement.
- **Content and data:** `knowledge-base/` holds bilingual topic documents and its index; `plan/` holds 30-day plan data, resources, and its index; `practice/` holds steps, design gallery, and its index; `qna/questions.json` is the single Q&A bank and must not be split. `schema/` holds JSON Schema, `scripts/` holds validators and index sync tools, `plans/` holds design and writing specifications, and `mockups/` holds mockup material. Keep every user-facing string in both `en` and `vi` and preserve locale-specific heading anchors.
- **Forbidden items:** Never commit personal email, phone numbers, secrets, or deploy hook URLs. Never invent content facts or confirmations. Never merge without Parker's explicit approval; merging `main` can trigger deployment. Never touch PR #27 in `interview-senior-fe`. Keep this private repository's name and link out of public repositories.
- **Branches and PR titles:** Use one branch or worktree and one PR to `main` per task. Recent merged PR titles here use plain descriptions such as `Plan: ...` and `content: ...`; use `Add agent rules (common + project)` for this PR. The current task branch is `chore/agent-rules`. Do not push directly to `main`.
