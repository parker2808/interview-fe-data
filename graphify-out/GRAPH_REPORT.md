# Graph Report - interview-fe-data  (2026-11-22)

## Corpus Check
- 200 files · ~834,789 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 5, .css 1)

## Summary
- 877 nodes · 1167 edges · 69 communities (53 shown, 16 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ace3bd93`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- check-plan.mjs
- check-practice.mjs
- check-content.mjs
- audit-vi.mjs
- sync-plan-index.mjs
- sync-kb-index.mjs
- steps
- sync-practice-index.mjs
- steps
- steps
- stats
- package.json
- context-check.sh
- 5. Practice step: `practice/steps/p01.json`
- 3.1 Knowledge base (22 docs, 192 topics)
- 30-day study plan: concise redesign
- 1. Main readability problems
- 1. Learning roadmap
- properties
- books-ci.yml
- PROJECT_CONTEXT — `<private-content-repo>`
- RedisCacheService
- app.module.ts
- Agent rules — interview-fe-data
- interview-fe-data
- CHANGELOG_ARCHIVE.md
- Vietnamese (vi) style guide
- portfolio-design-system.md
- portfolio-design-system.vi.md
- dependencies
- backend-next/package.json
- import-fde-sources.py
- compilerOptions
- NotificationProcessor
- check-fde.mjs
- Backend operations continuation
- 3.2 Q&A (142 items, 13 groups)
- books.e2e.test.ts
- BooksController
- 2. Target format
- 3. Revised 30-day outline
- sync-plan-index.mjs
- Backend learning path from frontend
- 2. Style guide and templates
- README.md
- Nest books operations lab (chapters 9–12)
- tsconfig.build.json
- nest-cli.json
- EditorGuard
- redis-outage.sh
- 2026-11-15-fde-interview-module.md
- 2026-11-15-fde-plan.md
- modules-index.schema.json
- 4. Plan day: `plan/days/day-01.json`
- vi pilot: before / after
- 2. Q&A technical: `css-layout-specificity`
- vi rewrite plan
- items
- 3. Q&A STAR: `monorepo-strategy`
- testScore
- archivedAt
- date
- lastOpenedAt
- purgeAfter
- organizationAlias
- summary
- title

## God Nodes (most connected - your core abstractions)
1. `main()` - 23 edges
2. `3.1 Knowledge base (22 docs, 192 topics)` - 23 edges
3. `1. Main readability problems` - 19 edges
4. `RedisCacheService` - 16 edges
5. `3.2 Q&A (142 items, 13 groups)` - 14 edges
6. `validateModules()` - 13 edges
7. `compilerOptions` - 12 edges
8. `fail()` - 12 edges
9. `PROJECT_CONTEXT — `<private-content-repo>`` - 12 edges
10. `checkDayAlways()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Checks and PRs` --references--> `main()`  [INFERRED]
  AGENTS.md → docs/examples/backend-next/src/inspect.ts
- `Safety and coordination` --references--> `main()`  [INFERRED]
  AGENTS.md → docs/examples/backend-next/src/inspect.ts
- `Start and scope` --references--> `main()`  [INFERRED]
  AGENTS.md → docs/examples/backend-next/src/inspect.ts
- `0. Ground truth (measured on `main` @ `ed0365e`)` --references--> `main()`  [INFERRED]
  plans/kb-qna-rewrite-plan.md → docs/examples/backend-next/src/inspect.ts
- `5. Validation (run on every batch, all must pass)` --references--> `main()`  [INFERRED]
  plans/kb-qna-rewrite-plan.md → docs/examples/backend-next/src/inspect.ts

## Import Cycles
- None detected.

## Communities (69 total, 16 thin omitted)

### Community 0 - "check-plan.mjs"
Cohesion: 0.06
Nodes (52): args, backtickSpans(), BANNED_LABELS, charLen(), checkDayAlways(), checkDayFormat(), collectHeadings(), countBlocks() (+44 more)

### Community 1 - "check-practice.mjs"
Cohesion: 0.06
Nodes (50): args, assertLocalized(), checkBilingualSpec(), checkBudget(), checkDesignFigma(), checkDesignGallery(), checkSpecRef(), checkStep() (+42 more)

### Community 2 - "check-content.mjs"
Cohesion: 0.06
Nodes (49): addLen(), ALLOWED_ALIGN, ALLOWED_BLOCK_TYPES, ALLOWED_CALLOUT_KINDS, ALLOWED_CODE_LANGS, ALLOWED_LIST_STYLES, args, assertLocalized() (+41 more)

### Community 3 - "audit-vi.mjs"
Cohesion: 0.06
Nodes (36): allKeepOrCode(), args, asJson, avoidTerms, byCode, byFile, contentFiles(), diffRef (+28 more)

### Community 4 - "sync-plan-index.mjs"
Cohesion: 0.08
Nodes (36): mime, root, server, shot(), webpSize(), errors, archive(), editFixture() (+28 more)

### Community 5 - "sync-kb-index.mjs"
Cohesion: 0.13
Nodes (19): args, checkOnly, clipSummary(), current, docs, docsBySlug, entryFromDoc(), groups (+11 more)

### Community 6 - "steps"
Cohesion: 0.11
Nodes (18): if, runs-on, steps, BASE, HEAD, jobs, context, name (+10 more)

### Community 7 - "sync-practice-index.mjs"
Cohesion: 0.13
Nodes (14): args, byId, checkOnly, indexPath, loadStepsById(), meta, metaPath, next (+6 more)

### Community 8 - "steps"
Cohesion: 0.13
Nodes (14): jobs, validate, name, on, pull_request, push, branches, name (+6 more)

### Community 9 - "steps"
Cohesion: 0.15
Nodes (12): VERCEL_DEPLOY_HOOK_URL, jobs, vercel, name, on, push, branches, env (+4 more)

### Community 10 - "stats"
Cohesion: 0.15
Nodes (12): extraResources, generatedAt, source, stats, categories, days, docFallbacks, docs (+4 more)

### Community 11 - "package.json"
Cohesion: 0.25
Nodes (8): devDependencies, playwright-core@1.64.1, name, private, scripts, shot, type, playwright-core

### Community 13 - "5. Practice step: `practice/steps/p01.json`"
Cohesion: 0.20
Nodes (10): 5. Practice step: `practice/steps/p01.json`, `concepts[0].explain`, `concepts[2].explain`, `doneWhen[1]`, `pitfalls[0]`, `questionLinks[0].label`, `tasks[0].detail`, `tasks[1].detail` (+2 more)

### Community 14 - "3.1 Knowledge base (22 docs, 192 topics)"
Cohesion: 0.09
Nodes (23): 3.1 Knowledge base (22 docs, 192 topics), accessibility — P2 — batch B23 (5 topics), architecture — P2 — batch B25 (6 topics), build-tools — P3 — batch B28 (3 topics, K8 restructure), css-layout — P2 — batch B23 (7 topics), devops — P3 — batch B28 (5 topics), javascript — P1 — batches B01, B02 (11 topics), leadership — P3 — batch B30 (7 topics) (+15 more)

### Community 15 - "30-day study plan: concise redesign"
Cohesion: 0.25
Nodes (7): 0. Ground truth (measured on `main` @ `77d7171`), 1. Diagnosis (why it reads long-winded), 30-day study plan: concise redesign, 4. Execution batches (one draft PR each, stacked, never merge), 5. Validation (every batch), 6. Removed lab section ids, `scripts/check-plan.mjs` spec (B0)

### Community 16 - "1. Main readability problems"
Cohesion: 0.11
Nodes (19): 1. Main readability problems, K10. Broken links and migration leftovers, K11. `index.json` drifts from the docs, K1. No plain-language explanation; topics open on an expert scenario, K2. Undefined jargon and acronyms (also applies to Q&A), K3. Telegraphic, over-packed bullets, K4. Rigid, redundant template; "key takeaways" are tangents, K5. Orphan follow-up list (+11 more)

### Community 17 - "1. Learning roadmap"
Cohesion: 0.11
Nodes (17): 0. Decisions (fixed, do not re-litigate), 1. Learning roadmap, 2.1 Layout, 2.2 Shapes, 2.3 Validation + CI, 2. Content data model (this repo), 3. App changes (interview-senior-fe), 4. Execution batches (grok-4.6) (+9 more)

### Community 18 - "properties"
Cohesion: 0.13
Nodes (15): type, type, properties, $ref, autoArchive, fixture, level, role (+7 more)

### Community 19 - "books-ci.yml"
Cohesion: 0.06
Nodes (31): runs-on, services, steps, strategy, concurrency, cancel-in-progress, group, MYSQL_ALLOW_EMPTY_PASSWORD (+23 more)

### Community 20 - "PROJECT_CONTEXT — `<private-content-repo>`"
Cohesion: 0.17
Nodes (13): main(), Lessons, 1. Project overview, 2. Confirmed facts, 3. Forbidden / hard rules, 4. Content rules, 5. Workflow, 6. Multi-agent coordination (+5 more)

### Community 21 - "RedisCacheService"
Cohesion: 0.16
Nodes (3): PublicBook, BooksService, RedisCacheService

### Community 22 - "app.module.ts"
Cohesion: 0.16
Nodes (10): BookInputPipe, LocalePipe, RequestWithId, store, CreateBook, createBookSchema, localeSchema, publicBookSchema (+2 more)

### Community 23 - "Agent rules — interview-fe-data"
Cohesion: 0.22
Nodes (7): Agent rules have moved, Agent rules — interview-fe-data, Checks and PRs, Full decision authority, Project and content, Safety and coordination, Start and scope

### Community 24 - "interview-fe-data"
Cohesion: 0.33
Nodes (6): Agent rules, Editing, interview-fe-data, Layout, Redeploy, Validation

### Community 26 - "Vietnamese (vi) style guide"
Cohesion: 0.25
Nodes (8): 1. Tone, 2. Core rules, 3. Fixed strings (CI-enforced, do not rewrite), 4. Punctuation, 5. Preserve structure exactly, 6. Bad → good examples, 7. Self-check per string, Vietnamese (vi) style guide

### Community 30 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, bullmq@^5.0.0, @nestjs/bullmq@^11.0.0, @nestjs/core@^11.0.0, nestjs-pino@^4.0.0, redis@^5.0.0, zod@^4.0.0, BookJob (+5 more)

### Community 31 - "backend-next/package.json"
Cohesion: 0.06
Nodes (42): @nestjs/platform-express@^11.0.0, pino@^9.0.0, pino-http@^10.0.0, rxjs@^7.0.0, devDependencies, eslint@^9.0.0, @eslint/js@^9.0.0, @nestjs/cli@^11.0.0 (+34 more)

### Community 32 - "import-fde-sources.py"
Cohesion: 0.21
Nodes (6): clean(), guess_req(), local(), read_memo(), read_nodes(), speakable()

### Community 33 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, lib, module, moduleResolution, outDir (+5 more)

### Community 35 - "check-fde.mjs"
Cohesion: 0.18
Nodes (10): checkHeadings(), conceptHeadings, counts, errors, file, ids, interviewHeadings, requirements (+2 more)

### Community 36 - "Backend operations continuation"
Cohesion: 0.33
Nodes (5): Acceptance criteria, Backend operations continuation, Revision evidence boundaries, Scope, Verification

### Community 37 - "3.2 Q&A (142 items, 13 groups)"
Cohesion: 0.14
Nodes (14): 3.2 Q&A (142 items, 13 groups), QG-ARCH — P2 — 12 items (B26), QG-CSS-HTML — P2 — 8 items (B24), QG-JS — P1 — 16 items (B01: first 4; B02: next 5; B04: last 7), QG-LIVE — P1 — 5 items (B04), QG-NET-OPS — P2 — 11 items (B27), QG-NEXT — P2 — 8 items (B14; all F style with no followUps), QG-NUXT — P1 — 4 items (B09) (+6 more)

### Community 38 - "books.e2e.test.ts"
Cohesion: 0.21
Nodes (7): @nestjs/common@^11.0.0, reflect-metadata@^0.2.0, AppModule, BooksModule, @nestjs/common, redis, reflect-metadata

### Community 41 - "2. Target format"
Cohesion: 0.25
Nodes (8): 2.1 Principles, 2.2 Plan-tab fields, 2.3 Lab stub (keep the app from crashing), 2.4 What goes where, 2.5 Example day: Day 12 (Plan tab + empty lab), 2.6 Week meta, gaps, resources, 2.7 Effort split, 2. Target format

### Community 42 - "3. Revised 30-day outline"
Cohesion: 0.29
Nodes (7): 3. Revised 30-day outline, Final days (Days 29–30), Topic changes vs the first outline in this file, Week 1 · Design systems + UI clarity (Days 1–7), Week 2 · JS/TS + Vue/Nuxt refresh (Days 8–14), Week 3 · Performance, HTTP, optional React/Next (Days 15–21), Week 4 · System design + behavioral (Days 22–28)

### Community 43 - "sync-plan-index.mjs"
Cohesion: 0.16
Nodes (13): args, checkOnly, daysDir, dayWithoutLab(), indexPath, loadDays(), meta, metaPath (+5 more)

### Community 44 - "Backend learning path from frontend"
Cohesion: 0.29
Nodes (6): Acceptance criteria, Backend learning path from frontend, Plan and verification, Revision after Parker's review (2026-11-10), Scope, Source boundaries

### Community 45 - "2. Style guide and templates"
Cohesion: 0.15
Nodes (12): 0. Ground truth (measured on `main` @ `ed0365e`), 2.1 Voice and depth (both KB and Q&A), 2.2 KB leaf-topic template (each H3/H4 topic that has content), 2.3 Q&A answer template, 2.4 Code example rules, 2.5 Vietnamese rules, 2.6 JSON field conventions (so the site keeps rendering), 2. Style guide and templates (+4 more)

### Community 46 - "README.md"
Cohesion: 0.22
Nodes (6): Contract, Module index plan, Acceptance and named checks, Archived modules in the private data tree, Reviewed removal, Shape and validation

### Community 47 - "Nest books operations lab (chapters 9–12)"
Cohesion: 0.50
Nodes (3): Nest books operations lab (chapters 9–12), Review-only quality gate, Run in a disposable copy

### Community 48 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 54 - "modules-index.schema.json"
Cohesion: 0.22
Nodes (8): type, properties, modules, version, required, $schema, type, const

### Community 55 - "4. Plan day: `plan/days/day-01.json`"
Cohesion: 0.25
Nodes (8): 4. Plan day: `plan/days/day-01.json`, `algorithm.label`, `checklist[0]`, `checklist[1]`, `checklist[2]`, `goal`, `handsOn[0]`, `handsOn[1]`

### Community 56 - "vi pilot: before / after"
Cohesion: 0.33
Nodes (4): 1. KB topic: `knowledge-base/build-tools.json` intro section, `sections[0].blocks[1].text`, `sections[0].blocks[2].text`, vi pilot: before / after

### Community 57 - "2. Q&A technical: `css-layout-specificity`"
Cohesion: 0.29
Nodes (7): 2. Q&A technical: `css-layout-specificity`, `questions[id=css-layout-specificity].answer`, `questions[id=css-layout-specificity].example`, `questions[id=css-layout-specificity].followUps[0]`, `questions[id=css-layout-specificity].followUps[1]`, `questions[id=css-layout-specificity].followUps[2]`, `questions[id=css-layout-specificity].question`

### Community 58 - "vi rewrite plan"
Cohesion: 0.29
Nodes (7): 1. Inventory, 2. Heuristic audit script (spec), 3. Batches (30, for grok-4.6), 4. Validation checklist (each batch), 5. Pilot set (5 items), 6. Open decision for the user, vi rewrite plan

### Community 59 - "items"
Cohesion: 0.29
Nodes (7): allOf, required, type, items, tags, items, type

### Community 60 - "3. Q&A STAR: `monorepo-strategy`"
Cohesion: 0.33
Nodes (6): 3. Q&A STAR: `monorepo-strategy`, `questions[id=monorepo-strategy].answer`, `questions[id=monorepo-strategy].example`, `questions[id=monorepo-strategy].followUps[0]`, `questions[id=monorepo-strategy].followUps[2]`, `questions[id=monorepo-strategy].question`

### Community 61 - "testScore"
Cohesion: 0.50
Nodes (4): testScore, maximum, minimum, type

### Community 62 - "archivedAt"
Cohesion: 0.67
Nodes (3): format, type, archivedAt

### Community 63 - "date"
Cohesion: 0.67
Nodes (3): format, type, date

### Community 64 - "lastOpenedAt"
Cohesion: 0.67
Nodes (3): format, type, lastOpenedAt

### Community 65 - "purgeAfter"
Cohesion: 0.67
Nodes (3): purgeAfter, format, type

## Knowledge Gaps
- **1 isolated node(s):** `./tsconfig.json`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 486 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `main()` connect `PROJECT_CONTEXT — `<private-content-repo>`` to `3. Revised 30-day outline`, `Backend learning path from frontend`, `2. Style guide and templates`, `30-day study plan: concise redesign`, `1. Learning roadmap`, `Agent rules — interview-fe-data`, `interview-fe-data`, `vi rewrite plan`, `dependencies`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `main()` (e.g. with `Checks and PRs` and `Safety and coordination`) actually correct?**
  _`main()` has 22 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./tsconfig.json` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `check-plan.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06397306397306397 - nodes in this community are weakly interconnected._
- **Why does `bullmq` connect `dependencies` to `app.module.ts`, `backend-next/package.json`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Should `check-practice.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06313497822931785 - nodes in this community are weakly interconnected._
- **Why does `KB + Q&A readability rewrite plan` connect `2. Style guide and templates` to `1. Main readability problems`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._