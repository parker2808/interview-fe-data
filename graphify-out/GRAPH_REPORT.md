# Graph Report - interview-fe-data  (2026-10-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 348 nodes · 495 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6fbdfcb5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12

## God Nodes (most connected - your core abstractions)
1. `fail()` - 12 edges
2. `checkDayAlways()` - 11 edges
3. `fail()` - 10 edges
4. `checkDayFormat()` - 9 edges
5. `stats` - 9 edges
6. `walkLocalized()` - 8 edges
7. `checkDesignGallery()` - 8 edges
8. `flattenDayStrings()` - 7 edges
9. `checkStep()` - 7 edges
10. `walkLocalized()` - 7 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (13 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (52): args, backtickSpans(), BANNED_LABELS, charLen(), checkDayAlways(), checkDayFormat(), collectHeadings(), countBlocks() (+44 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (50): args, assertLocalized(), checkBilingualSpec(), checkBudget(), checkDesignFigma(), checkDesignGallery(), checkSpecRef(), checkStep() (+42 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (49): addLen(), ALLOWED_ALIGN, ALLOWED_BLOCK_TYPES, ALLOWED_CALLOUT_KINDS, ALLOWED_CODE_LANGS, ALLOWED_LIST_STYLES, args, assertLocalized() (+41 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (36): allKeepOrCode(), args, asJson, avoidTerms, byCode, byFile, contentFiles(), diffRef (+28 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (29): mime, root, server, shot(), webpSize(), args, checkOnly, daysDir (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (19): args, checkOnly, clipSummary(), current, docs, docsBySlug, entryFromDoc(), groups (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (18): if, runs-on, steps, BASE, HEAD, jobs, context, name (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (14): args, byId, checkOnly, indexPath, loadStepsById(), meta, metaPath, next (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (14): jobs, validate, name, on, pull_request, push, branches, name (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (12): VERCEL_DEPLOY_HOOK_URL, jobs, vercel, name, on, push, branches, env (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (12): extraResources, generatedAt, source, stats, categories, days, docFallbacks, docs (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (8): devDependencies, playwright-core@1.64.1, name, private, scripts, shot, type, playwright-core

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playwright-core` connect `Community 11` to `Community 4`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06397306397306397 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06313497822931785 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.06984126984126984 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.12631578947368421 - nodes in this community are weakly interconnected._