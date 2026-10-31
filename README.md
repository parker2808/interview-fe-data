# interview-fe-data

Private source of truth for [interview-senior-fe](https://github.com/parker2808/interview-senior-fe).
The public Nuxt app downloads this tree **at build time** (never into client JS) and serves it through APIs.

Locale toggle is instant because every user-facing string is `{ "en", "vi" }`.

## Layout

```text
knowledge-base/<slug>.json     # one bilingual doc
knowledge-base/index.json      # catalog + headings for search
plan/meta.json                 # weeks, gaps, resource index
plan/index.json                # meta + day summaries
plan/days/day-XX.json          # Plan-tab day (lab.sections is an empty stub)
plan/resources/<id>.json       # plan overview, context, algo-day-XX, lab notice, …
practice/meta.json             # practice intro + 8 milestones → step ids
practice/index.json            # GENERATED: meta + step summaries
practice/steps/pXX.json        # one bilingual build step (p01–p33)
practice/design/index.json     # design gallery catalog (bilingual captions)
practice/design/screens/*.webp # frozen mockup screenshots (1x WebP)
qna/categories.json
qna/questions.json             # single bank (142 questions). Do not split — the
                               # public app loader only reads this file.
schema/                        # JSON Schema for Localized + blocks + practice
scripts/validate.mjs           # fails on missing en/vi; also checks Q&A counts
scripts/check-content.mjs      # schema, anchors, vi/en parity, migration status
scripts/sync-kb-index.mjs      # rebuild knowledge-base/index.json from the docs
scripts/check-plan.mjs         # 30-day plan: links, budgets, empty lab stub
scripts/sync-plan-index.mjs    # rebuild plan/index.json from meta + day files
scripts/check-practice.mjs     # practice: links, budgets, prereq graph, PII
scripts/sync-practice-index.mjs # rebuild practice/index.json from meta + steps
```

## Editing

For local commit guardrails, enable the tracked hook once per clone:

```bash
git config core.hooksPath .githooks
```

The hook blocks commits on `main` or `master` and scans staged changes with gitleaks when installed.

1. Change only the JSON you need. Do not drop `en` or `vi`.
2. Keep block types: `heading`, `paragraph`, `list`, `callout`, `code`, `table`, `senior-answer`, `key-takeaways`, `markdown`, `thematic-break`.
3. Inline emphasis, links, and anchors stay as markdown inside `text` / list `items`.
4. Heading `id` is per locale so in-doc hashes (`#211-interface-vs-type`) keep working.
5. Run validation before opening a PR:

```bash
node scripts/validate.mjs .
node scripts/check-content.mjs .
node scripts/check-plan.mjs . --strict
node scripts/sync-plan-index.mjs --check
node scripts/check-practice.mjs . --strict
node scripts/sync-practice-index.mjs --check
```

`check-content.mjs` also runs `sync-kb-index.mjs --check`. After editing a knowledge-base doc, regenerate the catalog:

```bash
node scripts/sync-kb-index.mjs
```

After editing `plan/days` or `plan/meta.json`, regenerate the plan index:

```bash
node scripts/sync-plan-index.mjs
```

After editing `practice/`, regenerate the practice index:

```bash
node scripts/sync-practice-index.mjs
```

`check-plan.mjs --lookup slug#en-id` prints the vi heading id. `--days 1-7 --strict` applies format rules only to that range. `--stats` prints per-day word and byte counts. GitHub Actions runs `check-plan.mjs --strict`.

A later PR can rewrite the prose for readability. This repo is the format + content home; do not keep a second copy in the public app.

## Validation

`scripts/validate.mjs` walks every JSON object that looks like `{ en, vi }` and exits non-zero if either side is missing or blank. It also fails if `qna/questions.json` drops below 142 questions (or below the per-category floors: soft 29, technical 86, situational 27) and prints the live counts.

`scripts/check-content.mjs` checks block schema, heading-id uniqueness, in-KB anchors (same locale), Q&A shape, en/vi markdown parity, and rewrite-migration status (`KB migrated X/192, Q&A migrated Y/142`). Pass `--strict` only on the final pass, when every topic and question has been rewritten. GitHub Actions runs `validate.mjs`, `check-content.mjs`, `check-plan.mjs --strict`, `check-practice.mjs --strict`, and `sync-practice-index.mjs --check` on every PR and push.

`scripts/check-plan.mjs` checks the 30 day files: week ranges, study/Q&A ids, empty `lab.sections` (the Lab tab is retired; keep a stub so the app still parses), no calendar dates, and Plan-tab length budgets (`--strict`). `scripts/sync-plan-index.mjs` rebuilds `plan/index.json` from `plan/meta.json` plus each day file without `lab`. `--check` exits non-zero if the file would change.

`scripts/check-practice.mjs` checks `practice/meta.json` and `practice/steps/pXX.json`: ids `p01`–`p33` are unique and contiguous, `order` and `milestone` match meta, prereqs exist and come earlier, KB slugs and Q&A ids resolve, budgets (3–6 tasks, 1–4 done-when, 1–3 pitfalls) pass under `--strict`, commits match `feat|fix|chore|docs|test|perf|refactor`, and no email or phone strings appear. `draft: true` on meta allows a missing suffix of step files so later batches can land on top. It also checks `practice/design/index.json`: screen files exist, ids are unique and in public-then-admin order, `specRefs` match `§N` / `§N.M` headings in `plans/portfolio-design-system.md`, width/height match the WebP, and an optional `figma` object (if present) has an `https://www.figma.com/` URL plus bilingual label/note. `scripts/sync-practice-index.mjs` rebuilds `practice/index.json` from meta plus each step summary. `--check` exits non-zero if the file would change. `--stats` prints step counts per milestone.

`scripts/sync-kb-index.mjs` rebuilds each `docs[]` and `groups[].topics[]` entry from the matching knowledge-base file: `slug`, `title`, `category`, `order`, `tags`, a clipped `summary` (219 chars + `…` when longer than 220), and level-2/3 `headings`. It keeps `groups` order and `defaultSlug`. `--check` exits non-zero if the file would change.

Keep Q&A in **one** `qna/questions.json`. `interview-senior-fe` `server/utils/contentStore.ts` and `scripts/validate-content.mjs` only load that path — splitting into `qna/technical.json` etc. would silently drop questions until the app loader changes.

## Redeploy

Pushing `main` calls the Vercel Deploy Hook in the `VERCEL_DEPLOY_HOOK_URL` secret so the public site rebuilds and pulls this ref.

Parker must create that hook in Vercel and add the secret here (the agent cannot).
