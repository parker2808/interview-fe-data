# 30-day study plan: concise redesign

**Status:** plan only. No `plan/` content has been changed yet.
**Audience:** the agent(s) executing the rewrite. Read sections 0–2 once, then work batch by batch from section 4. You should not need to re-review the current plan: section 3 gives every day's content decisions.
**Unchanged:** the goal of the plan (Senior FE interview readiness for Parker, about 5 years of Vue/Nuxt/TypeScript, closing the React/Next gap, with daily algorithms and stories). It stays 30 days in 5 week groups, labelled only "Day N" (vi "Ngày N"), bilingual, using the same JSON fields the app renders.

---

## 0. Ground truth (measured on `main` @ `77d7171`)

| Item | Value |
| --- | --- |
| Day files | 30 (`plan/days/day-01.json` … `day-30.json`), 427 KB total, about 14.2 KB each |
| Words per day (en, ids excluded) | Plan tab 102, Lab tab 354, total 456. vi total 502 |
| Words, all 30 days | en 13,682 · vi ≈ 15,060 |
| Lab tab template | 8 sections and 19 blocks on **every** day: `intro`, `what-they-will-ask`, `what-you-will-produce`, `how-a-senior-works-this`, `done-when`, `stretch`, `algorithm`, `suggested-commit` |
| Largest lab section | `how-a-senior-works-this`: 4,396 en words (32% of all lab text), always exactly 6 bullets labelled `Decision / Constraint / Failure mode / Measure / Tradeoff / Production gotcha` |
| Verbatim duplication | 60/60 `handsOn` items are copied into `what-you-will-produce`. 90/90 `checklist` items are copied into `done-when`. The `algorithm` section repeats constraints and the hint from `plan/resources/algo-day-NN.json` |
| Boilerplate lines in all 30 days | "You can explain one trade-off from today in under 2 minutes (decision → constraint → failure → measure).", "Timebox 45-60 minutes. Interview drill, not a product build.", the run and prompt lines, and the 8 section headings |
| KB links | `studyLinks` are doc-level only (21 of 22 docs used; **`testing` is never linked**). There are **0** links to a KB topic (heading id) anywhere in the plan |
| Q&A links | 83 links to 68 distinct ids. **74 of 142 questions are never linked**, including all 5 `live-coding-*`, `testing-pyramid`, `security-xss-csrf-csp`, `auth-token-storage`, `a11y-modal-focus-trap`, `modal-nested`, `mentoring-junior`, `disagree-tech-decision`, `when-to-say-no` |
| Link validity | All current `studyLinks` slugs and `questionLinks` ids resolve |
| `plan/index.json` | 97 KB. `days[]` is an exact copy of each day file minus `lab` (0 differences today). No script keeps it in sync |
| Day titles are also copied into | `plan/resources/plan.json` (overview list), `plan/resources/index.json` (daily table), `plan/resources/algo.json` (day bank), `plan/resources/react.json` (week focus) |
| Validation of `plan/` | `validate.mjs` checks 30 files and en/vi presence only. `check-content.mjs` does not look at `plan/` |
| Calendar dates | none (the app strips the legacy `date` field anyway) |

How the public app (`parker2808/interview-senior-fe`) uses this tree, checked in source:

- **Plan tab** (`PlanDayContent.vue`) renders `goal`, `studyLinks`, `questionLinks`, `handsOn`, `algorithm.label` (+ an "Open" button to `algorithm.resourceId`), `checklist`, `note`. All are **plain text** (`{{ }}`), so markdown such as backticks shows literally. Doc links go to `/docs/<lang>/<slug>` with **no heading anchor** (the type has no hash field). Q&A links go to `/interview?q=<id>`.
- **Lab tab** (`DayDetail.vue`) renders `lab.sections` with `BlockRenderer` (inline markdown in paragraphs and list items). Links are classified by `classifyContentHref(href, lab.resourceId, aliases)`:
  - `documents/<lang>/<slug>.md#<id>` opens the KB doc at that heading. **This is the only form that deep-links into the KB from a lab.** `./<slug>.md#id` and `<slug>.md` become broken GitHub links here.
  - `../artifacts/algo/problems/day-NN.md` opens the algorithm resource.
  - `/interview?q=…` is **not** supported in labs (it becomes a GitHub link). Q&A links belong only in `questionLinks`.
- Progress (`DayList.vue`, `isDone(day)`) is keyed by **day number** only.
- The app's `scripts/validate-content.mjs` requires day fields `day, title, goal, studyLinks, questionLinks, handsOn, algorithm, checklist, lab`, and resources with `id, title, sections`.

**Plan-tab markdown:** some current `handsOn`/`checklist` strings contain backticks. Because the Plan tab is plain text, they show literally. That's acceptable and already common, so you don't need to strip them. Never use `**bold**` or links in Plan-tab fields.

---

## 1. Diagnosis: why it reads as long-winded

### P1. Every day is said three times
The Plan tab lists tasks and a checklist. The Lab tab repeats both word for word ("What you will produce" = `handsOn`, "Done when" = `checklist`), then restates the linked questions as prose ("What they will ask"). The algorithm prompt is repeated a third time (Plan label, lab constraints and hint, and the `algo-day-NN` resource). About a third of the Lab text is a copy of something already on screen.

### P2. One rigid 6-label block replaces content with ceremony
Every lab has the same `Decision / Constraint / Failure mode / Measure / Tradeoff / Production gotcha` bullets. They are dense, telegraphic, and mostly re-explain theory that the rewritten KB now covers better. Some of it is wrong:
> Day 18: "**Production gotcha:** Client leaves above a Server Component are illegal. `loading.tsx` wraps the segment in Suspense — instant navigation can flash an empty shell if the fallback is huge."

(A Client Component can render a Server Component passed as `children`. This kind of theory belongs in `nextjs` 21.5/21.7, where it is reviewed for accuracy.)

### P3. Boilerplate repeated 30 times
> "You can explain one trade-off from today in under 2 minutes (decision → constraint → failure → measure)."

This sentence, the timebox callout, the run line and 8 identical headings appear on all 30 days. The arrow-chain style is the one the KB rewrite removed (style guide 2.1 rule 4).

### P4. Goals describe the plan, not the outcome
> Day 12 goal: "Review Nuxt as an interview topic, not just as familiar daily tooling."

A goal should say what Parker can do or say by the end of the day.

### P5. Vietnamese is code-switched
> Day 12 vi: "**Bạn sẽ produce gì**", "**Constraint:** Chỉ note quyết định.", heading "Stretch", lab title "Day 12 — Lab".

### P6. Links are shallow and coverage has holes
Docs are linked only at the document level ("Architecture notes"). The learner has to search a 10-topic doc for the relevant part, which pushes the plan to re-explain theory instead. Half the Q&A bank is unused. That includes everything about live coding, testing and modal/focus, which are common senior FE rounds.

### P7. Overlapping days
Day 3 ("Accessible forms and feedback") and Day 5 ("Keyboard-first interaction review") cover the same skill and link the same question (`accessibility-forms-keyboard`). Day 27 ("Cross-stack review and weak spots") overlaps Day 29 ("Final review") and links leadership questions under a "review" title. `perf-issue-story` is linked on Day 14 and again on Day 17 (a React effects day). Day 15 links the `react` doc twice.

### P8. Titles are copied into 4 resources by hand
If a day title changes, `plan/index.json`, `plan.json`, `index.json` (resource), `algo.json` and `react.json` drift.

---

## 2. Target format

### 2.1 Principles

1. **Say each thing once.** Plan tab = *what* to do today and how to know you're done. Lab tab = *how* to do it, step by step. Neither tab copies text from the other.
2. **Theory lives in the KB and Q&A.** If a sentence explains how something works, why it exists, or a trade-off in general, replace it with a KB topic link (Lab "Read first") or a Q&A id (`questionLinks`). The plan keeps only actions, artifacts, checks and what to say aloud.
3. **Concrete artifacts.** Every task produces something nameable: a file (`useSearch.ts`), a table, a snippet, or a 60-second recording.
4. **Plain, short sentences.** Imperative voice in en ("Write…", "Move…"). vi uses "bạn" when needed, imperative otherwise. No arrow chains, no slash lists in prose, no `Decision:`-style labels, no "senior works this" ceremony.
5. **vi follows KB style guide 2.5** (`plans/kb-qna-rewrite-plan.md`): natural Vietnamese, standard dev terms kept (component, route, render, hydration, cache, fetch, key…), but **no English grammar words** ("produce", "note", "set", "measure", "stretch", "constraint"). Lab title and intro heading are "Ngày N — Lab" in vi.
6. **Day numbers only.** "Day N" / "Ngày N". No calendar dates, weekdays or "tomorrow".

### 2.2 Plan tab fields (day JSON, same keys and order as today)

Key order: `kind, day, week, title, goal, studyLinks, questionLinks, handsOn, algorithm, checklist, [note], lab`. All strings `{ "en", "vi" }`. Limits are en characters. vi may be up to 1.35× en.

| Field | Count | Limit | Rules |
| --- | --- | --- | --- |
| `title` | 1 | ≤ 50 chars | Topic, not a slogan. Keep the current title unless section 3 gives a new one |
| `goal` | 1 sentence | ≤ 120 chars | The outcome: what you can do or say by the end ("Pick … and defend …") |
| `studyLinks` | 2–3 (review/mock days may add 1 `plan` resource, max 4) | label ≤ 25 chars | `kind: "docs"` with the KB doc slug. Label = the KB doc `title` from `knowledge-base/index.json`, per locale ("Vue 3", "Nuxt.js", vi "Khả năng truy cập"), not "… notes". Slugs come from the day's KB topics in section 3. No duplicate slugs |
| `questionLinks` | 2–4 | label ≤ 45 chars | Ids from section 3. Label = a short form of the question, the same text you'll bold in "Say it out loud" |
| `handsOn` | 2–3 | ≤ 90 chars each | One task each, imperative, naming the artifact. No "how" detail (that goes in Drill) |
| `algorithm` | 1 | label ≤ 50 chars | Keep `resourceId` and `path` exactly. Label = "Problem · pattern" (en) / "Problem · mẫu" (vi pattern word translated) |
| `checklist` | exactly 3 | ≤ 80 chars each | Yes/no checks of today's artifacts. The 3rd item is always the spoken check, naming the day's question ("… answered aloud in 60 s, no notes"). No generic line shared by all days |
| `note` | 0–1 | ≤ 140 chars | Only where section 3 says so. Otherwise **remove the field** |

Budget: Plan tab ≤ 110 en words.

### 2.3 Lab tab (`lab`)

Keep `lab.resourceId` (`lab-day-NN`). `lab.title` = `Day N — Lab` / `Ngày N — Lab`. Each section is `{ id, title, blocks }`, where the first block is a heading whose `text` equals `title` and whose `id` equals the section `id`. Exactly these 5 sections, in this order:

| # | Section `id` (en / vi) | Heading (en / vi) | Blocks | Limit |
| --- | --- | --- | --- | --- |
| 1 | `intro` / `intro` | H1 `Day N — Lab` / `Ngày N — Lab`, heading id stays `day-N-lab` (no zero padding, as today) | `callout` `quote`: `**Timebox:** 45–60 min. **Output:** <artifacts>.` / `**Thời lượng:** 45–60 phút. **Kết quả:** <…>.` | ≤ 140 chars |
| 2 | `read-first` / `doc-truoc` | H2 `Read first` / `Đọc trước` | `list` `ul`, 2–4 items: `[<Doc> · <topic title>](documents/<lang>/<slug>.md#<heading-id-in-that-lang>): <what to look for>` | what-to-look-for ≤ 8 words |
| 3 | `drill` / `luyen-tap` | H2 `Drill` / `Luyện tập` | `list` `ol`, 3–5 steps. Optional last step starts `Optional:` / `Không bắt buộc:` (replaces Stretch). Optionally 1 `code` block (≤ 15 lines, identical en/vi except comments) only when the exercise is "predict the output" or needs a starter | each step ≤ 160 chars |
| 4 | `say-it` / `noi-thanh-loi` | H2 `Say it out loud` / `Nói thành lời` | 1 `paragraph`: `Answer **<question label>** in 60 s. Cover <2–3 points>.` One question only, one of the day's `questionLinks` | ≤ 260 chars |
| 5 | `algorithm` / `thuat-toan` | H2 `Algorithm` / `Thuật toán` | 1 `paragraph`: `**<Problem>** (<pattern>): [day-NN.md](../artifacts/algo/problems/day-NN.md). Run \`pnpm test:algo -- day-NN\`, then commit \`day-NN: <summary>\`.` No constraints or hints (they live in `algo-day-NN`) | ≤ 220 chars |

Budget: Lab tab ≤ 210 en words. Whole day ≤ 320 en words (today 456). vi/en word ratio 0.9–1.3.

**Do not** keep or recreate: `what-they-will-ask`, `what-you-will-produce`, `how-a-senior-works-this`, `done-when`, `stretch`, `suggested-commit`, or any `Decision / Constraint / Failure mode / Measure / Tradeoff / Production gotcha` labels.

**Id stability.** Stable: file names, `kind`, `day`, `week`, `lab.resourceId`, `algorithm.resourceId`/`path`, section `intro` and its H1 id `day-N-lab`, section `algorithm`/`thuat-toan`. **Deliberately changed:** the six removed lab section ids above and the three new ones. Reason: the sections themselves are removed for duplication. Nothing in this repo links to them, the app renders lab sections generically, and progress is keyed by day number. B0 confirms there are no references in the app repo (section 4).

**Review and mock days** (7, 14, 21, 28, 30) use the same 5 sections. Their Drill is a timed agenda (each step starts with minutes, e.g. "20 min: …").

### 2.4 What goes where

| Content | Where |
| --- | --- |
| Definitions, mechanisms, general trade-offs, pitfalls | KB topic, linked in "Read first" |
| Model spoken answers, follow-ups | Q&A, linked in `questionLinks`, named in "Say it out loud" |
| Algorithm statement, constraints, hints | `plan/resources/algo-day-NN.json` (unchanged) |
| Lab repo setup, commit convention | `plan/resources/lab.json` (unchanged) |
| Daily rhythm (90–120 min), how to use the tabs | `plan/resources/context.json` and `plan.json`, said once |
| Today's tasks, steps, artifacts, checks, the one thing to say aloud | the day file |

### 2.5 Example day (complete): Day 12

This is the full replacement for `plan/days/day-12.json`. It passes `validate.mjs` and `check-content.mjs`, and every KB link resolves to a heading id in the same locale. Size: 304 en words (was 423), 354 vi words (was 488), 10 lab blocks (was 19), 9.4 KB (was 14.2 KB).

Rendered view, en:

> **Day 12 · Nuxt rendering and data fetching**
> **Goal:** Pick a rendering mode and a fetch API per route, and defend both in under a minute.
> **Study:** Nuxt.js · Vue 3   **Q&A:** Nuxt rendering modes · useFetch vs useAsyncData vs $fetch · SSR and hydration errors · Route rules and caching
> **Hands-on:** Write `routeRules` for 3 admin routes, one reason each. · Move one `$fetch` call to `useFetch` with a stable `key`. · Reproduce and fix one hydration mismatch.
> **Algorithm:** Reverse Linked List · Pointer reversal
> **Checklist:** ☐ `routeRules` covers 3 routes, each with a reason. ☐ The Network tab shows the refactored call runs once. ☐ "useFetch vs useAsyncData" answered aloud in 60 s, no notes.
>
> **Lab.** Timebox: 45–60 min. Output: `routeRules`, one refactored fetch, one fixed hydration bug.
> **Read first:** Nuxt · CSR vs SSR vs SSG vs SPA (which mode fits which route) · Nuxt · useAsyncData vs useFetch vs $fetch (keys and double fetching) · Vue 3 · Hydration mismatch (causes and how to read the warning)
> **Drill:** 1. For each route, note who sees it, whether SEO matters, and how fresh the data must be. Map that to `ssr: false`, `prerender`, or `swr`. 2. Move a `$fetch` inside `onMounted` to `useFetch` with a stable `key`. Confirm a single request in the Network tab. 3. Render `new Date().toLocaleString()`, read the hydration warning, then fix it with a server-formatted value or `<ClientOnly>`. 4. Optional: add `lazy: true` to one call and note what the user sees while it loads.
> **Say it out loud:** Answer **useFetch vs useAsyncData vs $fetch** in 60 s. Cover what the server fetches and the client reuses, why the `key` matters, and when plain `$fetch` is right (actions the user triggers).
> **Algorithm:** Reverse Linked List (pointer reversal): day-12.md. Run `pnpm test:algo -- day-12`, then commit `day-12: nuxt route rules and fetch refactor`.

Rendered view, vi:

> **Ngày 12 · Render và lấy dữ liệu trong Nuxt**
> **Mục tiêu:** Chọn chế độ render và cách lấy dữ liệu cho từng route, rồi bảo vệ cả hai trong chưa tới một phút.
> **Tài liệu:** Nuxt.js · Vue 3   **Q&A:** Các chế độ render của Nuxt · useFetch, useAsyncData hay $fetch · SSR và lỗi hydration · Route rules và cache
> **Thực hành:** Viết `routeRules` cho 3 route admin, mỗi route một lý do. · Chuyển một lần gọi `$fetch` sang `useFetch` với `key` cố định. · Tái hiện và sửa một lỗi hydration mismatch.
> **Thuật toán:** Reverse Linked List · Đảo con trỏ
> **Checklist:** ☐ `routeRules` có đủ 3 route, mỗi route có lý do. ☐ Tab Network cho thấy lần gọi đã sửa chỉ chạy một lần. ☐ Đã trả lời "useFetch hay useAsyncData" thành lời trong 60 giây, không nhìn ghi chú.
>
> **Lab.** Thời lượng: 45–60 phút. Kết quả: `routeRules`, một lần fetch đã sửa, một lỗi hydration đã xử lý.
> **Đọc trước:** Nuxt · CSR, SSR, SSG và SPA (chế độ nào hợp với route nào) · Nuxt · useAsyncData khác useFetch khác $fetch (`key` và lỗi gọi hai lần) · Vue 3 · Hydration mismatch (nguyên nhân và cách đọc cảnh báo)
> **Luyện tập:** 1. Với mỗi route, ghi ai xem, có cần SEO không và dữ liệu cần mới tới đâu. Từ đó chọn `ssr: false`, `prerender` hoặc `swr`. 2. Chuyển một `$fetch` nằm trong `onMounted` sang `useFetch` với `key` cố định. Kiểm tra tab Network chỉ còn một request. 3. Render `new Date().toLocaleString()`, đọc cảnh báo hydration, rồi sửa bằng giá trị format sẵn ở server hoặc `<ClientOnly>`. 4. Không bắt buộc: thêm `lazy: true` cho một lần gọi và ghi lại người dùng thấy gì trong lúc chờ.
> **Nói thành lời:** Trả lời **useFetch, useAsyncData hay $fetch** trong 60 giây. Nói rõ server lấy gì và client dùng lại ra sao, vì sao `key` quan trọng, và khi nào nên dùng `$fetch` trực tiếp (hành động do người dùng bấm).
> **Thuật toán:** Reverse Linked List (đảo con trỏ): day-12.md. Chạy `pnpm test:algo -- day-12`, rồi commit `day-12: nuxt route rules and fetch refactor`.

JSON (copy this shape for every day):

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
    { "en": "Reproduce and fix one hydration mismatch.", "vi": "Tái hiện và sửa một lỗi hydration mismatch." }
  ],
  "algorithm": {
    "resourceId": "algo-day-12",
    "path": "artifacts/algo/problems/day-12.md",
    "label": { "en": "Reverse Linked List · Pointer reversal", "vi": "Reverse Linked List · Đảo con trỏ" }
  },
  "checklist": [
    { "en": "`routeRules` covers 3 routes, each with a reason.", "vi": "`routeRules` có đủ 3 route, mỗi route có lý do." },
    { "en": "The Network tab shows the refactored call runs once.", "vi": "Tab Network cho thấy lần gọi đã sửa chỉ chạy một lần." },
    { "en": "“useFetch vs useAsyncData” answered aloud in 60 s, no notes.", "vi": "Đã trả lời “useFetch hay useAsyncData” thành lời trong 60 giây, không nhìn ghi chú." }
  ],
  "lab": {
    "resourceId": "lab-day-12",
    "title": { "en": "Day 12 — Lab", "vi": "Ngày 12 — Lab" },
    "sections": [
      {
        "id": { "en": "intro", "vi": "intro" },
        "title": { "en": "Day 12 — Lab", "vi": "Ngày 12 — Lab" },
        "blocks": [
          { "type": "heading", "level": 1, "text": { "en": "Day 12 — Lab", "vi": "Ngày 12 — Lab" }, "id": { "en": "day-12-lab", "vi": "day-12-lab" } },
          {
            "type": "callout",
            "kind": "quote",
            "text": {
              "en": "**Timebox:** 45–60 min. **Output:** `routeRules`, one refactored fetch, one fixed hydration bug.",
              "vi": "**Thời lượng:** 45–60 phút. **Kết quả:** `routeRules`, một lần fetch đã sửa, một lỗi hydration đã xử lý."
            }
          }
        ]
      },
      {
        "id": { "en": "read-first", "vi": "doc-truoc" },
        "title": { "en": "Read first", "vi": "Đọc trước" },
        "blocks": [
          { "type": "heading", "level": 2, "text": { "en": "Read first", "vi": "Đọc trước" }, "id": { "en": "read-first", "vi": "doc-truoc" } },
          {
            "type": "list",
            "style": "ul",
            "items": [
              {
                "en": "[Nuxt · CSR vs SSR vs SSG vs SPA](documents/en/nuxt.md#63-csr-vs-ssr-vs-ssg-vs-spa): which mode fits which route.",
                "vi": "[Nuxt · CSR, SSR, SSG và SPA](documents/vi/nuxt.md#63-csr-vs-ssr-vs-ssg-vs-spa): chế độ nào hợp với route nào."
              },
              {
                "en": "[Nuxt · useAsyncData vs useFetch vs $fetch](documents/en/nuxt.md#65-useasyncdata-vs-usefetch-vs-fetch): keys and double fetching.",
                "vi": "[Nuxt · useAsyncData khác useFetch khác $fetch](documents/vi/nuxt.md#65-useasyncdata-vs-usefetch-vs-fetch): `key` và lỗi gọi hai lần."
              },
              {
                "en": "[Vue 3 · Hydration mismatch](documents/en/vue3.md#5211-hydration-mismatch): causes and how to read the warning.",
                "vi": "[Vue 3 · Hydration mismatch](documents/vi/vue3.md#5211-hydration-mismatch): nguyên nhân và cách đọc cảnh báo."
              }
            ]
          }
        ]
      },
      {
        "id": { "en": "drill", "vi": "luyen-tap" },
        "title": { "en": "Drill", "vi": "Luyện tập" },
        "blocks": [
          { "type": "heading", "level": 2, "text": { "en": "Drill", "vi": "Luyện tập" }, "id": { "en": "drill", "vi": "luyen-tap" } },
          {
            "type": "list",
            "style": "ol",
            "items": [
              {
                "en": "For each route, note who sees it, whether SEO matters, and how fresh the data must be. Map that to `ssr: false`, `prerender`, or `swr`.",
                "vi": "Với mỗi route, ghi ai xem, có cần SEO không và dữ liệu cần mới tới đâu. Từ đó chọn `ssr: false`, `prerender` hoặc `swr`."
              },
              {
                "en": "Move a `$fetch` inside `onMounted` to `useFetch` with a stable `key`. Confirm a single request in the Network tab.",
                "vi": "Chuyển một `$fetch` nằm trong `onMounted` sang `useFetch` với `key` cố định. Kiểm tra tab Network chỉ còn một request."
              },
              {
                "en": "Render `new Date().toLocaleString()`, read the hydration warning, then fix it with a server-formatted value or `<ClientOnly>`.",
                "vi": "Render `new Date().toLocaleString()`, đọc cảnh báo hydration, rồi sửa bằng giá trị format sẵn ở server hoặc `<ClientOnly>`."
              },
              {
                "en": "Optional: add `lazy: true` to one call and note what the user sees while it loads.",
                "vi": "Không bắt buộc: thêm `lazy: true` cho một lần gọi và ghi lại người dùng thấy gì trong lúc chờ."
              }
            ]
          }
        ]
      },
      {
        "id": { "en": "say-it", "vi": "noi-thanh-loi" },
        "title": { "en": "Say it out loud", "vi": "Nói thành lời" },
        "blocks": [
          { "type": "heading", "level": 2, "text": { "en": "Say it out loud", "vi": "Nói thành lời" }, "id": { "en": "say-it", "vi": "noi-thanh-loi" } },
          {
            "type": "paragraph",
            "text": {
              "en": "Answer **useFetch vs useAsyncData vs $fetch** in 60 s. Cover what the server fetches and the client reuses, why the `key` matters, and when plain `$fetch` is right (actions the user triggers).",
              "vi": "Trả lời **useFetch, useAsyncData hay $fetch** trong 60 giây. Nói rõ server lấy gì và client dùng lại ra sao, vì sao `key` quan trọng, và khi nào nên dùng `$fetch` trực tiếp (hành động do người dùng bấm)."
            }
          }
        ]
      },
      {
        "id": { "en": "algorithm", "vi": "thuat-toan" },
        "title": { "en": "Algorithm", "vi": "Thuật toán" },
        "blocks": [
          { "type": "heading", "level": 2, "text": { "en": "Algorithm", "vi": "Thuật toán" }, "id": { "en": "algorithm", "vi": "thuat-toan" } },
          {
            "type": "paragraph",
            "text": {
              "en": "**Reverse Linked List** (pointer reversal): [day-12.md](../artifacts/algo/problems/day-12.md). Run `pnpm test:algo -- day-12`, then commit `day-12: nuxt route rules and fetch refactor`.",
              "vi": "**Reverse Linked List** (đảo con trỏ): [day-12.md](../artifacts/algo/problems/day-12.md). Chạy `pnpm test:algo -- day-12`, rồi commit `day-12: nuxt route rules and fetch refactor`."
            }
          }
        ]
      }
    ]
  }
}
```

The repo's JSON uses 2-space indentation with one key per line. Write files with `JSON.stringify(data, null, 2) + "\n"`. The compact form above is only for reading.

### 2.6 Week meta, gaps and plan resources

- `plan/meta.json` `weeks[]`: keep `week`, `title` and `range`. `goal` ≤ 160 chars. `outcomes` exactly 3, ≤ 100 chars each, changed only where section 3 says so.
- `gaps`: cut to 3 items. Drop gap 2 (it's stale: `architecture` 15.6 and `system-design` 16.3 now cover design systems). Drop gap 4 (the arrow-chain "answer shape"). Keep gaps 1 and 3 shortened, and add: "Lab 'Read first' links open the exact KB topic. Plan-tab study links open the whole doc."
- `plan/resources/plan.json` (overview): keep its sections. Rewrite "How to use this plan" to describe the new Plan/Lab split (6 bullets max). Regenerate the day lists from the new titles. Target ≤ 400 en words (now 693).
- `plan/resources/index.json` (daily index): update the table titles. Delete the "decision → constraint → failure mode → how you measure" sentence.
- `plan/resources/context.json`: make "Daily shape" match the tabs (Plan, Read first, Drill, Say it, Algorithm). Keep 90–120 min. Target ≤ 200 en words.
- `plan/resources/react.json` week focus and `algo.json` day bank: sync any titles that changed.
- `algo-day-*`, `lab.json`, `dod.json`, `feature.json`, `selfcheck.json`: unchanged.

---

## 3. Revised 30-day outline

Legend: **Status** = `kept` (same topic, rewritten in the new format), `retitled`, `reworked` (topic changes), `merged`. **KB** = `slug#heading-id` (**en id**). Get the vi id from `node scripts/check-plan.mjs --lookup slug#en-id` (added in B0). 54 of these ids differ in vi. **Q&A** = `questionLinks` ids, in order. The **first** listed Q&A is the one used in "Say it out loud" unless the Say-it line names another one. **Study** = `studyLinks` slugs (plan resources marked `res:`). Algorithm `resourceId`/`path` never change. Only the label gains a pattern.

All 101 KB/Q&A references below were checked against the repo on this commit (0 unresolved).

### Week 1 · Design systems + UI clarity (Days 1–7)
Week outcomes: replace outcome 3 ("Keep the daily algorithm dose small…") with "Spec one overlay primitive with keyboard behaviour and component tests." / "Đặc tả một primitive overlay có hành vi bàn phím và component test."

**Day 1 — Inventory the UI system** · kept
- Goal: Break one real admin screen into tokens, primitives and states, and name the first 3 primitives to extract.
- Tasks: (1) Audit one admin screen into a token table (color, spacing, type, radius). (2) List its repeated states (loading, empty, error, success). (3) Pick 3 primitives to extract, with one reason each.
- KB: `architecture#156-design-system-vs-app-components`, `architecture#151-component-patterns`, `system-design#163-component-library-design`
- Q&A: `design-system-strategy`, `css-layout-specificity`, `scale-codebase-100-features`
- Study: `architecture`, `system-design`, `res:context`
- Drill: screenshot the screen; tabulate tokens and mark semantic vs raw (`color-danger` vs `red-600`; this was the old Stretch); list states; choose 3 primitives. Say it: design-system growth from a real product.
- Algorithm: Two Sum · Hash map
- Output: `day-01-ui-inventory.md` (token table + states + 3 primitives)
- vs current: same topic. Old Stretch folded into Drill. `css-layout` doc link swapped for `system-design` (component library topic); `css-layout-specificity` stays as Q&A.

**Day 2 — Make UI states readable** · kept
- Goal: Design loading, empty, error and partial states for one screen, and expose them through one reusable component.
- Tasks: (1) Build a state matrix for one data screen (5 states × what the user sees and can do). (2) Sketch an `<AsyncState>` API (props, slots, emits). (3) Decide which state changes need an `aria-live` announcement.
- KB: `networking#133-loading-error-empty-and-optimistic-ui`, `accessibility#111-aria-attributes`, `architecture#151-component-patterns`
- Q&A: `dashboard-15-apis`, `lazy-loading-tradeoffs`
- Study: `networking`, `accessibility`, `architecture`
- Algorithm: Valid Anagram · Frequency map
- Output: state matrix + `AsyncState.vue` signature (≤ 30 lines)
- vs current: `practical-questions` doc replaced by `networking` (13.3 is exactly this topic).

**Day 3 — Accessible forms, feedback and keyboard basics** · merged (old Day 3 + the keyboard half of old Day 5)
- vi title: "Form dễ tiếp cận, phản hồi và thao tác bàn phím cơ bản"
- Goal: Make one form usable with a keyboard and a screen reader, and explain each fix.
- Tasks: (1) Rebuild one form with labels, `aria-describedby` errors and a summary on submit. (2) Do a keyboard-only pass of the screen and list 3 fixes (tab order, visible focus, Enter/Escape).
- KB: `accessibility#113-semantic-html`, `accessibility#112-keyboard-navigation`, `accessibility#114-wcag-guidelines`
- Q&A: `accessibility-forms-keyboard`, `semantic-html-vs-aria-bem`
- Study: `accessibility`
- Algorithm: Contains Duplicate · Set
- Output: before/after form snippet + keyboard audit list
- vs current: absorbs the keyboard pass from old Day 5. `javascript` and `web-apis` doc links dropped (no relevant topic).

**Day 4 — Responsive data-heavy UI** · kept
- Goal: Lay out a dense data table for desktop and mobile, and justify each breakpoint decision.
- Tasks: (1) Decide per column: keep, collapse or move into a detail row on mobile. (2) Pick grid or flex for the page shell and the toolbar, with a reason. (3) Fix one overflow bug (long text, sticky header).
- KB: `css-layout#33-when-to-use-flexbox-vs-grid`, `css-layout#34-responsive-design-strategy`, `css-layout#36-intrinsic-sizing-and-overflow`
- Q&A: `css-flexbox-vs-grid`, `css-box-model`, `css-position`
- Study: `css-layout`
- Algorithm: Group Anagrams · Hash map + sorted key
- Output: layout sketch + 3 breakpoint decisions + overflow fix
- vs current: `table-50k-rows` moves to Day 23 (performance). Day 4 stays on layout. `performance` and `architecture` doc links dropped.

**Day 5 — Overlays, focus management and component tests** · reworked (was "Keyboard-first interaction review")
- vi title: "Overlay, quản lý focus và component test"
- Goal: Spec a modal primitive that handles focus correctly, and prove it with component tests.
- Tasks: (1) Write the modal API (Teleport, focus trap, Escape, restore focus, nested modals). (2) Write 4 component test cases for it. (3) Add an automated a11y check to the PR checklist.
- KB: `vue3#521-teleport`, `accessibility#115-testing-a11y-in-ci-and-design-system-prs`, `testing#82-component-testing-with-vue-test-utils`
- Q&A: `a11y-modal-focus-trap`, `modal-nested`, `testing-pyramid`
- Study: `accessibility`, `testing`, `vue3`
- Algorithm: Top K Frequent Elements · Bucket sort
- Output: `Modal.vue` API + `Modal.spec.ts` with 4 test names (bodies optional)
- vs current: keyboard basics moved to Day 3. This day adds the first `testing` link and 3 unused Q&A. Progress for Day 5 now refers to this content.

**Day 6 — Component APIs with TypeScript** · kept
- Goal: Design a typed, generic component API that is hard to misuse.
- Tasks: (1) Type a generic `DataTable<T>` (props, emits, scoped slots). (2) Define its `v-model` contract for selection. (3) Rewrite one bad prop API from your codebase.
- KB: `typescript#2210-typing-vue-props-and-emits`, `typescript#212-generics`, `vue3#528-slots-scoped-slots`
- Q&A: `ts-designing-api-props`, `ts-generics`, `vue-props-emits-vmodel`
- Study: `typescript`, `vue3`
- Algorithm: Valid Parentheses · Stack
- Output: `DataTable.vue` `<script setup lang="ts" generic="T">` signature (≤ 30 lines)

**Day 7 — Week 1 review: mini redesign + mock** · retitled (was "Week 1 mini redesign")
- vi title: "Ôn tuần 1: redesign nhỏ + phỏng vấn thử"
- Goal: Present a one-page redesign of the Day 1 screen and answer 3 Week 1 questions under time.
- Tasks: (1) Write a one-page proposal: tokens, primitives, states, a11y fixes, rollout. (2) Record a 20-min mock on 3 Week 1 questions. (3) Write 2 weak spots to revisit on Day 29.
- KB: `system-design#163-component-library-design`, `leadership#172-architecture-decision-records-adr`
- Q&A: `design-system-strategy`, `tradeoff-example`
- Study: `system-design`, `leadership`, `res:selfcheck`, `res:feature`
- Drill (timed): 25 min proposal · 20 min mock · 5 min weak spots
- Algorithm: Week 1 timed review
- Output: proposal (ADR-style) + recording + weak-spot list

### Week 2 · JS/TS + Vue/Nuxt refresh (Days 8–14)
Week outcomes: keep 1–2. Replace outcome 3 with "Write 3 live-coding utilities from memory: promiseAll, debounce, throttle." / "Viết lại 3 tiện ích live coding không nhìn tài liệu: promiseAll, debounce, throttle."

**Day 8 — JavaScript execution model** · kept
- Goal: Predict the output of async code and explain the event loop, closures and `this` without notes.
- Tasks: (1) Predict, then run, 2 event-loop ordering snippets. (2) Explain one stale-closure bug from real code. (3) Fix one lost-`this` callback 2 ways.
- KB: `javascript#113-event-loop-microtask-macrotask`, `javascript#121-closure-scope`, `javascript#126-hoisting-temporal-dead-zone`, `javascript#123-this-keyword`
- Q&A: `js-event-loop`, `js-closures`, `js-hoisting-tdz`, `js-this-call-bind`
- Study: `javascript`
- Drill: may include one `code` block (≤ 15 lines) with a predict-the-output snippet. The expected output goes in a comment on the last line.
- Algorithm: Binary Search · Sorted data
- Output: snippets with predicted vs actual output
- vs current: `web-apis` and `practical-questions` doc links dropped. `js-this-call-bind` added.

**Day 9 — Promises, cancellation and browser events** · retitled (was "Promises, fetch, and browser events")
- vi title: "Promise, hủy request và sự kiện trình duyệt"
- Goal: Write `promiseAll` from scratch and fix a search race condition with `AbortController`.
- Tasks: (1) Implement `promiseAll` in 15 min with tests. (2) Fix a search-as-you-type race with `AbortController`. (3) Sketch a 401 refresh queue.
- KB: `javascript#112-promise-vs-asyncawait`, `javascript#127-abortcontroller-concurrency-and-cancellation`, `networking#135-abortcontroller-and-timeouts`, `practical-questions#181-handling-401-error-redirect-to-login`
- Q&A: `live-coding-promise-all`, `js-promise-combinators`, `auth-401-refresh-queue`, `dom-event-propagation-delegation`
- Study: `javascript`, `networking`, `practical-questions`
- Say it: `js-promise-combinators` (all vs allSettled vs any vs race).
- Algorithm: Two Sum II · Two pointers
- Output: `promiseAll.ts` + tests, race-fix diff, refresh-queue sketch
- vs current: `promise-basics` dropped (too basic for 5 years). Adds a live-coding drill.

**Day 10 — TypeScript for real frontend models** · kept
- Goal: Type an API boundary so invalid states can't compile, and parse `unknown` safely.
- Tasks: (1) Model one API response as a discriminated union with a type guard. (2) Derive create/update/form types with utility types. (3) Brand one id type.
- KB: `typescript#213-type-narrowing`, `typescript#221-utility-types`, `typescript#226-branded-and-opaque-ids`, `typescript#228-unknown-vs-any`
- Q&A: `ts-narrowing-typeguards`, `ts-utility-types`, `ts-any-unknown-never`, `ts-conditional-mapped-types`
- Study: `typescript`
- Algorithm: Longest Substring Without Repeating Characters · Sliding window
- Output: `api-types.ts`
- vs current: `networking` and `architecture` doc links dropped. `ts-designing-api-props` (Day 6) replaced by 2 unused TS questions.

**Day 11 — Vue reactivity and composables** · kept
- Goal: Build a composable with correct cleanup and explain where reactivity is lost.
- Tasks: (1) Write `useSearch` (debounced query, abort, cleanup on scope dispose). (2) Show one destructuring bug that loses reactivity, and its fix. (3) Decide `shallowRef` or `markRaw` for a 10k-row list.
- KB: `vue3#5110-reactivity-system`, `vue3#517-computed-vs-watch`, `vue3#526-provide-inject`
- Q&A: `vue-reactivity-internals`, `vue-composables`, `vue-computed-watch-watcheffect`, `vue-markraw-shallow-performance`
- Study: `vue3`, `state-management`
- Algorithm: Min Stack · Stack design
- Output: `useSearch.ts` (reused on Day 17)
- vs current: `performance` doc link dropped. `vue-computed-watch-watcheffect` added.

**Day 12 — Nuxt rendering and data fetching** · kept. **Fully written in section 2.5.**
- KB: `nuxt#63-csr-vs-ssr-vs-ssg-vs-spa`, `nuxt#65-useasyncdata-vs-usefetch-vs-fetch`, `vue3#5211-hydration-mismatch` (the example uses these 3. `nuxt#68-hydration-clientonly-lazy-hydration` is an allowed 4th)
- Q&A: `nuxt-rendering-modes`, `nuxt-data-fetching`, `vue-ssr-hydration`, `nuxt-route-rules-caching`
- vs current: `networking` and `performance` doc links dropped. `nuxt-route-rules-caching` added.

**Day 13 — State ownership, Pinia and cache boundaries** · kept
- Goal: Decide where each piece of state lives, and defend the Pinia vs server-cache split.
- Tasks: (1) Classify 8 pieces of app state as local, URL, store or server cache. (2) Design a Pinia permissions store. (3) Write the invalidation rule after one mutation.
- KB: `state-management#73-when-to-use-global-vs-local-state`, `state-management#77-server-cache-vs-client-store`, `state-management#76-ssr-hydration-of-stores`
- Q&A: `pinia-design`, `tanstack-query-vs-global-store`, `role-permission-ui`, `api-caching`
- Study: `state-management`, `nuxt`
- Algorithm: Linked List Cycle · Floyd pointers
- Output: state ownership table + `usePermissionsStore.ts` outline
- vs current: `monitoring` doc link dropped. `api-caching` added.

**Day 14 — Week 2 review: performance and debugging** · retitled (was "Performance and debugging review")
- vi title: "Ôn tuần 2: hiệu năng và debug"
- Goal: Diagnose one slow interaction end to end, and write debounce and throttle from memory.
- Tasks: (1) Implement `debounce` and `throttle` in 20 min with tests. (2) Record one Performance-panel trace: cause, fix, metric before and after. (3) Rehearse the perf story (STAR, 90 s).
- KB: `performance#925-core-web-vitals-in-2026`, `performance#921-code-splitting-strategies`, `performance#923-debounce-vs-throttle`, `monitoring#193-performance-monitoring`
- Q&A: `perf-issue-story`, `core-web-vitals`, `vue-performance-patterns`, `live-coding-debounce`
- Study: `performance`, `monitoring`
- Drill (timed): 20 min live coding · 25 min trace · 10 min story
- Algorithm: Week 2 timed review
- Output: `debounce.ts`, `throttle.ts`, trace note, recorded story

### Week 3 · React + Next.js from a Vue lens (Days 15–21)
Week outcomes: unchanged.

**Day 15 — React mental model for a Vue dev** · kept
- Goal: Map Vue concepts to React and explain why React re-renders where Vue doesn't.
- Tasks: (1) Fill a Vue-to-React mapping table (8 concepts). (2) Port one small Vue component to `.tsx`. (3) Explain what re-renders when the parent's state changes.
- KB: `react#2011-virtual-dom-reconciliation`, `react#2013-jsx-rendering-model`, `react#2014-props-vs-state`, `nextjs#213-nuxt-next-mental-map`
- Q&A: `react-rerender-model-vs-vue`, `learning-react-as-vue-dev`, `react-props-state-lifecycle-hooks`
- Study: `react`, `nextjs`
- Algorithm: Binary Tree Level Order Traversal · BFS
- Output: mapping table + ported `.tsx`
- vs current: duplicate `react` doc link removed. `state-management-react` moves to Day 16.

**Day 16 — State, refs and controlled inputs in React** · kept
- Goal: Choose between state, ref and context for each value, and write a controlled form without extra renders.
- Tasks: (1) Build a controlled search input and an uncontrolled file input. (2) Split a context that re-renders too much. (3) Keep the previous value in `useRef`.
- KB: `react#2015-controlled-inputs-vue-v-model-equivalent`, `react#20110-refs-useref-vs-vue-ref-template-ref`, `react#2021-context-vs-vue-provide-inject`, `state-management-react#224-local-vs-context-vs-store-vs-server-cache`
- Q&A: `react-controlled-vs-uncontrolled`, `react-usestate-useref`, `react-context-limits`, `react-hooks-rules`
- Study: `react`, `state-management-react`
- Algorithm: Maximum Depth of Binary Tree · DFS
- Output: `SearchForm.tsx`
- vs current: `typescript` doc link dropped. `react-hooks-rules` added.

**Day 17 — Effects, async cleanup and error boundaries** · kept
- Goal: Port `useSearch` to React with correct cleanup, and delete one effect that shouldn't exist.
- Tasks: (1) Port Day 11 `useSearch` to a hook with `AbortController` cleanup, safe under StrictMode. (2) Replace one effect with derived state or `useMemo`. (3) Place one error boundary and list what it won't catch.
- KB: `react#2017-effects-useeffect-vs-vue-watch-lifecycle`, `react#20112-when-to-fetch-data`, `react#2018-derived-values-usememo-vs-vue-computed`, `react#2024-error-boundaries`
- Q&A: `useeffect`, `usememo-usecallback`, `error-boundary-limits`
- Study: `react`
- Algorithm: Lowest Common Ancestor of a BST · BST property
- Output: `useSearch.ts` (React) + note on the removed effect
- vs current: `perf-issue-story` removed (it's Day 14's). `usememo-usecallback` added. `javascript` and `practical-questions` doc links dropped.

**Day 18 — App Router, layouts, loading and errors** · kept
- Goal: Sketch an App Router tree for the admin app and mark every Server/Client boundary with a reason.
- Tasks: (1) Draw the `app/` tree with layouts, `loading.tsx` and `error.tsx`, each mapped to its Nuxt equivalent. (2) Mark Server vs Client components with one reason each.
- KB: `nextjs#215-app-router-fundamentals`, `nextjs#217-routing-layouts-and-navigation`, `nextjs#214-csr-vs-ssr-vs-ssg-vs-spa-and-rsc`
- Q&A: `next-server-client-components`, `next-app-router-rsc`, `next-app-router-layouts-loading-error`
- Study: `nextjs`, `nuxt`
- Algorithm: Number of Islands · Grid DFS
- Output: annotated tree (text). No `create-next-app` yet (that's Day 21)
- vs current: removes the inaccurate "Production gotcha" (see P2).

**Day 19 — Next data fetching, cache and rendering modes** · kept
- Goal: Choose static, dynamic or revalidated rendering per route, and compare it with Nuxt `routeRules`.
- Tasks: (1) Pick a fetch and cache option for 3 routes (static, `revalidate`, dynamic). (2) Write the Nuxt equivalent for each, next to it. (3) Decide where TanStack Query still helps.
- KB: `nextjs#216-data-fetching-patterns`, `nextjs#2110-rendering-caching-cheat-sheet`, `state-management-react#225-server-state-tanstack-query-swr`
- Q&A: `next-data-fetching-cache-revalidation`, `next-rendering-modes-streaming`, `nuxt-data-fetching`
- Study: `nextjs`, `state-management-react`
- Algorithm: Climbing Stairs · 1D DP
- Output: 3-route table (Next vs Nuxt)
- vs current: `networking` and `nuxt` doc links swapped for `state-management-react`.

**Day 20 — Server Actions, middleware, SEO and assets** · kept
- Goal: Use Server Actions and middleware where they fit, and say when they don't.
- Tasks: (1) Write one Server Action with validation and `revalidatePath`. (2) Write auth-redirect middleware and list 2 things it must not do. (3) Add `metadata`, `next/image` and `next/font` to one page.
- KB: `nextjs#219-server-actions-mutations`, `nextjs#218-middleware`, `performance#924-image-font-optimization`, `security#102-csrf-protection`
- Q&A: `next-server-actions`, `next-middleware-use-cases`, `next-metadata-image-font-deployment`
- Study: `nextjs`, `security`, `performance`
- Algorithm: Coin Change · Unbounded DP
- Output: action + middleware snippets
- vs current: `build-tools` doc link swapped for `performance`.

**Day 21 — Week 3 review: small Next.js slice** · retitled (was "Small Next.js hands-on task")
- vi title: "Ôn tuần 3: một lát cắt Next.js nhỏ"
- Goal: Ship a small `/customers` route in Next and explain it as a Vue developer in 2 minutes.
- Tasks: (1) Build `/customers`: layouts, server-fetched list, client filter, loading, error, metadata. (2) Deploy a preview. (3) Record a 2-min walkthrough comparing it with Nuxt.
- KB: `nextjs#2112-common-production-failures`, `nextjs#2111-when-to-choose-next-vs-spa-react`, `devops#143-preview-deployments-and-env-vars`
- Q&A: `fe-ci-preview-deploys`, `next-app-router-rsc`, `react-rerender-model-vs-vue`
- Study: `nextjs`, `devops`
- Drill (timed): 60 min build · 10 min deploy · 10 min recording
- Algorithm: Week 3 timed review
- Output: preview URL + recording
- vs current: `note` removed (the timebox says it). `next-data-fetching-cache-revalidation` (Day 19) replaced by a review of `react-rerender-model-vs-vue`.

### Week 4 · System design + behavioral integration (Days 22–28)
Week outcomes: add "Tell 4 collaboration stories: code review, disagreement, mentoring, saying no." / "Kể 4 câu chuyện phối hợp: code review, bất đồng, mentoring, từ chối." in place of the least specific outcome.

**Day 22 — Design an admin dashboard** · kept
- Goal: Run a 35-min frontend system design for a dashboard with 15 data sources.
- Tasks: (1) Run the 35-min design: requirements, components, data flow, caching, failure states. (2) Write an ADR for the BFF decision. (3) List 3 frontend signals you'd monitor.
- KB: `system-design#164-example-design-a-large-dashboard`, `system-design#161-frontend-architecture-decisions`, `system-design#162-caching-strategy`, `leadership#172-architecture-decision-records-adr`
- Q&A: `dashboard-15-apis`, `bff-when`, `adr-when-you-write-one`, `observability-frontend`
- Study: `system-design`, `leadership`, `monitoring`
- Algorithm: House Robber · 1D DP
- Output: diagram + ADR
- vs current: `architecture` doc link dropped. `observability-frontend` added.

**Day 23 — Data-heavy surfaces and performance trade-offs** · kept
- Goal: Make a 50k-row table and a feed fast, and cut a 3 MB bundle, with numbers.
- Tasks: (1) Pick virtualization, pagination or a worker for 50k rows, and state the metric. (2) Design an infinite feed (cursor, prefetch, memory cap). (3) Write a plan to shrink a 3 MB main chunk.
- KB: `performance#914-performance-case-studies`, `build-tools#123-how-youd-debug-a-3mb-main-chunk`, `web-apis#42-web-workers`
- Q&A: `table-50k-rows`, `design-news-feed`, `bundling-code-splitting`, `vite-vs-webpack-tradeoffs`
- Study: `performance`, `build-tools`, `web-apis`
- Algorithm: Warm-up easy set
- Output: decision table with target metrics
- vs current: `service-worker-when-not` dropped (narrow). `design-news-feed` and `bundling-code-splitting` added.

**Day 24 — Security, release and resilience** · kept
- Goal: Explain token storage, XSS/CSRF defences and a safe flag rollout for your own app.
- Tasks: (1) Pick token storage for the admin app and defend it. (2) List XSS and CSRF defences that already exist in your stack. (3) Write a flag rollout and rollback plan with an error-spike trigger.
- KB: `security#101-xss-prevention`, `security#103-authentication-best-practices`, `devops#144-feature-flags`, `monitoring#196-feature-flag-error-spike-playbook`
- Q&A: `auth-token-storage`, `csrf-vs-xss`, `oauth-pkce-spa`, `feature-flags-rollout`
- Study: `security`, `devops`, `monitoring`
- Algorithm: Live coding simulation
- Output: one-page security and rollout note
- vs current: `build-tools` doc link dropped. `auth-token-storage` added.

**Day 25 — Behavioral stories: intro, impact, seniority** · kept
- Goal: Deliver a 90-s self-intro and one measurable impact story.
- Tasks: (1) Write and record a 90-s intro (Vue depth first, React as growth). (2) Write one impact story in STAR form with a number (use `[metric]` if unknown). (3) Write your one-line definition of senior.
- KB: `leadership#173-complexity-estimation`
- Q&A: `self-intro`, `biggest-impact`, `what-is-senior`
- Study: `leadership`, `practical-questions`, `res:selfcheck`
- Algorithm: Weak-topic drill #1
- Output: intro recording + STAR card

**Day 26 — Behavioral stories: project, trade-offs and the React gap** · kept
- Goal: Tell your recent project, one trade-off and the React gap as honest, structured stories.
- Tasks: (1) Write a 2-min project walkthrough (problem, your role, architecture, result). (2) Write one trade-off story with the option you rejected. (3) Write a 30-s answer on the React gap.
- KB: `leadership#172-architecture-decision-records-adr`, `practical-questions#187-how-you-handle-a-production-incident-as-frontend`
- Q&A: `recent-project`, `tradeoff-example`, `learning-react-as-vue-dev`
- Study: `leadership`, `practical-questions`
- Algorithm: Weak-topic drill #2
- Output: 3 STAR cards
- vs current: `nextjs` doc link dropped.

**Day 27 — Leadership and collaboration stories** · reworked (was "Cross-stack review and weak spots")
- vi title: "Câu chuyện về leadership và phối hợp"
- Goal: Have 4 short collaboration stories ready: code review, disagreement, mentoring and saying no.
- Tasks: (1) Write a 6-line STAR card for each of the 4 questions. (2) Record the 2 weakest ones.
- KB: `leadership#176-code-review-as-leadership`, `leadership#174-conflict-resolution`, `leadership#171-technical-mentorship`, `leadership#175-saying-no-pushing-back-on-pm`
- Q&A: `code-review-approach`, `disagree-tech-decision`, `mentoring-junior`, `when-to-say-no`
- Study: `leadership`
- Algorithm: Big-O flashcards
- Output: 4 STAR cards + 2 recordings
- vs current: the weak-spot review moves to Day 29. `quality-bar-definition` and `handle-ambiguity` move to Day 29. 3 unused soft questions added. Progress for Day 27 now refers to this content.

**Day 28 — Mock round 1** · kept
- Goal: Pass a 60-min mixed mock: system design, live coding and one story.
- Tasks: (1) 30 min: design autocomplete (debounce, cancel, cache, a11y). (2) 20 min: live-code an event emitter. (3) 10 min: tell your recent project, then write 3 fixes.
- KB: `networking#135-abortcontroller-and-timeouts`, `performance#923-debounce-vs-throttle`, `system-design#161-frontend-architecture-decisions`
- Q&A: `design-autocomplete`, `live-coding-event-emitter`, `recent-project`
- Study: `system-design`, `res:selfcheck`, `res:algo`
- Drill (timed): as the tasks above, plus a 5-min self-score with `res:selfcheck`
- Algorithm: Cooldown easy problem
- Output: recording + 3 fixes (added to the weak-spot list)
- vs current: `design-system-strategy` replaced by `live-coding-event-emitter`. `practical-questions` doc link dropped.

### Final days · Review + mock interview (Days 29–30)
Week outcomes: unchanged.

**Day 29 — Weak spots and company fit** · retitled (was "Final review and company fit")
- vi title: "Điểm yếu và mức độ phù hợp với công ty"
- Goal: Close your 3 weakest answers and prepare company-specific answers and questions.
- Tasks: (1) Redo the 3 weakest answers from the Day 7, 14, 21 and 28 lists. (2) Write a one-page company brief and "why this company". (3) Write 5 questions to ask the interviewer.
- KB: `practical-questions#188-how-you-onboard-onto-an-unknown-vue-codebase-in-week-1`
- Q&A: `why-company`, `career-growth-plan`, `handle-ambiguity`, `quality-bar-definition`
- Study: `leadership`, `res:selfcheck`, `res:dod`
- Algorithm: Pattern review + one random problem
- Output: 3 re-recorded answers + company brief + 5 questions
- vs current: absorbs the weak-spot work from old Day 27. `success-metrics-senior` replaced by 2 questions moved from Day 27.

**Day 30 — Full mock interview + retrospective** · kept
- Goal: Pass a 75-min full mock and leave with a short maintenance plan.
- Tasks: (1) Run the full mock: intro 5, technical 20, system design 25, live coding 15, behavioral 10 min. (2) Write a retrospective: top 3 fixes and a weekly maintenance routine.
- KB: `system-design#161-frontend-architecture-decisions`
- Q&A: `strengths-weaknesses`, `mistake-hardship`, `design-realtime-chat`, `live-coding-deep-clone`
- Study: `res:selfcheck`, `res:algo`, `system-design`
- Drill (timed): the mock agenda, then 15 min retro
- Algorithm: Mock live-coding problem
- Output: recording + retro note
- vs current: `tradeoff-example` (already used twice) replaced by `design-realtime-chat` and `live-coding-deep-clone`. `react` doc link dropped.

### Summary of changes vs the current plan

| Change | Days |
| --- | --- |
| Merged | Old Day 3 + keyboard half of old Day 5 become Day 3 |
| Reworked (new topic on the same day number) | Day 5 (overlays + component tests), Day 27 (leadership and collaboration stories) |
| Moved | Weak-spot review from Day 27 to Day 29. `table-50k-rows` from Day 4 to Day 23 |
| Retitled | 7, 9, 14, 21, 29 (review days get a "Week N review:" prefix) |
| Cut everywhere | 6 lab sections per day, 6-label "senior" bullets, boilerplate Done-when line, algorithm constraints and hints in the lab, Day 21 `note` |
| Added | ~90 KB topic deep links (0 today). Q&A coverage 68 → 93 distinct ids. First `testing` links. 4 of 5 live-coding questions linked (`live-coding-throttle` is practised inside Day 14's task) |
| Not reordered | Every other day keeps its number and topic, so progress checkmarks stay meaningful |

---

## 4. Execution batches (one PR each, in this order)

Every batch: branch from the latest `main`, open a draft PR, put the before/after stats table from `check-plan.mjs --stats` in the PR body, don't merge.

| Batch | Scope | Files |
| --- | --- | --- |
| **B0 · Tooling** | Add `scripts/check-plan.mjs` and `scripts/sync-plan-index.mjs` (spec below). Add a `node scripts/check-plan.mjs .` step to `.github/workflows/validate.yml` (warn mode). Document both in `README.md`. Run `gh search code "how-a-senior-works-this" --repo parker2808/interview-senior-fe` (and the other 5 removed section ids). If the app references any of them, stop and report. No content changes | `scripts/*`, `.github/workflows/validate.yml`, `README.md` |
| **B1 · Week 1** | Days 1–7 rewritten from section 3. `meta.json` week 1 outcome 3 | `plan/days/day-01…07.json`, `plan/meta.json`, `plan/index.json` (regenerated) |
| **B2 · Week 2** | Days 8–14 (Day 12 = section 2.5 verbatim). Week 2 outcome 3 | `day-08…14`, `meta.json`, `index.json` |
| **B3 · Week 3** | Days 15–21 | `day-15…21`, `index.json` |
| **B4 · Week 4a** | Days 22–26. Week 4 outcome | `day-22…26`, `meta.json`, `index.json` |
| **B5 · Week 4b + final days** | Days 27–30 | `day-27…30`, `index.json` |
| **B6 · Resources + strict** | `gaps` (section 2.6). `plan/resources/plan.json`, `index.json` (resource), `context.json`, `react.json`, `algo.json` title sync. Switch the CI step to `--strict`. Add a status line and final stats at the top of this file | `plan/meta.json`, `plan/resources/*.json`, `plan/index.json`, workflow, this file |

Per-day procedure (B1–B5):
1. Open the current day file only to copy `day`, `week`, `algorithm.resourceId`/`path` and the vi title (for `kept` days).
2. Write the day from section 3 using the section 2.5 shape. Write en and vi together, block by block.
3. Resolve every vi heading id with `node scripts/check-plan.mjs --lookup <slug>#<en-id>`.
4. Labels: `studyLinks` label = KB doc `title` (vi from the doc's `title.vi`). `questionLinks` label ≤ 45 chars.
5. Run `node scripts/sync-plan-index.mjs`, then the validation in section 5 with `--days <range> --strict`.

### `scripts/check-plan.mjs` spec (B0)

Zero dependencies, Node 22, same style as `check-content.mjs`. Exit 1 on errors. Budget and format rules are warnings unless `--strict` is passed. `--days 1-7` limits the per-day rules to a range. `--stats` prints per-day en/vi words, bytes and block counts. `--lookup slug#en-id` prints the vi id.

Errors (always):
1. Exactly 30 files `day-01…day-30`. `day` equals the file number. `week` matches the `meta.weeks[].range` the day falls in. `lab.resourceId === "lab-day-NN"`. `algorithm.resourceId === "algo-day-NN"` and `plan/resources/algo-day-NN.json` exists.
2. `studyLinks`: `docs` slugs exist in `knowledge-base/`. `plan` resourceIds exist in `plan/resources/`. No duplicate slugs per day.
3. `questionLinks` ids exist in `qna/questions.json`. No duplicate id per day.
4. Every `documents/<lang>/<slug>.md#<id>` link in a lab string: `<lang>` equals the string's locale, and `<id>` is a heading id of that doc in that locale. Every `artifacts/algo/problems/day-NN.md` link points to the same day. No other relative links (no `./x.md`, no `/interview?q=`).
5. vi/en parity per day: same number of list items, sections and blocks. Same set of link targets per string (slug and heading block, after mapping ids). Same backtick-span count per string (±1).
6. `plan/index.json` equals `sync-plan-index` output.
7. No calendar dates (`\b20\d\d-\d\d-\d\d\b`, month names, weekdays in en and vi).

Format rules (warn, error with `--strict`):
8. Section 2.2 counts and char limits. Section 2.3: exactly 5 sections with ids `intro, read-first, drill, say-it, algorithm` (vi `intro, doc-truoc, luyen-tap, noi-thanh-loi, thuat-toan`), and the block types listed there.
9. Word budgets: Plan ≤ 110, Lab ≤ 210, total ≤ 320 en words. vi/en word ratio 0.9–1.3.
10. No `handsOn`/`checklist` string appears verbatim in the lab. No string shared verbatim by more than 3 days (except headings, the timebox prefix and the run command).
11. Banned in any string: `**Decision:**`, `**Constraint:**`, `**Failure mode:**`, `**Measure:**`, `**Tradeoff:**`, `**Production gotcha:**`, `How a senior works this`, `Done when`, `Stretch`, `What they will ask`, `→`. Banned in vi outside backticks: `\b(produce|note|set|measure|stretch|constraint|gotcha|failure mode|Day \d)\b` (case-insensitive).
12. The bold question in `say-it` equals the en/vi label of one of the day's `questionLinks`.

`scripts/sync-plan-index.mjs`: writes `plan/index.json` = `{ weeks, gaps, resources }` from `meta.json` + `days` = each day file without `lab`, keeping key order. `--check` exits 1 if the file would change. Today this must produce no diff (verified: `days[]` equals the day files minus `lab`).

---

## 5. Validation (every batch, all must pass)

```bash
node scripts/validate.mjs .
node scripts/check-content.mjs .
node scripts/sync-plan-index.mjs --check
node scripts/check-plan.mjs . --days <batch range> --strict   # B1–B5
node scripts/check-plan.mjs . --strict                        # B6 and after
node scripts/check-plan.mjs . --stats                         # paste into the PR body
```

Manual checks per batch:
- Read one rewritten day in both locales end to end (in the JSON or a quick render). vi must read naturally, with no English grammar words (KB style guide 2.5).
- Open 2 random "Read first" links: the target heading text must match the link text.
- Confirm that no theory sentence ("X works by…", "X is better because…") is left in the day. If one is, link the KB topic instead.

Expected result after B6:

| Metric | Now | Target |
| --- | --- | --- |
| Day files (bytes) | 427 KB | ≈ 285 KB (−33%) |
| en words, 30 days | 13,682 (456/day) | ≈ 9,000 (≤ 320/day, −34%) |
| vi words, 30 days | ≈ 15,060 | ≈ 10,500 |
| Lab sections / blocks per day | 8 / 19 | 5 / 10 |
| Verbatim repeated items (Plan copied into Lab) | 150 | 0 |
| Non-heading lines repeated on all 30 days | 6 | 1 (the run command) |
| KB topic deep links | 0 | ≈ 90 |
| Distinct Q&A ids linked | 68 | 93 |
| KB docs never linked | 1 (`testing`) | 0 |
| `plan.json` + `context.json` + daily `index.json` (en words) | 1,296 | ≈ 850 |
