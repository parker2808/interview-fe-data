# vi pilot: before / after

Five representative items rewritten per [`vi-style-guide.md`](./vi-style-guide.md), for review before the batch run. **Not applied to the JSON yet** (B01 applies them after approval).

Verified by applying these values in a scratch worktree: `validate.mjs`, `check-content.mjs`, `check-plan.mjs --strict`, `check-practice.mjs --strict` all pass after the sync scripts. Only `vi` values change.

Notes:

- STAR labels stay plain (`Situation:`) because the en `example` is plain and `check-content.mjs` requires equal `**…:**` counts. See plan §6.
- `monorepo-strategy.question.vi` changed, so the matching `questionLinks[0].label.vi` in `p01` changes with it.
- Fixed strings kept: Q&A section labels, `Ngày 1 — Lab`, `thành lời` / `60 giây`, KB-title link labels, `title.vi` of `build-tools` (it is reused as a link label).
- Strings not listed below were judged fine and left unchanged.

## 1. KB topic: `knowledge-base/build-tools.json` intro section

### `sections[0].blocks[1].text`

**en**

```text
This doc is senior frontend build tools: why the Vite **dev server** is a different product from the **production bundle**, when you still pick Webpack / Rspack / Turbopack, and how you debug a fat `main` chunk. Interviewers already know Vite is “fast.” They hire you if you can name ESM plus pre-bundling, HMR cost, source maps, and Module Federation as a Webpack/Rspack conversation.
```

**vi before**

```text
Tài liệu này là công cụ build frontend mức senior: vì sao **dev server** Vite là sản phẩm khác **bundle production**, khi nào vẫn chọn Webpack / Rspack / Turbopack, và cách debug `main` chunk béo. Người phỏng vấn đã biết Vite “nhanh.” Họ thuê nếu bạn gọi được ESM cộng pre-bundle, phí HMR, source map, và Module Federation như cuộc nói chuyện Webpack/Rspack.
```

**vi after**

```text
Bài này nói về build tool ở góc nhìn senior frontend: vì sao **dev server** của Vite và **production bundle** là hai thứ khác hẳn nhau, khi nào vẫn nên chọn Webpack / Rspack / Turbopack, và cách debug một chunk `main` quá nặng. Người phỏng vấn biết thừa Vite “nhanh”. Bạn ghi điểm khi nói rõ được ESM và pre-bundling, cái giá của HMR, source map, và hiểu Module Federation là chuyện của Webpack/Rspack.
```

### `sections[0].blocks[2].text`

**en**

```text
Study 12.1 first (the comparison and the Vite version line). Vite 8 (March 2026) uses Rolldown as the default bundler; Vite 5–7 still mean esbuild `optimizeDeps` in dev and Rollup in prod. Then 12.2 for CI minutes. 12.3 is the 3 MB walk-through. Vue 3 / Nuxt default to Vite; Webpack is still the Federation and legacy-loader conversation.
```

**vi before**

```text
Hãy học 12.1 trước (bảng so sánh và dòng version Vite). Vite 8 (tháng 3/2026) dùng Rolldown làm bundler mặc định; Vite 5–7 vẫn nghĩa esbuild `optimizeDeps` lúc dev và Rollup lúc prod. Rồi 12.2 cho phút CI. 12.3 là walk-through 3 MB. Vue 3 / Nuxt mặc định Vite; Webpack vẫn là chuyện Federation và loader legacy.
```

**vi after**

```text
Đọc 12.1 trước (bảng so sánh và các mốc version của Vite). Vite 8 (tháng 3/2026) dùng Rolldown làm bundler mặc định; với Vite 5–7 thì dev vẫn chạy esbuild `optimizeDeps`, còn prod là Rollup. Sau đó đọc 12.2 để bớt phút CI. 12.3 phân tích từng bước một bundle 3 MB. Vue 3 / Nuxt mặc định dùng Vite; Webpack giờ chủ yếu còn được nhắc khi nói về Federation và loader legacy.
```

## 2. Q&A technical: `css-layout-specificity`

### `questions[id=css-layout-specificity].question`

**en**

```text
What CSS topics still matter for a senior frontend engineer?
```

**vi before**

```text
Những chủ đề CSS nào vẫn rất quan trọng với senior frontend engineer?
```

**vi after**

```text
Với senior frontend engineer, những phần nào của CSS vẫn quan trọng?
```

### `questions[id=css-layout-specificity].answer`

**en**

```text
**Short answer:** This answer is **cascade and specificity** — how a rule wins, then `@layer` — not Flex versus Grid and not the box model. Specificity is a four-tuple `(inline, ids, classes, elements)`. The higher tuple wins; equal tuples fall through to source order.

**Explanation:**
Count left to right: inline style is `(1,0,0,0)`; an ID is `(0,1,0,0)`; a class, attribute, or pseudo-class is `(0,0,1,0)`; an element or pseudo-element is `(0,0,0,1)`. Type selectors do not beat classes. `:where()` is always zero. `:is()` / `:not()` take the most specific argument. `!important` is a separate hammer — it does not change the tuple, it jumps the origin.

`@layer` is how seniors **plan** the cascade instead of escalating IDs. Unlayered CSS wins over layered CSS. Later layers win over earlier ones. `!important` **reverses** layer order, which is why a utility `!important` in an early layer still loses to a later layer's `!important`. Tokens in `theme`, resets in `base`, components in `components`, utilities last.

**Senior perspective:**
- A design system that needs `#app .btn` to beat a utility is already a specificity bug. Reset the layers, do not add an ID.
- Vue scoped CSS adds an attribute selector — one class of specificity — not a force field. A global ID still wins.
- Shadow DOM has a separate cascade. Do not mix it with `@layer` as if they were the same knob.
- Verify in DevTools: the struck-through rule plus the layer name. A visual screenshot does not show why.

**Common pitfalls:**
- Symptom: a utility never applies. Cause: an unlayered component file loaded later. Fix: put components in a named layer, utilities last.
- Symptom: `!important` wars. Cause: fighting origin instead of layering. Fix: `@layer`, then delete the importants.
- Symptom: Vue scoped “lost.” Cause: a global ID or inline style. Fix: lower the winner, not `!important` in the SFC.

**How to say it (about 45 s):**
> Specificity is a four-tuple: inline, then IDs, then classes, then elements. Equal tuples fall through to source order. I do not escalate IDs to win a button. I put CSS in layers — theme, base, components, utilities last — so a utility can beat a component without !important. Unlayered CSS still beats every layer, which is the usual “why won’t my utility apply” bug. Vue scoped adds an attribute, not a force field; a global ID still wins. :where is zero, :is takes the most specific argument. I debug in DevTools with the layer name on the struck-through rule. Flex versus Grid is a different question.
```

**vi before**

```text
**Trả lời ngắn:** Câu này là **cascade và specificity** — rule nào thắng, rồi `@layer` — không phải Flex khác Grid và không phải box model. Specificity là bộ bốn `(inline, id, class, element)`. Bộ cao hơn thắng; bằng nhau thì theo thứ tự nguồn.

**Giải thích:**
Đếm trái sang phải: style inline là `(1,0,0,0)`; một ID là `(0,1,0,0)`; class, attribute hoặc pseudo-class là `(0,0,1,0)`; element hoặc pseudo-element là `(0,0,0,1)`. Type selector không thắng class. `:where()` luôn zero. `:is()` / `:not()` lấy argument specificity cao nhất. `!important` là búa riêng — không đổi bộ bốn, nó nhảy origin.

`@layer` là cách senior **lập kế hoạch** cascade thay vì leo ID. CSS không layer thắng CSS có layer. Layer sau thắng layer trước. `!important` **đảo** thứ tự layer, nên utility `!important` ở layer sớm vẫn thua `!important` ở layer sau. Token trong `theme`, reset trong `base`, component trong `components`, utility cuối.

**Góc nhìn senior:**
- Design system cần `#app .btn` để thắng utility thì đã là bug specificity. Hãy xếp lại layer, đừng thêm ID.
- Scoped CSS của Vue thêm attribute selector — một bậc class — không phải lực trường. ID global vẫn thắng.
- Shadow DOM có cascade riêng. Đừng trộn với `@layer` như cùng một nút vặn.
- Kiểm chứng trong DevTools: rule bị gạch kèm tên layer. Screenshot không nói vì sao.

**Lỗi hay gặp:**
- Triệu chứng: utility không bao giờ apply. Nguyên nhân: file component không layer load sau. Cách xử lý: nhét component vào layer có tên, utility cuối.
- Triệu chứng: đánh nhau `!important`. Nguyên nhân: đánh origin thay vì xếp layer. Cách xử lý: `@layer`, rồi xóa important.
- Triệu chứng: scoped Vue “mất.” Nguyên nhân: ID global hoặc style inline. Cách xử lý: hạ bên thắng, không phải `!important` trong SFC.

**Nói khi phỏng vấn (~45 giây):**
> Specificity là bộ bốn: inline, rồi ID, rồi class, rồi element. Bộ bằng nhau thì theo thứ tự nguồn. Tôi không leo ID để thắng một button. Tôi để CSS trong layer — theme, base, components, utility cuối — để utility thắng component mà không cần !important. CSS không layer vẫn thắng mọi layer, đó là bug “sao utility không apply” thường gặp. Scoped Vue thêm attribute, không phải lực trường; ID global vẫn thắng. :where là zero, :is lấy argument cao nhất. Tôi debug trong DevTools với tên layer trên rule bị gạch. Flex khác Grid là câu khác.
```

**vi after**

```text
**Trả lời ngắn:** Câu này hỏi về **cascade và specificity**: rule nào thắng, sau đó là `@layer`. Không phải Flex hay Grid, cũng không phải box model. Specificity là một bộ bốn số `(inline, ids, classes, elements)`. Bộ nào lớn hơn thì thắng; bằng nhau thì rule viết sau thắng.

**Giải thích:**
Đếm từ trái sang phải: style inline là `(1,0,0,0)`; một ID là `(0,1,0,0)`; class, attribute hay pseudo-class là `(0,0,1,0)`; element hay pseudo-element là `(0,0,0,1)`. Type selector không thắng được class. `:where()` luôn bằng 0. `:is()` / `:not()` lấy specificity của argument cao nhất. `!important` là chuyện khác hẳn: nó không đổi bộ bốn số mà nhảy sang tầng origin.

`@layer` là cách senior **lên kế hoạch** cho cascade, thay vì cứ thêm ID cho thắng. CSS không nằm trong layer nào sẽ thắng CSS có layer. Layer khai báo sau thắng layer trước. `!important` thì **đảo ngược** thứ tự layer, nên `!important` của utility ở layer đầu vẫn thua `!important` ở layer sau. Token để trong `theme`, reset trong `base`, component trong `components`, utility để cuối.

**Góc nhìn senior:**
- Design system mà phải dùng `#app .btn` để thắng utility thì đã là bug specificity rồi. Sắp xếp lại layer, đừng thêm ID.
- Scoped CSS của Vue chỉ thêm một attribute selector (tương đương một class), chứ không phải lá chắn gì cả. ID global vẫn thắng.
- Shadow DOM có cascade riêng. Đừng coi nó và `@layer` là cùng một cơ chế.
- Kiểm tra trong DevTools: xem rule bị gạch ngang và tên layer của nó. Nhìn screenshot thì không biết được vì sao.

**Lỗi hay gặp:**
- Triệu chứng: utility không bao giờ ăn. Nguyên nhân: một file component không có layer được load sau. Cách xử lý: cho component vào một layer có tên, utility để cuối.
- Triệu chứng: `!important` đè nhau liên tục. Nguyên nhân: đi đấu với origin thay vì chia layer. Cách xử lý: dùng `@layer`, rồi xóa hết important.
- Triệu chứng: scoped của Vue “mất tác dụng”. Nguyên nhân: có ID global hoặc style inline. Cách xử lý: hạ rule đang thắng xuống, đừng thêm `!important` vào SFC.

**Nói khi phỏng vấn (~45 giây):**
> Specificity là bộ bốn số: inline, rồi ID, rồi class, rồi element. Bằng nhau thì rule viết sau thắng. Mình không thêm ID chỉ để button thắng. Mình chia CSS vào layer (theme, base, components, utilities để cuối) để utility thắng component mà không cần !important. CSS không có layer vẫn thắng mọi layer, đó chính là bug “sao utility không ăn” hay gặp. Scoped của Vue chỉ thêm một attribute, không phải lá chắn; ID global vẫn thắng. :where bằng 0, :is lấy argument cao nhất. Mình debug trong DevTools, nhìn tên layer trên rule bị gạch. Còn Flex hay Grid là câu hỏi khác.
```

### `questions[id=css-layout-specificity].example`

**en**

~~~~text
```css
@layer theme, base, components, utilities;
@layer components {
  .btn { background: var(--accent); padding: 0.5rem 1rem; }
}
@layer utilities {
  .bg-transparent { background: transparent; } /* wins: later layer, same tuple */
}
/* unlayered — beats every layer, the usual leak */
.btn { background: red; }
#hero .btn { background: navy; } /* (0,1,1,1) beats .bg-transparent (0,0,1,0) */
:where(.btn) { color: inherit; } /* (0,0,0,0) — never a specificity hammer */
```

Layers order the cascade without escalating IDs. An unlayered `.btn` still beats `.bg-transparent`. `#hero .btn` is the ID hammer seniors refuse. `:where()` stays at zero.
~~~~

**vi before**

~~~~text
```css
@layer theme, base, components, utilities;
@layer components {
  .btn { background: var(--accent); padding: 0.5rem 1rem; }
}
@layer utilities {
  .bg-transparent { background: transparent; } /* thắng: layer sau, cùng bộ bốn */
}
/* không layer — thắng mọi layer, chỗ rò thường gặp */
.btn { background: red; }
#hero .btn { background: navy; } /* (0,1,1,1) thắng .bg-transparent (0,0,1,0) */
:where(.btn) { color: inherit; } /* (0,0,0,0) — không bao giờ là búa specificity */
```

Layer xếp cascade mà không leo ID. `.btn` không layer vẫn thắng `.bg-transparent`. `#hero .btn` là búa ID senior từ chối. `:where()` ở lại zero.
~~~~

**vi after**

~~~~text
```css
@layer theme, base, components, utilities;
@layer components {
  .btn { background: var(--accent); padding: 0.5rem 1rem; }
}
@layer utilities {
  .bg-transparent { background: transparent; } /* thắng: layer sau, cùng bộ bốn số */
}
/* không có layer nên thắng mọi layer, lỗi rò hay gặp */
.btn { background: red; }
#hero .btn { background: navy; } /* (0,1,1,1) thắng .bg-transparent (0,0,1,0) */
:where(.btn) { color: inherit; } /* (0,0,0,0), không bao giờ dùng để ép specificity */
```

Layer sắp thứ tự cascade mà không cần thêm ID. `.btn` không có layer vẫn thắng `.bg-transparent`. `#hero .btn` là kiểu dùng ID để ép mà senior tránh. `:where()` vẫn bằng 0.
~~~~

### `questions[id=css-layout-specificity].followUps[0]`

**en**

```text
How does unlayered CSS interact with named layers?
```

**vi before**

```text
CSS không layer tương tác với layer có tên thế nào?
```

**vi after**

```text
CSS không có layer và layer có tên tác động lên nhau thế nào?
```

### `questions[id=css-layout-specificity].followUps[1]`

**en**

```text
What specificity does Vue scoped CSS actually add?
```

**vi before**

```text
Scoped CSS của Vue thực sự thêm bao nhiêu specificity?
```

**vi after**

```text
Scoped CSS của Vue thật ra thêm bao nhiêu specificity?
```

### `questions[id=css-layout-specificity].followUps[2]`

**en**

```text
When is important still justified after you have layers?
```

**vi before**

```text
Khi nào important vẫn đáng sau khi đã có layer?
```

**vi after**

```text
Đã có layer rồi thì khi nào vẫn nên dùng important?
```

## 3. Q&A STAR: `monorepo-strategy`

### `questions[id=monorepo-strategy].question`

**en**

```text
When does a monorepo help frontend teams?
```

**vi before**

```text
Khi nào monorepo giúp ích cho frontend team?
```

**vi after**

```text
Khi nào monorepo có ích cho team frontend?
```

### `questions[id=monorepo-strategy].answer`

**en**

```text
**What they are checking:** Whether a monorepo is a **coordination tool** for types, UI kit, and CI — not “Google does it.” Distinct from micro-frontends-when (that is independent deploys). Here the question is **when one repo helps frontend teams**.

**How to structure it:**
1. Name the pain: a design-system change must land in three apps this week; types drift; CI duplication.
2. Choose a monorepo when you coordinate those, and the apps share a release train or can tolerate a shared pipeline.
3. Name the shape: apps/* plus packages/ui, packages/domain-*, one lockfile, affected-only CI.
4. Name the costs: slow CI if you do not use affected graphs; version coupling; noisy diffs.
5. Say when you would refuse: truly separate products, separate security boundaries, or two org clocks that already hate sharing a pipeline.

**Senior signals to include:**
- The win is atomic DS + type changes across apps, not a folder aesthetic.
- Affected CI (Nx, Turborepo, pnpm filters) is part of the decision, not a later patch.
- Publish the DS only when an outside consumer exists. Inside the repo, workspace packages are enough.
- Distinct from 15.4: a monorepo is the default *instead of* Federation.

**Avoid:**
- “Monorepo because it is modern.”
- One giant package with no boundaries (that is a junk drawer).
- Ignoring CI time — that is how the bet dies.

Different from scale-codebase-100-features: that one is in-app feature folders; this is cross-app coordination.
```

**vi before**

```text
**Nhà tuyển dụng muốn thấy:** Monorepo là **công cụ phối hợp** cho type, UI kit, và CI — không phải “Google làm vậy.” Khác micro-frontends-when (câu đó là deploy độc lập). Ở đây câu hỏi là **khi nào một repo giúp team frontend**.

**Cách trình bày:**
1. Gọi đau: một thay đổi design system phải vào ba app tuần này; type lệch; CI trùng.
2. Chọn monorepo khi bạn phối hợp những thứ đó, và các app chung một tàu release hoặc chịu được pipeline chung.
3. Gọi shape: apps/* kèm packages/ui, packages/domain-*, một lockfile, CI chỉ affected.
4. Gọi chi phí: CI chậm nếu không dùng affected graph; coupling version; diff ồn.
5. Nói khi từ chối: product thật sự tách, ranh giới bảo mật tách, hoặc hai đồng hồ org đã ghét chia pipeline.

**Tín hiệu senior nên có:**
- Thắng là thay đổi DS + type atomic xuyên app, không phải thẩm mỹ thư mục.
- CI affected (Nx, Turborepo, pnpm filter) là một phần quyết định, không phải vá sau.
- Publish DS chỉ khi có consumer ngoài. Trong repo, package workspace là đủ.
- Khác 15.4: monorepo là mặc định *thay cho* Federation.

**Nên tránh:**
- “Monorepo vì nó hiện đại.”
- Một package khổng lồ không ranh giới (đó là ngăn đồ).
- Bỏ qua thời gian CI — đó là cách cú hích chết.

Khác scale-codebase-100-features: câu đó là thư mục feature trong app; đây là phối hợp xuyên app.
```

**vi after**

```text
**Nhà tuyển dụng muốn thấy:** Bạn có hiểu monorepo là **công cụ để phối hợp** type, UI kit và CI hay không, chứ không phải “vì Google cũng làm vậy”. Câu này khác micro-frontends-when (câu đó nói về deploy độc lập). Ở đây câu hỏi là **khi nào gom về một repo thì có lợi cho team frontend**.

**Cách trình bày:**
1. Nêu rõ vấn đề: một thay đổi design system phải lên ba app ngay trong tuần; type mỗi nơi một kiểu; CI bị lặp lại.
2. Chọn monorepo khi bạn cần phối hợp những thứ đó, và các app release cùng nhịp hoặc chấp nhận được pipeline chung.
3. Nêu rõ cấu trúc: apps/* và packages/ui, packages/domain-*, một lockfile, CI chỉ chạy phần affected.
4. Nêu rõ cái giá: CI chậm nếu không dùng affected graph; version bị dính vào nhau; diff nhiều nhiễu.
5. Nói luôn khi nào bạn sẽ từ chối: các product hoàn toàn tách biệt, ranh giới bảo mật riêng, hoặc hai team có lịch release riêng và vốn đã không muốn dùng chung pipeline.

**Tín hiệu senior nên có:**
- Cái lợi là đổi DS và type cho mọi app trong cùng một lần, chứ không phải để thư mục trông gọn.
- CI affected (Nx, Turborepo, pnpm filter) là một phần của quyết định, không phải thứ vá sau.
- Chỉ publish DS khi có consumer bên ngoài. Trong repo thì workspace package là đủ.
- Khác 15.4: ở đây monorepo là lựa chọn mặc định *thay cho* Federation.

**Nên tránh:**
- “Dùng monorepo vì nó hiện đại”.
- Một package khổng lồ không có ranh giới gì (thành chỗ chứa đủ thứ lộn xộn).
- Bỏ qua thời gian CI. Monorepo thường thất bại đúng ở chỗ này.

Khác scale-codebase-100-features: câu đó nói về thư mục feature trong một app; câu này nói về phối hợp giữa nhiều app.
```

### `questions[id=monorepo-strategy].example`

**en**

```text
Situation: a Button padding fix on the internal admin product took three PRs in three repos, and one app stayed on the old token for a month. Task: I had to choose monorepo versus keep publishing the DS. Action: I counted the coordination cost — types, UI kit, shared ESLint — against CI risk, then proposed apps/admin plus packages/ui in one repo with affected CI so a DS change is one PR. We did not publish to npm because there was no outside consumer. Result: the next token change landed in admin the same day; CI stayed green because we ran affected tests only. I would still refuse a monorepo if a second org clock needed its own pipeline. Distinct from micro-frontends: we wanted one deploy, not remotes.
```

**vi before**

```text
Situation: một lần sửa padding Button trên sản phẩm admin nội bộ mất ba PR trong ba repo, và một app ở token cũ một tháng. Task: tôi phải chọn monorepo hay tiếp tục publish DS. Action: tôi đếm chi phí phối hợp — type, UI kit, ESLint chung — với rủi ro CI, rồi đề apps/admin kèm packages/ui trong một repo với CI affected để đổi DS là một PR. Chúng tôi không publish npm vì không có consumer ngoài. Result: lần đổi token sau vào admin cùng ngày; CI còn xanh vì chúng tôi chỉ chạy test affected. Tôi vẫn từ chối monorepo nếu đồng hồ org thứ hai cần pipeline riêng. Khác micro-frontend: chúng tôi muốn một deploy, không phải remote.
```

**vi after**

```text
Situation: Chỉ sửa padding của Button trong admin nội bộ thôi mà mất 3 PR ở 3 repo, có app còn dùng token cũ suốt một tháng. Task: mình phải chọn giữa monorepo và tiếp tục publish DS. Action: mình tính chi phí phối hợp (type, UI kit, ESLint dùng chung) so với rủi ro CI, rồi đề xuất gom apps/admin và packages/ui vào một repo, có CI affected để mỗi thay đổi DS chỉ cần một PR. Bọn mình không publish lên npm vì không có consumer bên ngoài. Result: lần đổi token tiếp theo lên admin ngay trong ngày; CI vẫn xanh vì chỉ chạy test affected. Nếu có một team khác cần pipeline riêng theo lịch của họ thì mình vẫn sẽ không chọn monorepo. Khác micro-frontend ở chỗ: bọn mình muốn một lần deploy, không cần remote.
```

### `questions[id=monorepo-strategy].followUps[0]`

**en**

```text
What CI graph do you require before you call a monorepo a win?
```

**vi before**

```text
Bạn đòi graph CI nào trước khi gọi monorepo là thắng?
```

**vi after**

```text
Cần CI graph như thế nào thì bạn mới coi monorepo là thành công?
```

### `questions[id=monorepo-strategy].followUps[2]`

**en**

```text
How is this different from choosing micro-frontends?
```

**vi before**

```text
Câu này khác việc chọn micro-frontend thế nào?
```

**vi after**

```text
Câu này khác việc chọn micro-frontend ở chỗ nào?
```

## 4. Plan day: `plan/days/day-01.json`

### `goal`

**en**

```text
Break one real admin screen into tokens, primitives and states, and name the first 3 primitives to extract.
```

**vi before**

```text
Tách một màn admin thật thành token, primitive và state, rồi chọn 3 primitive tách trước.
```

**vi after**

```text
Tách một màn admin thật thành token, primitive và state, rồi chọn ra 3 primitive cần tách trước.
```

### `handsOn[0]`

**en**

```text
Audit one admin screen into a token table (color, spacing, type, radius).
```

**vi before**

```text
Kiểm kê một màn admin thành bảng token (màu, spacing, chữ, radius).
```

**vi after**

```text
Gom token của một màn admin vào một bảng (màu, spacing, typography, radius).
```

### `handsOn[1]`

**en**

```text
List its repeated states: loading, empty, error, success.
```

**vi before**

```text
Liệt kê state lặp: loading, empty, error, success.
```

**vi after**

```text
Liệt kê các state lặp lại: loading, empty, error, success.
```

### `algorithm.label`

**en**

```text
Two Sum · Hash map
```

**vi before**

```text
Two Sum · Bảng băm
```

**vi after**

```text
Two Sum · Hash map
```

### `checklist[0]`

**en**

```text
Token table covers color, spacing, type, and radius.
```

**vi before**

```text
Bảng token có màu, spacing, chữ và radius.
```

**vi after**

```text
Bảng token có đủ màu, spacing, typography và radius.
```

### `checklist[1]`

**en**

```text
Three primitives listed, each with one reason.
```

**vi before**

```text
Đủ 3 primitive, mỗi cái một lý do.
```

**vi after**

```text
Đã có 3 primitive, mỗi cái kèm một lý do.
```

### `checklist[2]`

**en**

```text
“Design system growth strategy” answered aloud in 60 s, no notes.
```

**vi before**

```text
Đã trả lời “Chiến lược phát triển design system” thành lời trong 60 giây, không nhìn ghi chú.
```

**vi after**

```text
Trả lời thành lời câu “Chiến lược phát triển design system” trong 60 giây, không nhìn ghi chú.
```

## 5. Practice step: `practice/steps/p01.json`

### `concepts[0].explain`

**en**

```text
One git repo that holds several apps and packages. Here: apps/web, apps/api, and packages/shared.
```

**vi before**

```text
Một git repo chứa nhiều app và package. Ở đây: apps/web, apps/api, và packages/shared.
```

**vi after**

```text
Một git repo chứa nhiều app và package. Ở đây là apps/web, apps/api và packages/shared.
```

### `concepts[2].explain`

**en**

```text
Node's built-in tool that pins pnpm to the version in package.json. Avoid a global npm i -g pnpm that drifts.
```

**vi before**

```text
Tool có sẵn trong Node, ghim pnpm đúng version trong package.json. Tránh npm i -g pnpm global làm lệch version.
```

**vi after**

```text
Tool có sẵn trong Node, ghim pnpm đúng version khai báo trong package.json. Đừng cài global bằng npm i -g pnpm, version sẽ bị lệch.
```

### `questionLinks[0].label`

**en**

```text
When does a monorepo help frontend teams?
```

**vi before**

```text
Khi nào monorepo giúp ích cho frontend team?
```

**vi after**

```text
Khi nào monorepo có ích cho team frontend?
```

### `tasks[0].detail`

**en**

```text
Use an official Node 22 installer or nvm. Then enable pnpm through corepack so it matches the repo. Confirm Docker Desktop starts, and git is on your PATH.
```

**vi before**

```text
Dùng installer Node 22 chính thức hoặc nvm. Bật pnpm bằng corepack để khớp repo. Kiểm tra Docker Desktop chạy được, và git có trên PATH.
```

**vi after**

```text
Cài Node 22 bằng installer chính thức hoặc nvm. Sau đó bật pnpm qua corepack để đúng version của repo. Kiểm tra Docker Desktop khởi động được và git đã có trong PATH.
```

### `tasks[1].detail`

**en**

```text
Make a new folder portfolio/ with pnpm-workspace.yaml listing apps/* and packages/*, plus empty apps/ and packages/ directories. Add .nvmrc with 22 and an .editorconfig (utf-8, lf, 2-space indent).
```

**vi before**

```text
Tạo thư mục mới portfolio/ với pnpm-workspace.yaml liệt kê apps/* và packages/*, cộng thư mục trống apps/ và packages/. Thêm .nvmrc ghi 22 và .editorconfig (utf-8, lf, indent 2 space).
```

**vi after**

```text
Tạo thư mục mới portfolio/ có pnpm-workspace.yaml khai báo apps/* và packages/*, kèm hai thư mục trống apps/ và packages/. Thêm .nvmrc ghi 22 và một file .editorconfig (utf-8, lf, indent 2 space).
```

### `tasks[2].detail`

**en**

```text
Write a short README that lists the commands you will grow later: pnpm install, pnpm dev, docker compose up. Keep it as a cheat sheet, not a novel.
```

**vi before**

```text
Viết README ngắn liệt kê lệnh sẽ dùng sau: pnpm install, pnpm dev, docker compose up. Đây là cheat sheet, không phải bài viết dài.
```

**vi after**

```text
Viết một README ngắn liệt kê các lệnh sẽ dùng dần về sau: pnpm install, pnpm dev, docker compose up. Coi nó là cheat sheet, đừng viết thành tiểu thuyết.
```

### `tasks[3].detail`

**en**

```text
git init, add the skeleton files, and commit. Later steps each add one more commit on this history.
```

**vi before**

```text
git init, add các file khung, rồi commit. Mỗi bước sau thêm đúng một commit trên history này.
```

**vi after**

```text
git init, add các file khung rồi commit. Mỗi bước sau sẽ thêm đúng một commit nối tiếp history này.
```

### `doneWhen[1]`

**en**

```text
`git log` shows the first commit `chore: init portfolio monorepo`.
```

**vi before**

```text
`git log` hiện commit đầu `chore: init portfolio monorepo`.
```

**vi after**

```text
`git log` hiện commit đầu tiên `chore: init portfolio monorepo`.
```

### `pitfalls[0]`

**en**

```text
A global `npm i -g pnpm` that then fights corepack. Use `corepack enable` and the version pinned in package.json.
```

**vi before**

```text
`npm i -g pnpm` global rồi xung đột với corepack. Dùng `corepack enable` và version ghim trong package.json.
```

**vi after**

```text
Cài pnpm global bằng `npm i -g pnpm` rồi bị xung đột với corepack. Hãy dùng `corepack enable` và version đã ghim trong package.json.
```
