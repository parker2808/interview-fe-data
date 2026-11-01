# Graph Report - interview-fe-data  (2026-11-01)

## Corpus Check
- 164 files · ~664,585 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 546 nodes · 682 edges · 30 communities (24 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5d5a5a93`
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
- 4. Plan day: `plan/days/day-01.json`
- 3.1 Knowledge base (22 docs, 192 topics)
- 2. Target format
- 1. Main readability problems
- 1. Learning roadmap
- 3.2 Q&A (142 items, 13 groups)
- validate.mjs
- PROJECT_CONTEXT — `<private-content-repo>`
- 5. Practice step: `practice/steps/p01.json`
- screenshot.mjs
- Agent rules — interview-fe-data
- interview-fe-data
- CHANGELOG_ARCHIVE.md
- LESSONS.md
- portfolio-design-system.md
- portfolio-design-system.vi.md

## God Nodes (most connected - your core abstractions)
1. `3.1 Knowledge base (22 docs, 192 topics)` - 23 edges
2. `1. Main readability problems` - 19 edges
3. `3.2 Q&A (142 items, 13 groups)` - 14 edges
4. `fail()` - 12 edges
5. `checkDayAlways()` - 11 edges
6. `fail()` - 10 edges
7. `PROJECT_CONTEXT — `<private-content-repo>`` - 10 edges
8. `5. Practice step: `practice/steps/p01.json`` - 10 edges
9. `stats` - 9 edges
10. `checkDayFormat()` - 9 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (30 total, 6 thin omitted)

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
Cohesion: 0.16
Nodes (13): args, checkOnly, daysDir, dayWithoutLab(), indexPath, loadDays(), meta, metaPath (+5 more)

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

### Community 13 - "4. Plan day: `plan/days/day-01.json`"
Cohesion: 0.05
Nodes (40): 1. KB topic: `knowledge-base/build-tools.json` intro section, 2. Q&A technical: `css-layout-specificity`, 3. Q&A STAR: `monorepo-strategy`, 4. Plan day: `plan/days/day-01.json`, `algorithm.label`, `checklist[0]`, `checklist[1]`, `checklist[2]` (+32 more)

### Community 14 - "3.1 Knowledge base (22 docs, 192 topics)"
Cohesion: 0.06
Nodes (35): 0. Ground truth (measured on `main` @ `ed0365e`), 2.1 Voice and depth (both KB and Q&A), 2.2 KB leaf-topic template (each H3/H4 topic that has content), 2.3 Q&A answer template, 2.4 Code example rules, 2.5 Vietnamese rules, 2.6 JSON field conventions (so the site keeps rendering), 2. Style guide and templates (+27 more)

### Community 15 - "2. Target format"
Cohesion: 0.09
Nodes (22): 0. Ground truth (measured on `main` @ `77d7171`), 1. Diagnosis (why it reads long-winded), 2.1 Principles, 2.2 Plan-tab fields, 2.3 Lab stub (keep the app from crashing), 2.4 What goes where, 2.5 Example day: Day 12 (Plan tab + empty lab), 2.6 Week meta, gaps, resources (+14 more)

### Community 16 - "1. Main readability problems"
Cohesion: 0.11
Nodes (19): 1. Main readability problems, K10. Broken links and migration leftovers, K11. `index.json` drifts from the docs, K1. No plain-language explanation; topics open on an expert scenario, K2. Undefined jargon and acronyms (also applies to Q&A), K3. Telegraphic, over-packed bullets, K4. Rigid, redundant template; "key takeaways" are tangents, K5. Orphan follow-up list (+11 more)

### Community 17 - "1. Learning roadmap"
Cohesion: 0.11
Nodes (17): 0. Decisions (fixed, do not re-litigate), 1. Learning roadmap, 2.1 Layout, 2.2 Shapes, 2.3 Validation + CI, 2. Content data model (this repo), 3. App changes (interview-senior-fe), 4. Execution batches (grok-4.6) (+9 more)

### Community 18 - "3.2 Q&A (142 items, 13 groups)"
Cohesion: 0.14
Nodes (14): 3.2 Q&A (142 items, 13 groups), QG-ARCH — P2 — 12 items (B26), QG-CSS-HTML — P2 — 8 items (B24), QG-JS — P1 — 16 items (B01: first 4; B02: next 5; B04: last 7), QG-LIVE — P1 — 5 items (B04), QG-NET-OPS — P2 — 11 items (B27), QG-NEXT — P2 — 8 items (B14; all F style with no followUps), QG-NUXT — P1 — 4 items (B09) (+6 more)

### Community 19 - "validate.mjs"
Cohesion: 0.18
Nodes (11): days, errors, fail(), kb, listJsonFiles(), MIN_CATEGORY_COUNTS, practiceStepsDir, qnaPath (+3 more)

### Community 20 - "PROJECT_CONTEXT — `<private-content-repo>`"
Cohesion: 0.18
Nodes (10): 1. Project overview, 2. Confirmed facts, 3. Forbidden / hard rules, 4. Content rules, 5. Workflow, 6. Multi-agent coordination, 7. Future work, 8. Open items / status (+2 more)

### Community 21 - "5. Practice step: `practice/steps/p01.json`"
Cohesion: 0.20
Nodes (10): 5. Practice step: `practice/steps/p01.json`, `concepts[0].explain`, `concepts[2].explain`, `doneWhen[1]`, `pitfalls[0]`, `questionLinks[0].label`, `tasks[0].detail`, `tasks[1].detail` (+2 more)

### Community 22 - "screenshot.mjs"
Cohesion: 0.25
Nodes (5): mime, root, server, shot(), webpSize()

### Community 23 - "Agent rules — interview-fe-data"
Cohesion: 0.25
Nodes (6): Agent rules have moved, Agent rules — interview-fe-data, Checks and PRs, Project and content, Safety and coordination, Start and scope

### Community 24 - "interview-fe-data"
Cohesion: 0.33
Nodes (5): Editing, interview-fe-data, Layout, Redeploy, Validation

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playwright-core` connect `package.json` to `screenshot.mjs`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Should `check-plan.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06397306397306397 - nodes in this community are weakly interconnected._
- **Why does `3. Checklist (every KB doc and every Q&A item)` connect `3.1 Knowledge base (22 docs, 192 topics)` to `3.2 Q&A (142 items, 13 groups)`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `check-practice.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06313497822931785 - nodes in this community are weakly interconnected._
- **Why does `KB + Q&A readability rewrite plan` connect `3.1 Knowledge base (22 docs, 192 topics)` to `1. Main readability problems`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Should `check-content.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `audit-vi.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._