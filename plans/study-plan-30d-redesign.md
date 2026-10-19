# 30-day study plan: concise redesign

**Status:** source of truth for execution (B0–B6). Lab tab is **removed** from this plan. A full-stack practice app is a **separate module** (not written here).
**Audience:** the agent(s) executing the rewrite. Read sections 0–2 once, then work batch by batch from section 4.
**Unchanged:** Senior FE interview readiness for Parker (~5 years Vue/Nuxt/TypeScript, closing the React/Next *knowledge* gap). 30 days in 5 week groups, labelled only **Day N** / **Ngày N**, bilingual, Plan-tab JSON fields the app already renders.

**Owner revisions (override earlier drafts of this file):**

1. **Prioritize, do not cover the whole KB.** CORE ~60% deep, WORKING ~30% lighter (combinable), OPTIONAL ~10% clearly labelled skim.
2. **No Lab tab.** Do not write portfolio, Harbor, Linear, Nest, Docker, or other product-lab content. Days keep Plan-tab fields plus a **schema stub** `lab.sections: []` so today's app still parses the day object.
3. Days are labelled only by day number, never calendar dates.

---

## 0. Ground truth (measured on `main` @ `77d7171`)

| Item | Value |
| --- | --- |
| Day files | 30 (`plan/days/day-01.json` … `day-30.json`), 427 KB, about 14.2 KB each |
| Words per day (en, ids excluded) | Plan tab 102, Lab tab 354, total 456. vi total 502 |
| Words, all 30 days | en 13,682 · vi ≈ 15,060 |
| Lab tab (today) | 8 sections / 19 blocks every day |
| KB topic deep links in the plan | 0 (Plan tab has **no hash field**; Lab was the only deep-link surface) |
| Q&A links | 83 links to 68 distinct ids; 74 of 142 never linked |
| `testing` doc | never linked from the plan |
| Calendar dates | none |
| App Plan tab | `goal`, `studyLinks`, `questionLinks`, `handsOn`, `algorithm`, `checklist`, `note` — **plain text** |
| App Lab tab | `lab.sections`. App `validate-content.mjs` currently **requires** a `lab` object |
| App studyLinks | `/docs/<lang>/<slug>` with **no heading anchor** |

Plan-tab backticks may show literally. Never use `**bold**` or markdown links in Plan-tab fields.

---

## 1. Diagnosis (why it reads long-winded)

Unchanged from the first draft of this file: every day is said three times (Plan + Lab copy); a rigid 6-label block re-explains KB theory and is sometimes wrong (Day 18 “Client leaves above a Server Component are illegal”); boilerplate is repeated 30 times; goals describe the plan not the outcome; vi is code-switched; links are shallow; days overlap; titles are copied by hand into four resources.

**Day 18 factual error (must not be repeated):** a Client Component **can** render a Server Component passed as `children`. That theory belongs in `nextjs` 21.5 / 21.7. Optional Next skim days must not restate the false rule.

---

## 2. Target format

### 2.1 Principles

1. **Plan tab only.** What to do today, which docs/Q&A to open, how to know you are done, one algorithm. No Lab sections, no drill lists, no “Read first” deep links in JSON (the app cannot hash from Plan tab).
2. **Theory lives in the KB and Q&A.** Tasks name an artifact (table, snippet, 60 s answer). They do not explain how Vue or Next works.
3. **Prioritize.** CORE days go deep (3 tasks). WORKING days are lighter (usually 2 tasks). OPTIONAL days are skim: 2 short tasks, a `note` that starts `Optional skim.` / `Không bắt buộc.`, skippable if behind on core.
4. **Plain short sentences.** Imperative en. vi uses “bạn” when needed. No arrow chains, no `Decision:` labels.
5. **vi follows KB style 2.5.** No English grammar words (`produce`, `note`, `set`, `measure`, `stretch`, `constraint`). Titles “Ngày N” never “Day N” in vi.
6. **Day numbers only.**

### 2.2 Plan-tab fields

Key order: `kind, day, week, title, goal, studyLinks, questionLinks, handsOn, algorithm, checklist, [note], lab`. Limits are en characters. vi ≤ 1.35× en.

| Field | Count | Limit | Rules |
| --- | --- | --- | --- |
| `title` | 1 | ≤ 50 | Topic, not a slogan. Optional days start `Optional ·` / `Không bắt buộc ·` |
| `goal` | 1 sentence | ≤ 120 | Outcome: what you can do or say by the end |
| `studyLinks` | 2–3 (review/mock may add 1 plan resource, max 4) | label ≤ 25 | `kind: "docs"` slug + KB `title` per locale. Plan resources `kind: "plan"` with `resourceId` + `path` (first alias). No duplicate slugs. **Whole doc only** |
| `questionLinks` | 2–4 | label ≤ 45 | Ids from section 3. Label = short question, same idea as the spoken checklist item |
| `handsOn` | 2–3 (WORKING/OPTIONAL usually 2) | ≤ 90 each | Imperative, names the artifact. Review/mock steps may start with minutes (`20 min:`) |
| `algorithm` | 1 | label ≤ 50 | Keep `resourceId` and `path`. Label `Problem · pattern` / `Problem · mẫu` |
| `checklist` | exactly 3 | ≤ 80 each | Yes/no on today's artifacts. 3rd item always: `“<question>” answered aloud in 60 s, no notes` / `Đã trả lời “…” thành lời trong 60 giây, không nhìn ghi chú` |
| `note` | 0–1 | ≤ 140 | Required on OPTIONAL days. Otherwise only if section 3 says so |
| `lab` | stub | — | `{ resourceId: "lab-day-NN", title: { en: "Day N — Lab", vi: "Ngày N — Lab" }, sections: [] }` |

Budget: Plan tab ≤ 110 en words. Whole day = Plan tab (lab words = 0). vi/en word ratio 0.9–1.3.

### 2.3 Lab stub (keep the app from crashing)

Do **not** omit `lab`. The public app still types `lab` as required and the Lab tab reads `lab.sections`.

- Keep `lab.resourceId` (`lab-day-NN`) and bilingual title (ids stay stable).
- Set `sections` to `[]`.
- Do not recreate `what-they-will-ask`, `what-you-will-produce`, `how-a-senior-works-this`, `done-when`, `stretch`, `suggested-commit`, or `read-first` / `drill` / `say-it`.

**App changes (this repo cannot ship them):**

1. **Hide the Lab tab** when `lab.sections` is missing or empty (preferred), or hide it for all study-plan days.
2. Relax `scripts/validate-content.mjs` so `lab` may have empty `sections` (or become optional).
3. Deep KB links from the Plan tab need a new `headingId`/`hash` on `studyLinks` — **out of scope**. Until then, study links open the whole doc; tasks name the topic in plain text.
4. Do not render an empty Lab tab as an error empty-state that looks like missing content.

KB topic ids in section 3 are for the executor (and `--lookup`), not for Plan-tab JSON.

### 2.4 What goes where

| Content | Where |
| --- | --- |
| Definitions, mechanisms, trade-offs | KB doc linked in `studyLinks` (whole doc) |
| Spoken answers | Q&A `questionLinks`; 3rd checklist item |
| Algorithm statement, constraints, hints | `plan/resources/algo-day-NN.json` (unchanged) |
| Companion product / Lab tab | **Not this plan.** Separate practice module later |
| Daily rhythm | `plan/resources/context.json` and `plan.json` (B6) |
| Today's tasks, artifacts, checks | the day file Plan tab |

### 2.5 Example day: Day 12 (Plan tab + empty lab)

```json
{
  "kind": "plan-day",
  "day": 12,
  "week": 2,
  "title": { "en": "Nuxt rendering and data fetching", "vi": "Render và lấy dữ liệu trong Nuxt" },
  "goal": {
    "en": "Pick a rendering mode and a fetch API per route, and defend both in under a minute.",
    "vi": "Chọn chế độ render và cách lấy dữ liệu cho từng route, rồi bảo vệ cả hai trong chưa tới một phút."
  },
  "studyLinks": [
    { "kind": "docs", "slug": "nuxt", "label": { "en": "Nuxt.js", "vi": "Nuxt.js" } },
    { "kind": "docs", "slug": "vue3", "label": { "en": "Vue 3", "vi": "Vue 3" } }
  ],
  "questionLinks": [
    { "id": "nuxt-rendering-modes", "label": { "en": "Nuxt rendering modes", "vi": "Các chế độ render của Nuxt" } },
    { "id": "nuxt-data-fetching", "label": { "en": "useFetch vs useAsyncData vs $fetch", "vi": "useFetch, useAsyncData hay $fetch" } },
    { "id": "vue-ssr-hydration", "label": { "en": "SSR and hydration errors", "vi": "SSR và lỗi hydration" } },
    { "id": "nuxt-route-rules-caching", "label": { "en": "Route rules and caching", "vi": "Route rules và cache" } }
  ],
  "handsOn": [
    { "en": "Write `routeRules` for 3 admin routes, one reason each.", "vi": "Viết `routeRules` cho 3 route admin, mỗi route một lý do." },
    { "en": "Move one `$fetch` call to `useFetch` with a stable `key`.", "vi": "Chuyển một lần gọi `$fetch` sang `useFetch` với `key` cố định." },
    { "en": "List one hydration mismatch cause and the fix you would ship.", "vi": "Ghi một nguyên nhân hydration mismatch và cách sửa bạn sẽ ship." }
  ],
  "algorithm": {
    "resourceId": "algo-day-12",
    "path": "artifacts/algo/problems/day-12.md",
    "label": { "en": "Reverse Linked List · Pointer reversal", "vi": "Reverse Linked List · Đảo con trỏ" }
  },
  "checklist": [
    { "en": "`routeRules` covers 3 routes, each with a reason.", "vi": "`routeRules` có đủ 3 route, mỗi route có lý do." },
    { "en": "The fetch note shows a stable `key` and a single request.", "vi": "Ghi chú fetch có `key` cố định và chỉ một request." },
    { "en": "“useFetch vs useAsyncData vs $fetch” answered aloud in 60 s, no notes.", "vi": "Đã trả lời “useFetch, useAsyncData hay $fetch” thành lời trong 60 giây, không nhìn ghi chú." }
  ],
  "lab": {
    "resourceId": "lab-day-12",
    "title": { "en": "Day 12 — Lab", "vi": "Ngày 12 — Lab" },
    "sections": []
  }
}
```

Write files with `JSON.stringify(data, null, 2) + "\n"`.

### 2.6 Week meta, gaps, resources

- `plan/meta.json` `weeks[]`: keep `week`, `title`, `range`. `goal` ≤ 160 chars. `outcomes` exactly 3, ≤ 100 chars, changed where section 3 says so. **Week 3 title and outcomes change** (no React course).
- `gaps`: 3 items. Drop old gap 2 (design-system doc) and gap 4 (arrow-chain). Keep a shortened “new tab” gap and algo-in-plan gap. Third: “This plan has no Lab tab. Study links open the whole KB doc. A practice module is separate.”
- `plan/resources/plan.json`, `index.json`, `context.json`: Plan tab + algorithm only; 60–90 min; no Lab split. Target shorter than today.
- `react.json` / `algo.json`: sync titles. React track becomes an optional skim pointer, not a daily obligation.
- `lab.json`: one short “retired for this 30-day plan” notice. **No product spec.**
- `algo-day-*`, `dod.json`, `feature.json`, `selfcheck.json`: unchanged.

### 2.7 Effort split

| Bucket | ~Share | Days | How it feels |
| --- | --- | --- | --- |
| **CORE** | ~60% | 1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 21, 22, 23, 25, 26, 27, 28, 30 | Deep: JS, TS, Vue/Nuxt, state, perf, system design, soft skills, reviews/mocks |
| **WORKING** | ~30% | 2, 3, 4, 5, 19, 20, 24, 29 | Lighter: UI states, CSS, a11y, testing, HTTP cache, security, monitoring, company fit |
| **OPTIONAL** | ~10% | 15, 16, 18 | Skim React/Next comparison only. `note` says skip if behind. Build tools / rare web APIs are **optional extras** on CORE days (last handsOn starts `Optional:` / `Không bắt buộc:`), not extra days |

Review/mock days (7, 14, 21, 28, 30) practise **core** (Vue/Nuxt/JS/TS/perf/system design/stories), not React trivia.

---

## 3. Revised 30-day outline

Legend: **Bucket** CORE / WORKING / OPTIONAL. **Status** vs the *first* outline in this file: `kept`, `retitled`, `reworked`, `optional-skim`. **KB** = topics to read (en heading ids; vi via `--lookup`). **Q&A** in order; the spoken checklist names the **first** unless noted. Algorithm `resourceId`/`path` never change.

### Week 1 · Design systems + UI clarity (Days 1–7)

Outcome 3 → “Spec one overlay primitive with keyboard behaviour and named component tests.” / “Đặc tả một primitive overlay có hành vi bàn phím và tên các component test.”

**Day 1 — Inventory the UI system** · CORE · kept  
Goal: Break one real admin screen into tokens, primitives and states, and name the first 3 primitives to extract.  
Tasks: token table; repeated states; 3 primitives + reason.  
KB: `architecture#156-design-system-vs-app-components`, `architecture#151-component-patterns`, `system-design#163-component-library-design`  
Q&A: `design-system-strategy`, `css-layout-specificity`, `scale-codebase-100-features`  
Study: `architecture`, `system-design`, `res:context`  
Algo: Two Sum · Hash map

**Day 2 — Make UI states readable** · WORKING · kept  
Goal: Design loading, empty, error and partial states for one screen, and expose them through one reusable API.  
Tasks: 5-state matrix; `<AsyncState>` props/slots/emits sketch; which states need `aria-live`.  
KB: `networking#133-loading-error-empty-and-optimistic-ui`, `accessibility#111-aria-attributes`, `architecture#151-component-patterns`  
Q&A: `dashboard-15-apis`, `lazy-loading-tradeoffs`  
Study: `networking`, `accessibility`, `architecture`  
Algo: Valid Anagram · Frequency map

**Day 3 — Accessible forms, feedback and keyboard basics** · WORKING · kept (merged)  
vi: "Form dễ tiếp cận, phản hồi và thao tác bàn phím cơ bản"  
Goal: Make one form usable with a keyboard and a screen reader, and explain each fix.  
Tasks: labels + `aria-describedby` + submit summary; keyboard-only pass with 3 fixes.  
KB: `accessibility#113-semantic-html`, `accessibility#112-keyboard-navigation`, `accessibility#114-wcag-guidelines`  
Q&A: `accessibility-forms-keyboard`, `semantic-html-vs-aria-bem`  
Study: `accessibility`  
Algo: Contains Duplicate · Set (`Set` → vi `Tập hợp`)

**Day 4 — Responsive data-heavy UI** · WORKING · kept  
Goal: Lay out a dense data table for desktop and mobile, and justify each breakpoint.  
Tasks: per-column keep/collapse/detail; grid vs flex + reason; one overflow fix.  
KB: `css-layout#33-when-to-use-flexbox-vs-grid`, `css-layout#34-responsive-design-strategy`, `css-layout#36-intrinsic-sizing-and-overflow`  
Q&A: `css-flexbox-vs-grid`, `css-box-model`, `css-position`  
Study: `css-layout`  
Algo: Group Anagrams · Hash map + sorted key  
`table-50k-rows` stays on Day 23.

**Day 5 — Overlays, focus management and component tests** · WORKING · reworked  
vi: "Overlay, quản lý focus và component test"  
Goal: Spec a modal primitive that handles focus correctly, and name the tests that prove it.  
Tasks: modal API (Teleport, trap, Escape, restore, nested); 4 test **names**; a11y check on a PR checklist.  
KB: `vue3#521-teleport`, `accessibility#115-testing-a11y-in-ci-and-design-system-prs`, `testing#82-component-testing-with-vue-test-utils`  
Q&A: `a11y-modal-focus-trap`, `modal-nested`, `testing-pyramid`  
Study: `accessibility`, `testing`, `vue3`  
Algo: Top K Frequent Elements · Bucket sort

**Day 6 — Component APIs with TypeScript** · CORE · kept  
Goal: Design a typed, generic component API that is hard to misuse.  
Tasks: generic `DataTable<T>`; `v-model` selection contract; rewrite one bad prop API.  
KB: `typescript#2210-typing-vue-props-and-emits`, `typescript#212-generics`, `vue3#528-slots-scoped-slots`  
Q&A: `ts-designing-api-props`, `ts-generics`, `vue-props-emits-vmodel`  
Study: `typescript`, `vue3`  
Algo: Valid Parentheses · Stack

**Day 7 — Week 1 review: mini redesign + mock** · CORE · retitled  
vi: "Ôn tuần 1: redesign nhỏ + phỏng vấn thử"  
Goal: Present a one-page redesign of the Day 1 screen and answer 3 Week 1 questions under time.  
Tasks: `25 min:` proposal (tokens, primitives, states, a11y, rollout); `20 min:` mock 3 questions; `5 min:` 2 weak spots for Day 29.  
KB: `system-design#163-component-library-design`, `leadership#172-architecture-decision-records-adr`  
Q&A: `design-system-strategy`, `tradeoff-example`  
Study: `system-design`, `leadership`, `res:selfcheck`, `res:feature`  
Algo: Week 1 timed review

### Week 2 · JS/TS + Vue/Nuxt refresh (Days 8–14)

Outcome 3 → “Write 3 live-coding utilities from memory: promiseAll, debounce, throttle.” / “Viết lại 3 tiện ích live coding không nhìn tài liệu: promiseAll, debounce, throttle.”

**Day 8 — JavaScript execution model** · CORE · kept  
Goal: Predict async output and explain the event loop, closures and `this` without notes.  
Tasks: predict then run 2 event-loop snippets; one stale-closure from real code; fix lost-`this` two ways.  
KB: `javascript#113-event-loop-microtask-macrotask`, `javascript#121-closure-scope`, `javascript#126-hoisting-temporal-dead-zone`, `javascript#123-this-keyword`  
Q&A: `js-event-loop`, `js-closures`, `js-hoisting-tdz`, `js-this-call-bind`  
Study: `javascript`  
Algo: Binary Search · Sorted data

**Day 9 — Promises, cancellation and races** · CORE · retitled  
vi: "Promise, hủy request và race"  
Goal: Write `promiseAll` from scratch and explain a search race with `AbortController`.  
Tasks: `promiseAll` + tests in 15 min (on paper or lab later); search-race fix sketch; 401 refresh-queue sketch.  
Optional extra (not a third required task unless 2 stay short): rare web APIs — skip IndexedDB/PWA.  
KB: `javascript#112-promise-vs-asyncawait`, `javascript#127-abortcontroller-concurrency-and-cancellation`, `networking#135-abortcontroller-and-timeouts`  
Q&A: `live-coding-promise-all`, `js-promise-combinators`, `auth-401-refresh-queue`  
Say: `js-promise-combinators`  
Study: `javascript`, `networking`  
Algo: Two Sum II · Two pointers

**Day 10 — TypeScript for real frontend models** · CORE · kept  
Goal: Type an API boundary so invalid states cannot compile, and parse `unknown` safely.  
Tasks: discriminated union + type guard; utility types for create/update/form; brand one id.  
KB: `typescript#213-type-narrowing`, `typescript#221-utility-types`, `typescript#226-branded-and-opaque-ids`, `typescript#228-unknown-vs-any`  
Q&A: `ts-narrowing-typeguards`, `ts-utility-types`, `ts-any-unknown-never`, `ts-conditional-mapped-types`  
Study: `typescript`  
Algo: Longest Substring · Sliding window

**Day 11 — Vue reactivity, patching and composables** · CORE · kept (add patching as a read target)  
Goal: Build a composable with correct cleanup and explain where reactivity and the render patch are lost.  
Tasks: `useSearch` outline (debounce, abort, `onScopeDispose`); destructure bug + fix; `shallowRef` vs `markRaw` for 10k rows.  
KB: `vue3#5110-reactivity-system`, `vue3#511-virtual-dom`, `vue3#517-computed-vs-watch`  
Q&A: `vue-reactivity-internals`, `vue-composables`, `vue-computed-watch-watcheffect`, `vue-markraw-shallow-performance`  
Study: `vue3`, `state-management`  
Algo: Min Stack · Stack design

**Day 12 — Nuxt rendering and data fetching** · CORE · kept. **JSON in 2.5.**  
KB: `nuxt#63-csr-vs-ssr-vs-ssg-vs-spa`, `nuxt#65-useasyncdata-vs-usefetch-vs-fetch`, `vue3#5211-hydration-mismatch` (`nuxt#67-nitro-server-routes-vs-bff` allowed 4th read)

**Day 13 — State ownership, Pinia and cache boundaries** · CORE · kept  
Goal: Decide where each piece of state lives, and defend the Pinia vs server-cache split.  
Tasks: classify 8 pieces (local, URL, store, server cache); Pinia permissions store outline; invalidation after one mutation.  
KB: `state-management#73-when-to-use-global-vs-local-state`, `state-management#77-server-cache-vs-client-store`, `state-management#76-ssr-hydration-of-stores`  
Q&A: `pinia-design`, `tanstack-query-vs-global-store`, `role-permission-ui`, `api-caching`  
Study: `state-management`, `nuxt`  
Algo: Linked List Cycle · Floyd pointers

**Day 14 — Week 2 review: performance and live coding** · CORE · retitled  
vi: "Ôn tuần 2: hiệu năng và live coding"  
Goal: Diagnose one slow interaction, and write debounce and throttle from memory.  
Tasks: `20 min:` debounce + throttle + tests; `25 min:` Performance-panel note (cause, fix, metric); `10 min:` STAR perf story.  
KB: `performance#925-core-web-vitals-in-2026`, `performance#921-code-splitting-strategies`, `performance#923-debounce-vs-throttle`  
Q&A: `perf-issue-story`, `core-web-vitals`, `vue-performance-patterns`, `live-coding-debounce`  
Study: `performance`, `monitoring`  
Algo: Week 2 timed review

### Week 3 · Performance, HTTP, optional React/Next (Days 15–21)

**Retitle week 3** (was “React + Next.js from a Vue lens”):

- en: "Week 3 · Performance, HTTP, and optional React/Next"
- vi: "Tuần 3 · Hiệu năng, HTTP, và React/Next không bắt buộc"
- Outcomes: (1) Measure one interaction with a CWV and tell the story. (2) Explain HTTP cache and Nuxt fetch keys without notes. (3) Optional only: map Vue/Nuxt to React/Next on one page — no app to ship.

**Day 15 — Optional · React vs Vue** · OPTIONAL · optional-skim (was a full React day)  
Goal: Map eight Vue concepts to React and say why React re-renders where Vue does not — then stop.  
Tasks: 8-row mapping table; one re-render sentence when parent state changes.  
KB: `react#2011-virtual-dom-reconciliation`, `nextjs#213-nuxt-next-mental-map`  
Q&A: `react-rerender-model-vs-vue`, `learning-react-as-vue-dev`  
Study: `react`, `nextjs`  
Note: Optional skim. Skip if behind on Vue, Nuxt, or TypeScript.  
Algo: Binary Tree Level Order · BFS

**Day 16 — Optional · React state and refs** · OPTIONAL · optional-skim  
Goal: Choose state vs ref vs context for each value, in one short table.  
Tasks: controlled search vs uncontrolled file input in 10 lines; one over-rending context split in words.  
KB: `react#2015-controlled-inputs-vue-v-model-equivalent`, `react#20110-refs-useref-vs-vue-ref-template-ref`  
Q&A: `react-controlled-vs-uncontrolled`, `react-usestate-useref`  
Study: `react`, `state-management-react`  
Note: Optional skim.  
Algo: Maximum Depth of Binary Tree · DFS

**Day 17 — Core Web Vitals and measuring performance** · CORE · **topic change** (was React effects)  
vi: "Core Web Vitals và đo hiệu năng"  
Goal: Name the CWV that fits one slow screen, and write the metric before/after a fix.  
Tasks: pick LCP/INP/CLS for one real screen + probe; code-split vs debounce choice; 90 s STAR outline.  
KB: `performance#925-core-web-vitals-in-2026`, `performance#921-code-splitting-strategies`, `performance#914-performance-case-studies`  
Q&A: `core-web-vitals`, `perf-issue-story`, `bundling-code-splitting`  
Study: `performance`, `monitoring`  
Algo: Lowest Common Ancestor of a BST · BST property

**Day 18 — Optional · Next App Router vs Nuxt** · OPTIONAL · optional-skim + **factual fix**  
vi: "Không bắt buộc · App Router và Nuxt"  
Goal: Map Nuxt layouts/`routeRules` to App Router `loading`/`error`, and state the Server/Client children rule correctly.  
Tasks: one-page Nuxt↔Next map (layout, loading, error, fetch); mark 3 Server vs Client boundaries with a reason — including that a Client parent **may** render a Server child passed as `children`.  
KB: `nextjs#215-app-router-fundamentals`, `nextjs#217-routing-layouts-and-navigation`, `nextjs#214-csr-vs-ssr-vs-ssg-vs-spa-and-rsc`, `nuxt#63-csr-vs-ssr-vs-ssg-vs-spa`  
Q&A: `next-server-client-components`, `next-app-router-layouts-loading-error`, `nuxt-rendering-modes`  
Study: `nextjs`, `nuxt`  
Note: Optional skim. Do not `create-next-app`.  
Algo: Number of Islands · Grid DFS

**Day 19 — HTTP caching and data fetching** · WORKING · **topic change** (was Next cache deep-dive)  
vi: "HTTP cache và lấy dữ liệu"  
Goal: Pick a cache policy for 3 routes and write the Nuxt `routeRules` equivalent.  
Tasks: static vs revalidate vs dynamic for 3 routes; Nuxt equivalent beside each; when a client cache still helps.  
KB: `networking#132-rest-design-from-the-frontend`, `nuxt#65-useasyncdata-vs-usefetch-vs-fetch`, `state-management#77-server-cache-vs-client-store`  
Q&A: `api-caching`, `nuxt-data-fetching`, `nuxt-route-rules-caching`  
Study: `networking`, `nuxt`, `state-management`  
Algo: Climbing Stairs · 1D DP

**Day 20 — Token storage, XSS and CSRF** · WORKING · **topic change** (was Server Actions / SEO)  
vi: "Lưu token, XSS và CSRF"  
Goal: Pick token storage for an admin SPA and list XSS/CSRF defences already in your stack.  
Tasks: storage decision + one attack it fails; XSS vs CSRF two-column list; one CSP or httpOnly note.  
KB: `security#101-xss-prevention`, `security#102-csrf-protection`, `security#103-authentication-best-practices`  
Q&A: `auth-token-storage`, `csrf-vs-xss`, `oauth-pkce-spa`  
Study: `security`, `networking`  
Algo: Coin Change · Unbounded DP

**Day 21 — Week 3 review: Vue, Nuxt and performance** · CORE · **topic change** (was Next.js slice)  
vi: "Ôn tuần 3: Vue, Nuxt và hiệu năng"  
Goal: Rehearse 3 core answers (Vue reactivity, Nuxt fetch, one CWV) under time. No Next app to ship.  
Tasks: `20 min:` 3 answers; `20 min:` redo the weakest Day 14/17 metric story; `10 min:` add 2 weak spots.  
KB: `vue3#5110-reactivity-system`, `nuxt#65-useasyncdata-vs-usefetch-vs-fetch`, `performance#925-core-web-vitals-in-2026`  
Q&A: `vue-reactivity-internals`, `nuxt-data-fetching`, `core-web-vitals`  
Study: `vue3`, `nuxt`, `performance`, `res:selfcheck`  
Algo: Week 3 timed review  
No `note` (time is in the tasks).

### Week 4 · System design + behavioral (Days 22–28)

Outcome 3 → “Tell 4 collaboration stories: code review, disagreement, mentoring, saying no.” / “Kể 4 câu chuyện phối hợp: code review, bất đồng, mentoring, từ chối.”

**Day 22 — Design an admin dashboard** · CORE · kept  
Goal: Run a 35-min frontend system design for a dashboard with 15 data sources.  
Tasks: 35-min: requirements, components, data flow, caching, failure; ADR for BFF; 3 frontend signals.  
KB: `system-design#164-example-design-a-large-dashboard`, `system-design#161-frontend-architecture-decisions`, `system-design#162-caching-strategy`  
Q&A: `dashboard-15-apis`, `bff-when`, `adr-when-you-write-one`, `observability-frontend`  
Study: `system-design`, `leadership`, `monitoring`  
Algo: House Robber · 1D DP

**Day 23 — Data-heavy surfaces and performance trade-offs** · CORE · kept  
Goal: Make a 50k-row table and a feed fast, and cut a 3 MB bundle, with numbers.  
Tasks: virtualization vs pagination vs worker + metric; infinite feed (cursor, prefetch, cap); 3 MB chunk plan.  
Optional extra: Web Workers / Intersection Observer — skim `web-apis` only if time.  
KB: `performance#914-performance-case-studies`, `build-tools#123-how-youd-debug-a-3mb-main-chunk`, `web-apis#42-web-workers`  
Q&A: `table-50k-rows`, `design-news-feed`, `bundling-code-splitting`  
Study: `performance`, `build-tools`  
Algo: Warm-up easy set · Mixed

**Day 24 — Monitoring, flags and rollback** · WORKING · **topic change** (security meat moved to Day 20)  
vi: "Giám sát, feature flag và rollback"  
Goal: Write a flag rollout/rollback with an error-spike trigger, and name 3 frontend signals.  
Tasks: flag plan + spike trigger; Sentry vs logs vs CWV RUM; optional extra: Vite vs Webpack in 5 bullets.  
KB: `monitoring#196-feature-flag-error-spike-playbook`, `monitoring#193-performance-monitoring`, `devops#144-feature-flags`  
Q&A: `feature-flags-rollout`, `observability-frontend`, `fe-ci-preview-deploys`  
Study: `monitoring`, `devops`  
Algo: Live coding simulation · Interview

**Day 25 — Behavioral stories: intro, impact, seniority** · CORE · kept  
Goal: Deliver a 90-s self-intro and one measurable impact story.  
Tasks: 90-s intro (Vue depth first, React as growth); STAR impact with `[metric]`; one-line senior definition.  
KB: `leadership#173-complexity-estimation`  
Q&A: `self-intro`, `biggest-impact`, `what-is-senior`  
Study: `leadership`, `practical-questions`, `res:selfcheck`  
Algo: Weak-topic drill · Mixed

**Day 26 — Behavioral stories: project, trade-offs and the React gap** · CORE · kept  
Goal: Tell your recent project, one trade-off and the React gap as honest, structured stories.  
Tasks: 2-min project walkthrough; trade-off with the rejected option; 30-s React gap (honest).  
KB: `leadership#172-architecture-decision-records-adr`, `practical-questions#187-how-you-handle-a-production-incident-as-frontend`  
Q&A: `recent-project`, `tradeoff-example`, `learning-react-as-vue-dev`  
Study: `leadership`, `practical-questions`  
Algo: Weak-topic drill · Mixed

**Day 27 — Leadership and collaboration stories** · CORE · reworked  
vi: "Câu chuyện về leadership và phối hợp"  
Goal: Have 4 short collaboration stories: code review, disagreement, mentoring and saying no.  
Tasks: 6-line STAR card × 4; record the 2 weakest.  
KB: `leadership#176-code-review-as-leadership`, `leadership#174-conflict-resolution`, `leadership#171-technical-mentorship`, `leadership#175-saying-no-pushing-back-on-pm`  
Q&A: `code-review-approach`, `disagree-tech-decision`, `mentoring-junior`, `when-to-say-no`  
Study: `leadership`  
Algo: Big-O flashcards · Complexity

**Day 28 — Mock round 1** · CORE · kept  
Goal: Pass a 60-min mixed mock: system design, live coding and one story.  
Tasks: `30 min:` autocomplete (debounce, cancel, cache, a11y); `20 min:` event emitter; `10 min:` recent project + 3 fixes.  
KB: `networking#135-abortcontroller-and-timeouts`, `performance#923-debounce-vs-throttle`, `system-design#161-frontend-architecture-decisions`  
Q&A: `design-autocomplete`, `live-coding-event-emitter`, `recent-project`  
Study: `system-design`, `res:selfcheck`, `res:algo`  
Algo: Cooldown easy problem · Easy

### Final days (Days 29–30)

**Day 29 — Weak spots and company fit** · WORKING · retitled  
vi: "Điểm yếu và mức độ phù hợp với công ty"  
Goal: Close your 3 weakest **core** answers and prepare company-specific answers.  
Tasks: redo 3 weakest from Days 7, 14, 21, 28; one-page company brief + why; 5 questions to ask.  
KB: `practical-questions#188-how-you-onboard-onto-an-unknown-vue-codebase-in-week-1`  
Q&A: `why-company`, `career-growth-plan`, `handle-ambiguity`, `quality-bar-definition`  
Study: `leadership`, `res:selfcheck`, `res:dod`  
Algo: Pattern review · Random

**Day 30 — Full mock interview + retrospective** · CORE · kept  
Goal: Pass a 75-min full mock and leave with a short maintenance plan.  
Tasks: `75 min` mock (intro 5, technical 20, system design 25, live coding 15, behavioral 10); retro: top 3 fixes + weekly maintenance.  
KB: `system-design#161-frontend-architecture-decisions`  
Q&A: `strengths-weaknesses`, `mistake-hardship`, `design-realtime-chat`, `live-coding-deep-clone`  
Study: `res:selfcheck`, `res:algo`, `system-design`  
Algo: Mock live-coding · Interview

### Topic changes vs the first outline in this file

| Day | Was | Now |
| --- | --- | --- |
| 15, 16, 18 | Full React/Next study days | **Optional skim** (same themes, far less work) |
| 17 | React effects / error boundaries | **CORE performance / CWV** |
| 19 | Next data fetching / cache deep-dive | **WORKING HTTP cache + Nuxt fetch** |
| 20 | Server Actions, middleware, SEO | **WORKING token storage / XSS / CSRF** |
| 21 | Small Next.js slice to ship | **CORE review: Vue, Nuxt, performance** |
| 24 | Security + release + resilience | **WORKING monitoring / flags** (security moved to 20) |
| 5, 27 | Already reworked in the first outline | Unchanged from that outline |

Vs **current `main` content**, also: Day 5 (keyboard-first → overlays + tests), Day 27 (cross-stack review → leadership stories), plus retitles 7, 9, 14, 21, 29.

---

## 4. Execution batches (one draft PR each, stacked, never merge)

B0 branches from `cursor/study-plan-30d-redesign-d1fb`. Each later batch branches from the previous batch branch.

| Batch | Scope | Files |
| --- | --- | --- |
| **B0 · Tooling + this plan** | `check-plan.mjs`, `sync-plan-index.mjs`, CI warn mode, README, this file | `scripts/*`, `.github/workflows/validate.yml`, `README.md`, `plans/study-plan-30d-redesign.md` |
| **B1 · Week 1** | Days 1–7, week 1 outcome 3 | `plan/days/day-01…07.json`, `plan/meta.json`, `plan/index.json` |
| **B2 · Week 2** | Days 8–14 (Day 12 = §2.5), week 2 outcome 3 | `day-08…14`, `meta.json`, `index.json` |
| **B3 · Week 3** | Days 15–21, week 3 title + outcomes | `day-15…21`, `meta.json`, `index.json` |
| **B4 · Week 4a** | Days 22–26, week 4 outcome 3 | `day-22…26`, `meta.json`, `index.json` |
| **B5 · Week 4b + final** | Days 27–30 | `day-27…30`, `index.json` |
| **B6 · Resources + strict** | gaps, `plan.json`, daily `index.json`, `context.json`, `lab.json` stub, `react.json`/`algo.json` titles, CI `--strict`, status line here | `plan/meta.json`, `plan/resources/*.json`, workflow, this file |

Per-day (B1–B5): copy `day`, `week`, `algorithm.resourceId`/`path`; write Plan tab from section 3; `lab.sections = []`; `node scripts/sync-plan-index.mjs`; validate with `--days <range> --strict`.

### `scripts/check-plan.mjs` spec (B0)

Same CLI as before (`--days`, `--strict`, `--stats`, `--lookup slug#en-id`).

**Errors (always):** 30 files; `day`/`week`/`lab.resourceId`/`algorithm.resourceId`+file; studyLinks slugs/resourceIds; questionLinks ids; lab markdown links if any (none expected); vi/en parity on remaining strings; `plan/index.json` matches sync; no calendar dates.

**Format (warn, error with `--strict`):** Plan-tab counts/limits in §2.2; `lab.sections` must be `[]`; word budgets Plan ≤ 110, lab = 0; no banned labels/`→`; vi grammar-word ban; checklist[2] is the spoken check naming a `questionLinks` label; no verbatim string on more than 3 days except headings, timebox prefix, run command.

`scripts/sync-plan-index.mjs`: `{ weeks, gaps, resources }` from meta + `days` = each day file without `lab`. `--check` exits 1 if the file would change.

---

## 5. Validation (every batch)

```bash
node scripts/validate.mjs .
node scripts/check-content.mjs .
node scripts/sync-plan-index.mjs --check
node scripts/check-plan.mjs . --days <batch range> --strict   # B1–B5
node scripts/check-plan.mjs . --strict                        # B6
node scripts/check-plan.mjs . --stats
```

Expected after B6: day files ≈ 110–150 KB; en words ≈ 3,000 (≤ 110/day); lab sections/blocks 0/0; KB docs all linked including `testing`; distinct Q&A up; Lab tab hidden in the app.

---

## 6. Removed lab section ids

Report these to check the app (`parker2808/interview-senior-fe`). Nothing in **this** repo links to them. Progress is keyed by day number.

1. `what-they-will-ask`
2. `what-you-will-produce`
3. `how-a-senior-works-this`
4. `done-when`
5. `stretch`
6. `suggested-commit`

Also unused once empty: proposed `read-first`, `drill`, `say-it` (never shipped). Stable leftovers: `intro` (unused if `sections` is empty), `algorithm` as a **Plan-tab** field (not a lab section).
