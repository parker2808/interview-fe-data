# Vietnamese (vi) style guide

Applies to every `vi` string in `knowledge-base/`, `qna/`, `plan/`, `practice/`. The `en` string is the source of truth. Companion files: [`vi-glossary.json`](./vi-glossary.json) (terms), [`vi-rewrite-plan.md`](./vi-rewrite-plan.md) (batches, audit, checks), [`vi-pilot.md`](./vi-pilot.md) (before/after).

## 1. Tone

- Write like a senior dev explaining something to a colleague over coffee. Friendly, direct, no lecturing.
- Short sentences. One idea per sentence. If an en sentence has three clauses, two vi sentences are usually better.
- Natural spoken Vietnamese that a Vietnamese FE dev would actually say. Read it aloud: if it sounds like Google Translate, rewrite it.
- Address the reader as **bạn**.
- First person in STAR stories (`example` fields of soft/situational Q&A) and in the spoken scripts (`**Nói khi phỏng vấn ...:**` quotes): **mình** for "I", **bọn mình** or **team mình** for "we". Never `tôi` / `chúng tôi` there.
- Small particles are welcome when they help the rhythm: *thôi, luôn, đó, nhé, mà, chứ*. One per sentence at most. Don't overdo it.

## 2. Core rules

1. **Rewrite the meaning, not the words.** Read the whole en paragraph, then write how you'd say it in Vietnamese. Word order, sentence count, and idioms may change. Facts, numbers, names, and the claim must not.
2. **English idioms become plain meaning.** "victory lap", "force field", "hammer", "org clock", "junk drawer", "release train", "the bet dies" have no literal vi equivalent. Say what they mean ("khoe thành tích", "không phải lá chắn", "cách ép buộc", "lịch release của team khác", "chỗ chứa đủ thứ lộn xộn").
3. **Keep dev terms in English** (see glossary `keep:true`): render, state, hook, closure, props, token, PR, CI, deploy, source map, route, cache, bundle, chunk, build, commit, merge, review, rollout, layer, selector, component, store, contract, owner, trade-off, etc. Don't add vi glosses in parentheses unless the en has one. Use the en casing (`useEffect`, `Pinia`, `DevTools`).
4. **Translate only general words** (see glossary `vi:`): "team" can stay, but "user problem" becomes "vấn đề của user", "constraint" becomes "ràng buộc", "result" becomes "kết quả".
5. **No calques of English connectors.** "plus" is *và / kèm*, not *cộng*. "own X" is *chịu trách nhiệm X / phụ trách X / X là của mình*, not *sở hữu X*. "name X" (verb) is *nêu rõ X*, not *gọi X*. "fat chunk" is *chunk quá nặng*, not *chunk béo*. "surface" is *màn / phần / chỗ*, not *bề mặt*.
6. **Same length budget.** vi word count stays within 0.9–1.3× en (enforced for plan days, good practice everywhere). Shorter is fine if nothing is lost.
7. **Don't add or drop content.** No extra tips, no softened claims, no removed caveats.

## 3. Fixed strings (CI-enforced, do not rewrite)

| Where | Must stay exactly |
| --- | --- |
| Technical Q&A labels | `**Trả lời ngắn:**`, `**Giải thích:**`, `**Góc nhìn senior:**`, `**Lỗi hay gặp:**`, `**Nói khi phỏng vấn (~45 giây):**` |
| Soft/situational Q&A labels | `**Nhà tuyển dụng muốn thấy:**`, `**Cách trình bày:**`, `**Tín hiệu senior nên có:**`, `**Nên tránh:**` |
| Plan day `lab.title.vi` | `Ngày N — Lab` (the only allowed em dash) |
| Plan day `checklist[2].vi` | must contain `thành lời` and `60 giây` |
| Plan/practice link `label.vi` to a KB doc | must equal that doc's `title.vi` |
| Any `id` (heading `id.vi`, `sections[].id.vi`) | unchanged, even if the heading text changes (anchors depend on it) |
| STAR step names | `Situation:`, `Task:`, `Action:`, `Result:` stay in English |

**STAR bold markers:** `check-content.mjs` requires the same count of `**…:**` labels in en and vi. The approved example below bolds `**Situation:**`, but most en `example` fields write `Situation:` without bold. Match en: bold in vi only if en is bold. (If the bold style is wanted everywhere, bold the en labels too in a separate change first.)

## 4. Punctuation

- **No em dashes (`—`) and no en dashes used as dashes in vi prose.** Use a comma, a colon, parentheses, or split into two sentences. Numeric ranges keep `–` (`Vite 5–7`, `0.90–1.30`). Exception: `Ngày N — Lab`.
- Sentence-ending period goes outside closing quotes: `“nhanh”.`, not `“nhanh.”`.
- Use the en quote style (`“ ”`) for quoted phrases. Don't add quotes the en doesn't have.
- No space before `:` `,` `.` `?` `!`. A space after them.
- Numbers: digits for counts in stories (`3 PR`, `một tháng` can stay as words when it reads better). Units in vi: `giây`, `phút`, `ngày`. Keep `ms`, `KB`, `MB`, `s` in code-like contexts.

## 5. Preserve structure exactly

- **Markdown:** same number of list lines, numbered items, headings, `**bold:**` labels, blockquotes (`> `), tables (same rows/columns), and `*italic*` spans in the same places.
- **Code:** inline `code` is copied byte-for-byte. Fenced blocks keep the same fence and line count; only comments inside code may be rewritten, and only in `vi` copies of code. Never touch the `code.text` of practice tasks (it is not localized).
- **Links:** same count, same URL/anchor targets (`[text](#211-interface-vs-type)`), only the link text is rewritten.
- **Placeholders and identifiers:** file paths (`apps/*`, `packages/ui`), commands, package names, question ids (`micro-frontends-when`), section refs (`12.1`, `§1.6`) stay as is.
- **JSON:** edit only string values under a `vi` key. Never change keys, order, `en`, ids, numbers, or arrays.

## 6. Bad → good examples

1. **STAR, approved example**
   - en: `Situation: a Button padding fix on the internal admin product took three PRs in three repos, and one app stayed on the old token for a month...`
   - bad: `Situation: một lần sửa padding Button trên sản phẩm admin nội bộ mất ba PR trong ba repo, và một app ở token cũ một tháng.`
   - good: `**Situation:** Chỉ sửa padding của Button trong admin nội bộ thôi mà mất 3 PR ở 3 repo, có app còn dùng token cũ suốt một tháng.`
   - (Bold only if the en is bold, see §3.)

2. **Calque of "plus"/"name"**
   - en: `They hire you if you can name ESM plus pre-bundling, HMR cost, source maps...`
   - bad: `Họ thuê nếu bạn gọi được ESM cộng pre-bundle, phí HMR, source map...`
   - good: `Bạn ghi điểm khi nói rõ được ESM và pre-bundling, cái giá của HMR, source map...`

3. **Idiom "victory lap"**
   - en: `What you would still change, so it does not sound like a victory lap.`
   - bad: `Thứ bạn vẫn muốn đổi, để không nghe như vòng chiến thắng.`
   - good: `Nói luôn chỗ bạn vẫn muốn làm lại, để câu chuyện không nghe như đang khoe.`

4. **Idiom "force field"**
   - en: `Vue scoped CSS adds an attribute selector, one class of specificity, not a force field.`
   - bad: `Scoped CSS của Vue thêm attribute selector — một bậc class — không phải lực trường.`
   - good: `Scoped CSS của Vue chỉ thêm một attribute selector (tương đương một class), chứ không phải lá chắn gì cả.`

5. **"own" as sở hữu**
   - en: `Task: what you owned, and what you did not.`
   - bad: `Task: bạn sở hữu gì, và không sở hữu gì.`
   - good: `Task: phần nào bạn chịu trách nhiệm, phần nào không.`

6. **Em dash + literal "the bet dies"**
   - en: `Ignoring CI time — that is how the bet dies.`
   - bad: `Bỏ qua thời gian CI — đó là cách cú hích chết.`
   - good: `Bỏ qua thời gian CI. Monorepo thường thất bại đúng ở chỗ này.`

7. **Translated tech term**
   - en: `State ownership you can defend: URL for shareable filters, not a dump into Pinia.`
   - bad: `Ownership state bạn bảo vệ được: URL cho filter share được, không đổ vào Pinia.`
   - good: `Giải thích được state nào nằm ở đâu: filter cần share thì để trên URL, đừng nhét hết vào Pinia.`

8. **"org clocks" / "release train"**
   - en: `...two org clocks that already hate sharing a pipeline.`
   - bad: `...hai đồng hồ org đã ghét chia pipeline.`
   - good: `...hai team có lịch release riêng và vốn đã không muốn dùng chung pipeline.`

9. **Doc intro, word-for-word "This doc is X"**
   - en: `This doc is senior frontend build tools: why the Vite dev server is a different product from the production bundle...`
   - bad: `Tài liệu này là công cụ build frontend mức senior: vì sao dev server Vite là sản phẩm khác bundle production...`
   - good: `Bài này nói về build tool ở góc nhìn senior: vì sao dev server của Vite và bundle production là hai thứ khác hẳn nhau...`

10. **Spoken script, first person**
    - en: `> I do not escalate IDs to win a button.`
    - bad: `> Tôi không leo ID để thắng một button.`
    - good: `> Mình không thêm ID chỉ để button thắng.`

## 7. Self-check per string

- Would a Vietnamese FE dev say this sentence out loud? If not, rewrite.
- Any `—`? Any `cộng`, `sở hữu`, `bề mặt`, `đồng hồ`, `búa`, `Tôi` in a story? Fix.
- Same bold labels, list lines, code, links as en? If not, fix before moving on.
