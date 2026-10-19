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
plan/days/day-XX.json          # day plan + lab blocks
plan/resources/<id>.json       # lab-repo, project-context, algo-day-XX, …
qna/categories.json
qna/questions.json             # single bank (142 questions). Do not split — the
                               # public app loader only reads this file.
schema/                        # JSON Schema for Localized + blocks
scripts/validate.mjs           # fails on missing en/vi; also checks Q&A counts
scripts/check-content.mjs      # schema, anchors, vi/en parity, migration status
scripts/sync-kb-index.mjs      # rebuild knowledge-base/index.json from the docs
```

## Editing

1. Change only the JSON you need. Do not drop `en` or `vi`.
2. Keep block types: `heading`, `paragraph`, `list`, `callout`, `code`, `table`, `senior-answer`, `key-takeaways`, `markdown`, `thematic-break`.
3. Inline emphasis, links, and anchors stay as markdown inside `text` / list `items`.
4. Heading `id` is per locale so in-doc hashes (`#211-interface-vs-type`) keep working.
5. Run validation before opening a PR:

```bash
node scripts/validate.mjs .
node scripts/check-content.mjs .
```

`check-content.mjs` also runs `sync-kb-index.mjs --check`. After editing a knowledge-base doc, regenerate the catalog:

```bash
node scripts/sync-kb-index.mjs
```

A later PR can rewrite the prose for readability. This repo is the format + content home; do not keep a second copy in the public app.

## Validation

`scripts/validate.mjs` walks every JSON object that looks like `{ en, vi }` and exits non-zero if either side is missing or blank. It also fails if `qna/questions.json` drops below 142 questions (or below the per-category floors: soft 29, technical 86, situational 27) and prints the live counts.

`scripts/check-content.mjs` checks block schema, heading-id uniqueness, in-KB anchors (same locale), Q&A shape, en/vi markdown parity, and rewrite-migration status (`KB migrated X/192, Q&A migrated Y/142`). Pass `--strict` only on the final pass, when every topic and question has been rewritten. GitHub Actions runs `validate.mjs` and `check-content.mjs` on every PR and push.

`scripts/sync-kb-index.mjs` rebuilds each `docs[]` and `groups[].topics[]` entry from the matching knowledge-base file: `slug`, `title`, `category`, `order`, `tags`, a clipped `summary` (219 chars + `…` when longer than 220), and level-2/3 `headings`. It keeps `groups` order and `defaultSlug`. `--check` exits non-zero if the file would change.

Keep Q&A in **one** `qna/questions.json`. `interview-senior-fe` `server/utils/contentStore.ts` and `scripts/validate-content.mjs` only load that path — splitting into `qna/technical.json` etc. would silently drop questions until the app loader changes.

## Redeploy

Pushing `main` calls the Vercel Deploy Hook in the `VERCEL_DEPLOY_HOOK_URL` secret so the public site rebuilds and pulls this ref.

Parker must create that hook in Vercel and add the secret here (the agent cannot).
