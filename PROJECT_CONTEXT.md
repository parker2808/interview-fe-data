# PROJECT_CONTEXT — `<private-content-repo>`

> **Mandatory reading for every agent** (Cursor, Codex, Claude Code, T3 Code threads, cloud agents) before touching this repo.
> Every PR to `main` must update **§8 Open items / status** and **§9 Changelog** in the same PR (CI requires the file to exist at HEAD and, for non-exempt changes, appear in the diff; section updates are a review requirement, not parsed by CI; label `skip-context` bypasses). Exempt paths (pure content, edited often): `docs/`, `knowledge-base/`, `plan/`, `practice/`, `qna/`, `mockups/`, `manifest.json`. Changes to `scripts/`, `schema/`, `.github/`, `README.md` or other root files must update PROJECT_CONTEXT.md. Rationale: content edits are validated by the existing content CI; structural changes alter the contract with the app and need recording.

## 1. Project overview
- **What:** private source of truth for `interview-senior-fe`: bilingual JSON for the knowledge base, 30-day plan, practice path, practice design gallery and Q&A bank.
- **Repo:** `<private-content-repo>` (private; never name or link it publicly, only describe it).
- **Deploy:** merging to `main` triggers the Vercel deploy hook (GitHub Action) for the app; the app pulls this tree at build time. The hook runs only when its secret is configured; otherwise the workflow skips deployment. Treat merges as potential production deploys.
- **Layout:** `knowledge-base/`, `plan/`, `practice/`, `qna/` (single `questions.json`, do not split), `schema/`, `scripts/` (validate, check-*, sync-*-index), `manifest.json`, `mockups/`, `plans/` (design specs, rewrite plans, style guide and glossary; distinct from `plan/`).

## 2. Confirmed facts
| Fact | Value | Status |
|---|---|---|
| Owner / sole decision maker | Parker (`parker2808`) | confirmed |
| Consumer | `interview-senior-fe` app, build-time pull | confirmed |
| Every user-facing string | `{ "en": "...", "vi": "..." }`, both required | README |
| Q&A bank | single `qna/questions.json` | README |

## 3. Forbidden / hard rules
- Never commit Parker's phone number or personal email. Use `<email>` and `<phone>` placeholders.
- Never commit, paste, or log secrets (passcodes, token secrets, `CONTENT_REPO_TOKEN`, Vercel/Blob tokens, deploy hook URLs).
- Never merge to `main` without Parker's explicit approval ("merge"). Open a PR and stop.
- Never touch PR #27 in `interview-senior-fe` (GitHub OAuth work, in development).
- Vietnamese content must read naturally, never a literal translation of the English.
- Never invent facts, metrics, or confirmations. Mark unknowns as **(uncertain)**.

## 4. Content rules
- Change only the JSON you need; never drop `en` or `vi`.
- Allowed block types: `heading`, `paragraph`, `list`, `callout`, `code`, `table`, `senior-answer`, `key-takeaways`, `markdown`, `thematic-break`.
- Heading `id` is per locale; keep existing anchors working.
- After editing `knowledge-base/`, run `sync-kb-index.mjs` and `check-content.mjs`; for `plan/` or `practice/`, run the matching `sync-*-index.mjs` and `check-*.mjs` scripts. Also run `validate.mjs`. The Markdown specs in `plans/` have no matching index sync script.
- Vietnamese is written as natural Vietnamese (see `plans/vi-style-guide.md` and `plans/vi-glossary.json`), never word-for-word.
- No PII anywhere in content (`check-practice.mjs` checks this).

## 5. Workflow
- One task = one branch (or worktree) = one PR to `main`. Never push to `main` directly.
- Run `node scripts/validate.mjs` and `node scripts/check-content.mjs` (plus relevant check-*) before opening a PR.
- Reports to Parker are in Vietnamese, plain language.

## 6. Multi-agent coordination
- A coordinating agent splits work with `delegate_task`; each sub-agent is its own thread and gets a self-contained brief (it cannot see the parent's history), so include all needed context and point it at this file.
- Each agent works on its own branch or git worktree (`git worktree add ../content-<task> -b <type>/<task>`). Never edit another agent's branch.
- Stay in your task's scope; record decisions and open questions here in the same PR.
- App and data are linked: a change in the content shape needs coordinated PRs in both repos, and the data PR merges only when Parker approves.

## 7. Future work
- Continue the Vietnamese rewrite per `plans/vi-rewrite-plan.md`; PR #54 merged the style guide, glossary, rewrite plan and pilot.
- Portfolio design specs were completed in merged PR #56; see `plans/portfolio-design-system.md` and its Vietnamese companion.

## 8. Open items / status
- Context-check rejects a missing or deleted context file; section updates remain a review requirement. GitHub CI is currently blocked by account billing/spending limits.
- Agent guidance is now consolidated in `AGENT_RULES.md`, with common rules copied from `ai-memory/rules/COMMON_RULES.md` and repository-specific checks and boundaries.
- (uncertain) anything not confirmed by Parker is listed here before acting on it.

## 9. Changelog
- 2026-10-31 — Added `AGENT_RULES.md` and linked it from `AGENTS.md`.
- 2026-10-30 — Added PROJECT_CONTEXT.md, AGENTS.md and context-check CI (T3 Code multi-agent setup, mirrors lil.j).
- 2026-10-30 — Reject missing/deleted context at HEAD; clarify CI enforcement, correct paths and merged-plan status, qualify deployment behavior, and anonymize the private repository name.
