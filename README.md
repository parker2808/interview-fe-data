# interview-fe-data

Private source of truth for [interview-senior-fe](https://github.com/parker2808/interview-senior-fe).
The public Nuxt app downloads this tree **at build time** (never into client JS) and serves it through APIs.

Locale toggle is instant because every user-facing string is `{ "en", "vi" }`.

The [modules index](modules/index.json) lists the existing FDE pack without moving it and one explicitly fictional frontend fixture. New version 2 modules live in `modules/<slug>.json`. Each row records whether the module is active or archived; archived modules are hidden by default in the app. A future removal can delete one module file and regenerate the index without touching the FDE source. The [module contract](docs/specs/2026-11-15-modules-index.md) explains the fields and the fixture.

The [archive contract](docs/specs/module-archive.md) makes that removal reviewable. An archived module needs ISO-8601 `archivedAt` and `purgeAfter` timestamps exactly seven days apart in both the file and its index row. Optional `autoArchive` (boolean) and `lastOpenedAt` (ISO-8601 timestamp) are mirrored too. The validator rejects active modules with archive dates, invalid timestamps, mismatched rows, and missing files. Consumers can call `defaultModules(index)` from `scripts/modules-index.mjs` to hide archived rows while keeping active FDE visible. For example, an archived fictional application remains available in the full index for restore but disappears from the default list.

To propose the Phase 1 file removal, run `node scripts/remove-module.mjs <slug> --dry-run`, review the result, and then run it without `--dry-run` on an approved archived module. It removes only that module file and its index row; it refuses FDE, active modules, and unsafe slugs. Exit 0 means success or already removed, exit 2 means refused input, and exit 1 means an input/output failure. The script does not commit, push, or open a pull request, and it never changes knowledge-base (KB) entries. Deletion from the current tree does not erase Git history, so do not put sensitive JD or CV contents in Git without a separate retention review.

The optional [FDE interview module](fde/fde-prep.json) is a separate bilingual collection for live interview lookup. It contains a JD map, 40 deep concepts, interview answers (I1-I33, J1-J12, B1-B14, R1-R12 and A1-A15), pitch, rescue phrases, interviewer questions and a one-screen cheat sheet. The reviewed explanations expand the supplied JD and locally imported study pack by hand; Monday/Evolve and GCP implementations are proposals or general knowledge, not shipped project claims. The importer refuses to overwrite reviewed content; use `python3 scripts/import-fde-sources.py /path/to/fde-src --output /tmp/fde-import.json` for a raw comparison. The app consumes the collection through a Nitro endpoint. Merge this data PR before the paired app PR, with Parker's approval; do not merge or deploy automatically. Run `node scripts/check-fde.mjs .` after edits.

External API claims were cross-checked against primary docs: [Monday board-item pagination](https://developer.monday.com/api-reference/docs/querying-board-items) and [rate limits](https://developer.monday.com/api-reference/docs/rate-limits), [Gmail push](https://developers.google.com/workspace/gmail/api/guides/push) and [history synchronization](https://developers.google.com/workspace/gmail/api/guides/sync), and [Cloud Run scheduled services](https://docs.cloud.google.com/run/docs/triggering/using-scheduler). The Monday API version and Evolve interface must be confirmed with the client; this material is not an integration specification.

The [backend learning guide](knowledge-base/backend-learning.json) adds the 23rd catalog topic in Infrastructure (22 on `main`): `/docs/en/backend-learning` and `/docs/vi/backend-learning` after the app pulls this content branch. Its eight connected EN/VI core chapters (HTTP/Node, Nest, Zod, MySQL, Prisma, auth, tests, Docker) use a staged toy reading-list API, source evidence, expected outputs, worked questions and guided exercises; optional operations follow. Chapter 5 records outputs observed in a disposable local Node 22 / Prisma 7.10.1 / MySQL 8.4 Compose lab; these are not production verification. It does not replace the 30-day frontend plan. See the [revision criteria](docs/specs/2026-11-10-backend-learning-path.md); PR #65 is paired with app PR #43 and neither may be merged or deployed independently.

A stacked follow-up adds bilingual chapters 9–12 inside that same guide: Redis cache-aside, BullMQ workers, Pino/probes, and review-only CI/CD. The [Nest TypeScript books fixture](docs/examples/backend-next/) extends the chapter-8 memory app (`/api/books`, port 3000, Zod, Vitest/Supertest, non-root image); it does not connect Prisma/MySQL or a real notification provider. Its [revision criteria](docs/specs/2026-11-10-backend-next-steps.md) distinguish observed local output from unrun telemetry, workflow and production examples. The catalog topic count and app contract do not change; do not merge this follow-up before PR #65 and app PR #43. None of these documentation branches authorizes a deploy.

## Layout

```text
fde/fde-prep.json             # FDE interview collection (bilingual)
knowledge-base/<slug>.json     # one bilingual doc
knowledge-base/index.json      # generated catalog + headings for search
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
node scripts/check-modules.mjs .
node scripts/sync-modules-index.mjs --check
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
