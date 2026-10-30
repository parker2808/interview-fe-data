# PROJECT_CONTEXT — interview-fe-data (private content repo)

> **Mandatory reading for every agent** (Cursor, Codex, Claude Code, T3 Code threads, cloud agents) before touching this repo.
> Every PR to `main` must update **§8 Open items / status** and **§9 Changelog** in the same PR (enforced by `.github/workflows/context-check.yml`; label `skip-context` bypasses). Exempt paths (pure content, edited often): `docs/`, `knowledge-base/`, `plan/`, `practice/`, `qna/`, `mockups/`, `manifest.json`. Changes to `scripts/`, `schema/`, `.github/`, `README.md` or other root files must update PROJECT_CONTEXT.md. Rationale: content edits are validated by the existing content CI; structural changes alter the contract with the app and need recording.

## 1. Project overview
- **What:** private source of truth for `interview-senior-fe`: bilingual JSON for the knowledge base, 30-day plan, practice path, practice design gallery and Q&A bank.
- **Repo:** https://github.com/parker2808/interview-fe-data (private; never link it publicly, only describe it).
- **Deploy:** merging to `main` triggers the Vercel deploy hook (GitHub Action) for the app; the app pulls this tree at build time. **So every merge is a production deploy.**
- **Layout:** `knowledge-base/`, `plan/`, `practice/`, `qna/` (single `questions.json`, do not split), `schema/`, `scripts/` (validate, check-*, sync-*-index), `manifest.json`, `mockups/`, `docs/`.

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
- After editing docs/plan/practice, run the matching `sync-*-index.mjs` and `check-*.mjs` scripts and `validate.mjs`.
- Vietnamese is written as natural Vietnamese (see the vi style guide / glossary in `docs/` if present), never word-for-word.
- No PII anywhere in content (`check-practice.mjs` checks this).

## 5. Workflow
- One task = one branch (or worktree) = one PR to `main`. Never push to `main` directly.
- Run `node scripts/validate.mjs` and `node scripts/check-content.mjs` (plus relevant check-*) before opening a PR.
- Reports to Parker are in Vietnamese, plain language.

## 6. Multi-agent coordination
- A coordinating agent splits work with `delegate_task`; each sub-agent is its own thread and gets a self-contained brief (it cannot see the parent's history), so include all needed context and point it at this file.
- Each agent works on its own branch or git worktree (`git worktree add ../interview-fe-data-<task> -b <type>/<task>`). Never edit another agent's branch.
- Stay in your task's scope; record decisions and open questions here in the same PR.
- App and data are linked: a change in the content shape needs coordinated PRs in both repos, and the data PR merges only when Parker approves.

## 7. Future work
- Vietnamese rewrite per the vi style guide plan (PR #54).
- Portfolio design spec work (PR #56).

## 8. Open items / status
- (uncertain) anything not confirmed by Parker is listed here before acting on it.

## 9. Changelog
- 2026-10-30 — Added PROJECT_CONTEXT.md, AGENTS.md and context-check CI (T3 Code multi-agent setup, mirrors lil.j).
