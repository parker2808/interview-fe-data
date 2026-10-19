# vi rewrite plan

Goal: rewrite every `vi` string from its `en` source so it reads like natural Vietnamese, following [`vi-style-guide.md`](./vi-style-guide.md) and [`vi-glossary.json`](./vi-glossary.json). Executor: grok-4.6, one batch per run. Review the pilot ([`vi-pilot.md`](./vi-pilot.md)) before starting the batches.

## 1. Inventory

Counts are Localized `{en, vi}` strings and the total length of their `vi` values (JSON-escaped characters). Measured on `main` @ `8f07bce`. `mockups/` and `plans/*.md` are out of scope (no Localized strings).

| Area | Files | Strings | vi chars | Main vi fields (count) |
| --- | --- | ---: | ---: | --- |
| Knowledge base docs | `knowledge-base/<slug>.json` (22) | 7,378 | ~905k | `blocks[].text` (1,830), list `items[]` (1,460), table `rows[][]` (2,180) and `headers[]` (560), `blocks[].code` (183, comments only), `blocks[].label` (772), `title`, `summary` |
| Q&A bank | `qna/questions.json` (142 q: 86 technical, 29 soft, 27 situational) | 852 | ~351k | `answer` (142), `example` (142), `followUps[]` (426), `question` (142) |
| Q&A categories | `qna/categories.json` | 6 | ~0.3k | `title`, `blurb` |
| Plan days | `plan/days/day-01..30.json` | 465 | ~17k | `title`, `goal`, `handsOn[]`, `checklist[]`, link `label`s, `algorithm.label`, `lab.title` (fixed) |
| Plan algo resources | `plan/resources/algo-day-01..30.json` | 1,496 | ~34k | `sections[].title`, `blocks[].text`, `items[]`, `rows[][]`, `blocks[].code` |
| Plan other | `plan/meta.json`, `plan/resources/{algo,context,dod,feature,lab,plan,react,selfcheck,index}.json` | 677 | ~24k | `blocks[].text`, `items[]`, `rows[][]`, `outcomes[]`, `weeks[].goal` |
| Practice steps | `practice/steps/p01..p33.json` | 680 | ~44k | `tasks[].detail` (106), `concepts[].explain` (102), `tasks[].title`, `doneWhen[]`, `pitfalls[]`, `summary` |
| Practice meta | `practice/meta.json` | 26 | ~2k | `intro`, `milestones[].{title,goal,outcome}` |
| Design catalog | `practice/design/index.json` | 32 | ~2k | `screens[].{title,caption}`, `intro`, `figma.{label,note}` |
| **Generated, do not edit** | `knowledge-base/index.json`, `plan/index.json`, `practice/index.json` | 1,248 | ~50k | rebuilt by `sync-*-index.mjs` |

Never edit: any `id`/`id.vi`/`sections[].id.vi`, `slug`, `kind`, `path`, `resourceId`, `tags`, `practice/steps/*.tasks[].code.text`, `commit`, `specRefs`.

## 2. Heuristic audit script (spec)

`scripts/audit-vi.mjs` (to be written by the first batch, ~100 lines, no deps). Report-only by default, `--strict` exits 1 on any `error`.

**Input:** repo root, `plans/vi-glossary.json`. Walks the same JSON files as `check-content.mjs`, skipping the three generated `index.json` files. For every Localized object, checks `vi` (and compares with `en`).

**Flags:**

| Code | Level | Rule |
| --- | --- | --- |
| `EM_DASH` | error | `vi` contains `—` (except `^Ngày \d+ — Lab$`), or ` – ` used as a dash (space on both sides) |
| `AVOID_TERM` | warn | `vi` contains any glossary `avoid` string (case-sensitive, from `terms.*.avoid`) |
| `TRANSLATED_KEEP` | warn | en contains a `keep:true` term (word boundary) and `vi` doesn't, while `vi` contains that term's `avoid` string |
| `FIRST_PERSON` | warn | `Tôi`/`tôi`/`chúng tôi` in Q&A `example`, or in `> ` lines of `answer` |
| `PERIOD_IN_QUOTE` | warn | `[.,]”` in `vi` |
| `CODE_DRIFT` | error | multiset of inline `` `code` `` spans differs between en and vi |
| `LINK_DRIFT` | error | list of link targets `](...)` differs between en and vi |
| `MD_DRIFT` | error | counts differ for fences, list lines, `**…:**` labels, `> ` lines, table pipes per line |
| `LEN_RATIO` | warn | vi/en word ratio outside 0.7–1.5 for strings with en ≥ 12 words |
| `UNCHANGED` | info | `vi === en` for strings with en ≥ 4 words that aren't all `keep` terms/code |

**Output:** one line per hit, `file:jsonPath CODE snippet(60 chars)`, then a summary table per file and per code. `--json` writes the same to stdout as JSON for diffing before/after a batch. `--files a,b` limits the scope to one batch.

Baseline today: `EM_DASH` ~1,750 strings (KB 1,044, Q&A 458, plan 215, practice 31); top `AVOID_TERM` hits are ` cộng ` (405), `sở hữu` (298), `thực sự` (230), `hợp đồng` (102), `Gọi ` (80), `đồng hồ` (55), `béo` (37), `bề mặt` (35). `Tôi` appears 627 times (mostly spoken scripts).

## 3. Batches (30, for grok-4.6)

Target ~30–55k vi chars per batch. KB docs over ~65k are split by `sections[]` index (first half / second half).

| # | Scope | ~vi chars |
| --- | --- | ---: |
| B01 | Write `scripts/audit-vi.mjs` + run baseline; apply the pilot (§5) to the repo | - |
| B02 | `knowledge-base/react.json` sections first half | 51k |
| B03 | `knowledge-base/react.json` sections second half | 51k |
| B04 | `knowledge-base/vue3.json` first half | 49k |
| B05 | `knowledge-base/vue3.json` second half | 49k |
| B06 | `knowledge-base/nextjs.json` first half | 35k |
| B07 | `knowledge-base/nextjs.json` second half | 35k |
| B08 | `knowledge-base/typescript.json` | 62k |
| B09 | `knowledge-base/javascript.json` | 61k |
| B10 | `knowledge-base/performance.json` | 41k |
| B11 | `knowledge-base/state-management-react.json` | 38k |
| B12 | `knowledge-base/state-management.json` | 34k |
| B13 | `knowledge-base/security.json` | 33k |
| B14 | `knowledge-base/practical-questions.json` | 33k |
| B15 | `knowledge-base/web-apis.json` | 33k |
| B16 | `knowledge-base/css-layout.json` | 33k |
| B17 | `knowledge-base/nuxt.json` | 32k |
| B18 | `knowledge-base/testing.json` | 31k |
| B19 | `knowledge-base/architecture.json` | 31k |
| B20 | `knowledge-base/leadership.json` | 31k |
| B21 | `knowledge-base/networking.json` + `build-tools.json` | 46k |
| B22 | `knowledge-base/system-design.json` + `accessibility.json` | 49k |
| B23 | `knowledge-base/monitoring.json` + `devops.json` | 48k |
| B24 | `qna/questions.json` questions[0..23] + `qna/categories.json` | ~57k |
| B25 | `qna/questions.json` questions[24..47] | ~57k |
| B26 | `qna/questions.json` questions[48..71] | ~57k |
| B27 | `qna/questions.json` questions[72..95] | ~57k |
| B28 | `qna/questions.json` questions[96..119] | ~57k |
| B29 | `qna/questions.json` questions[120..141] | ~57k |
| B30 | `plan/` (days, meta, all resources) + `practice/` (meta, steps, design) | ~123k, split into B30a plan and B30b practice if the run truncates |

**Per-batch prompt (paste into each run):** "Read `plans/vi-style-guide.md` and `plans/vi-glossary.json`. For every Localized object in <scope>, rewrite only the `vi` value from the `en` value. Do not touch keys, `en`, ids, code text, or anything outside <scope>. Then run the validation checklist and fix failures. One commit per batch: `content(vi): rewrite <scope> (Bxx)`."

Batches are independent except B01 (audit script) first. Run the sync scripts after each batch that touches KB, plan, or practice.

## 4. Validation checklist (each batch)

1. `git diff --stat` shows only files in the batch scope (plus regenerated `index.json`). Keep each file's existing formatting: replace `vi` string values in place, or serialize the same way the file is written today (some files use inline arrays like `"tags": ["a", "b"]`; a plain `JSON.stringify(j, null, 2)` reflows them and adds noise to the diff).
2. **Only vi changed:** a diff script loads old/new JSON, strips every `vi` value, and asserts deep equality (keys, order, `en`, ids, numbers, code). Spec: `node scripts/audit-vi.mjs --diff-only-vi <base-ref>`; until it exists, `git diff -U0 | grep '^[-+] ' | grep -v '"vi":'` must be empty (ignoring the `index.json` files).
3. `node scripts/audit-vi.mjs --strict --files <scope>`: zero `error` flags; `warn` count lower than baseline, with the remaining ones justified in the PR.
4. Regenerate and check: `node scripts/sync-kb-index.mjs`, `node scripts/sync-plan-index.mjs`, `node scripts/sync-practice-index.mjs --check` (after running it without `--check`).
5. CI scripts pass: `node scripts/validate.mjs .`, `node scripts/check-content.mjs .`, `node scripts/check-plan.mjs . --strict`, `node scripts/check-practice.mjs . --strict`.
6. Spot-read 10 random strings from the batch against the style-guide self-check (§7). Paste 3 before/after pairs in the PR body.
7. Fixed strings intact (style guide §3): Q&A labels, `Ngày N — Lab`, `thành lời` / `60 giây`, KB-title link labels, STAR step names.

## 5. Pilot set (5 items)

Before/after in [`vi-pilot.md`](./vi-pilot.md). Not yet applied to the JSON; B01 applies it after approval.

| # | Type | Item | Why it's representative |
| --- | --- | --- | --- |
| 1 | KB topic | `knowledge-base/build-tools.json` `sections[0]` (intro) | Doc intro prose with bold, inline code, version facts |
| 2 | Q&A technical | `css-layout-specificity` | Fixed technical labels, idioms (hammer, force field, knob), spoken script, code block with vi comments |
| 3 | Q&A STAR | `monorepo-strategy` | Soft labels, STAR `example` with the approved Button padding sentence, `mình/bọn mình` |
| 4 | Plan day | `plan/days/day-01.json` | Length budgets, fixed `thành lời`/`60 giây`, fixed lab title, KB-title labels |
| 5 | Practice step | `practice/steps/p01.json` | Task details, concepts, pitfalls. Already close to good, shows the "light touch" end of the range |

## 6. Open decision for the user

STAR labels in the approved example are bold (`**Situation:**`), but the en `example` fields use plain `Situation:`. `check-content.mjs` requires equal `**…:**` counts, so vi-only bold fails CI. The pilot keeps plain labels. If bold is preferred, add a pre-batch step that bolds the four STAR labels in en `example` fields too.
