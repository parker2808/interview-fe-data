# Practice module — build the real portfolio, step by step

Status: plan (execution by grok-4.6 in batches, §4). Source of truth for *what* to build: `plans/portfolio-design-system.md` (cited as "spec §x"). This doc defines *how Parker learns and builds it*, the data shape, and the app changes.

**Practice** is a standalone module on interview-senior-fe, next to Docs / Plan / Interview. It is not tied to the 30-day plan, which no longer has a Lab.

## 0. Decisions (fixed, do not re-litigate)

| Topic | Choice |
|---|---|
| Portfolio repo | One monorepo `portfolio/` using pnpm workspaces: `apps/web` (Next.js App Router + TS), `apps/api` (NestJS), `packages/shared` (zod schemas + types) |
| UI | shadcn/ui with tokens from spec §3, light and dark via `class` strategy, fonts from spec §3 |
| Data fetching | TanStack Query on the client. RSC `fetch` with `next.tags` for public pages. TanStack Table for admin lists, TanStack Form + zod for admin forms |
| DB | MySQL 8 in Docker Compose, Prisma ORM, `prisma migrate` only (never `db push` after p06) |
| Auth | Email + password (argon2id). Sessions are stored in a MySQL `Session` table behind an httpOnly cookie. No JWT |
| Realtime | SSE (`GET /events`) for the admin inbox and publish status |
| Content rule | Nothing is hard-coded. Every visible string or image comes from the API. Only tokens and UI chrome live in code (spec §1.5) |
| Step format | Same budget as a new study-plan day: about 1–3 h, 3–6 tasks, 1–4 done-when checks, 1–3 pitfalls, 1 commit |

## 1. Learning roadmap

Each step has a **why** line, which is the beginner explanation (one sentence). The data files hold the full bilingual text, and the fields map 1:1 (see §2).

The legend below is for the step lines that follow:
- `⏱` is the time estimate, `⇠` lists prerequisites, and `KB` lists knowledge-base slugs (links go to `/docs/<lang>/<slug>`).
- `Do` lists the tasks, `✓` is the done-when check, `⚠` is a pitfall, and `⎇` is the commit message.

### M0 — Groundwork (tools, Docker, SQL, web shell)

**p01 · Toolchain + monorepo skeleton**: ⏱ 90m · ⇠ — · KB `devops`, `build-tools`
- Why: a single repo with a fixed layout means every later step has a known place to go.
- Do: install Node 22 + pnpm + Docker Desktop + git. Create `portfolio/` with `pnpm-workspace.yaml`, `apps/`, `packages/`, `.editorconfig`, `.nvmrc`, and a root `README` listing the commands.
- ✓ `pnpm -v`, `docker compose version` and `node -v` (prints 22.x) all work, and `git log` shows the first commit.
- ⚠ A global npm install that mixes with pnpm. Use `corepack enable`.
- ⎇ `chore: init portfolio monorepo`

**p02 · Docker basics + MySQL in Compose**: ⏱ 2h · ⇠ p01 · KB `devops`
- Why: the database runs in a container so it behaves the same on every machine and can be thrown away safely.
- Do: learn image vs container vs volume. Write `docker-compose.yml` with a `db` service (mysql:8, named volume, healthcheck, port 3306) and `.env.example` with `DATABASE_URL`. Add a `.gitignore` entry for `.env`.
- ✓ `docker compose up -d db` reaches `healthy`, and `docker compose down` then `up` keeps the data because of the volume.
- ⚠ Committing `.env`. Port 3306 already taken by a local MySQL.
- ⎇ `chore(infra): mysql via docker compose`

**p03 · SQL by hand**: ⏱ 2h · ⇠ p02 · KB `system-design`
- Why: Prisma writes SQL for you later, so you need to recognise what it generates.
- Do: in `docker compose exec db mysql`, run `CREATE TABLE profile/experience`, `INSERT`, `SELECT … JOIN`, `UPDATE`, `DELETE`, and a primary key vs a foreign key. Save the queries to `docs/sql-notes.sql`.
- ✓ A join query returns the experiences for one profile, and deleting the profile is blocked by the FK (or cascades, which you explain).
- ⚠ Forgetting `utf8mb4`, which breaks Vietnamese text. Set it at table creation.
- ⎇ `docs: sql fundamentals notes`

**p04 · Next.js shell + tokens + theme**: ⏱ 3h · ⇠ p01 · KB `nextjs`, `css-layout`, `accessibility`
- Why: tokens first means every later screen inherits clear typography and light/dark for free.
- Do: `create-next-app` into `apps/web` (TS, App Router, Tailwind). `shadcn init`, then map spec §3 tokens to shadcn CSS vars. Load the fonts with `next/font`. Add a theme toggle (`next-themes`) and a `prefers-reduced-motion` guard (spec §3 motion).
- ✓ The `/` placeholder renders in both themes with AA contrast (checked in DevTools), and the font sizes match the spec type scale.
- ⚠ A flash of the wrong theme. Use `suppressHydrationWarning` on `<html>`.
- ⎇ `feat(web): next shell, tokens, theme`

### M1 — First API (Nest → Prisma → read → validate → render)

**p05 · NestJS basics**: ⏱ 2h · ⇠ p01 · KB `architecture`
- Why: Nest gives the backend a fixed structure (module, controller, service), so you don't have to invent one.
- Do: `nest new apps/api`. Add a `HealthModule` that serves `GET /health`. Set up a global prefix `/api`, CORS for the web origin, and `ConfigModule` reading `.env`.
- ✓ `curl localhost:4000/api/health` returns `{status:"ok"}`.
- ⚠ Putting logic in controllers. Controllers only map HTTP to a service call.
- ⎇ `feat(api): nest app + health`

**p06 · Prisma schema, migrate, seed**: ⏱ 3h · ⇠ p03 p05 · KB `system-design`
- Why: the schema file is the single source of truth for tables, and migrations are its history.
- Do: `prisma init` (mysql). Add models `SiteSettings`, `Profile`, `Experience` (spec §1.5). Run `migrate dev --name init`. Add `prisma/seed.ts` with CV placeholder data (no phone or email). Add a `PrismaService`.
- ✓ `pnpm prisma migrate reset` recreates the tables and seeds them, and Prisma Studio shows the rows.
- ⚠ Editing an applied migration. Always create a new one.
- ⎇ `feat(api): prisma schema + seed`

**p07 · Read API**: ⏱ 2h · ⇠ p06 · KB `networking`
- Why: the public site only needs GET endpoints first, which keeps risk low.
- Do: add `GET /settings`, `GET /profile`, `GET /experiences` (ordered). Use response DTOs. Pick the localized fields per `?locale=` or return both (spec §1.5).
- ✓ Each endpoint returns the seeded JSON, and a missing row returns 404 with the shared error shape.
- ⚠ Returning Prisma models directly, which leaks internal fields. Map them to DTOs.
- ⎇ `feat(api): public read endpoints`

**p08 · Validation + error shape**: ⏱ 90m · ⇠ p07 · KB `security`, `typescript`
- Why: never trust input. One error format makes the frontend simple.
- Do: put zod schemas in `packages/shared`. Add a Nest `ZodValidationPipe` and a global exception filter that returns `{error:{code,message,fields?}}`.
- ✓ Bad query params return 400 with field errors, and `packages/shared` types are imported by both apps.
- ⚠ Two schema copies drifting apart. Import from `shared` only.
- ⎇ `feat(shared): zod contracts + error filter`

**p09 · Web reads the API**: ⏱ 3h · ⇠ p04 p07 · KB `react`, `state-management-react`, `performance`
- Why: this is the first end-to-end slice, where the DB row appears on screen.
- Do: add a typed `apiClient` and a `QueryClientProvider`. The home hero and nav are rendered from `/settings` and `/profile`. Build the Skeleton, Empty and Error components (spec §4) and use them.
- ✓ Changing a seed value and re-seeding changes the page, and a stopped API shows the Error state (not a crash).
- ⚠ Fetching in `useEffect`. Use RSC fetch or `useQuery`.
- ⎇ `feat(web): home from api + states`

### M2 — Content graph (relations, tags, posts, query params)

**p10 · One-to-many relations**: ⏱ 2h · ⇠ p06 · KB `system-design`
- Why: real data is connected, for example one experience has many projects.
- Do: add a `Project` model with an FK to `Experience`, with `onDelete` chosen and explained. Add `GET /projects`, plus `GET /projects/:slug` with `include`.
- ✓ The project detail includes its experience, and the migration SQL shows the FK and index.
- ⚠ N+1 queries in loops. Use `include`/`select`.
- ⎇ `feat(api): projects relation`

**p11 · Many-to-many (skills, tags)**: ⏱ 2h · ⇠ p10
- Why: a project uses many skills and a skill appears in many projects, so a join table is needed.
- Do: add `Skill` and `Tag` models with explicit join tables (`ProjectSkill` with an `order` field). Seed them. Filter with `GET /projects?skill=nuxt`.
- ✓ The filter returns only matching projects, and the join rows are visible in Studio.
- ⚠ Implicit m2m when you need extra columns. Use explicit join tables.
- ⎇ `feat(api): skills/tags m2m`

**p12 · Posts + rich content blocks**: ⏱ 3h · ⇠ p11 · KB `security`
- Why: blog and case studies share one block format, so one renderer serves both.
- Do: add a `Post` model with `status`, `publishedAt`, and `blocks Json` (spec §1.5 block types) plus tags. Add `GET /posts` and `GET /posts/:slug` (published only). Validate the blocks with zod.
- ✓ A draft post is invisible publicly, and an invalid block JSON is rejected at seed or write time.
- ⚠ Rendering raw HTML from content. Allow block types only and never `dangerouslySetInnerHTML`.
- ⎇ `feat(api): posts with blocks`

**p13 · Query params: pagination, sort, search**: ⏱ 2h · ⇠ p12 · KB `networking`
- Why: lists grow, and cursor pagination keeps them fast and stable.
- Do: add a shared `ListQuery` zod (`cursor`, `limit≤50`, `sort`, `q`, `tag`) and a response `{items,nextCursor}`, applied to posts and projects.
- ✓ Paging through all posts returns no duplicates or gaps, and `limit=500` gives a 400.
- ⚠ Offset pagination on changing data.
- ⎇ `feat(api): list query contract`

**p14 · Public pages**: ⏱ 4h · ⇠ p09 p13 · KB `nextjs`, `accessibility`, `performance`
- Why: the visitor-facing site is now fully driven by data.
- Do: build `/about`, `/projects`, `/projects/[slug]` (case study, spec §5), `/blog`, and `/blog/[slug]` with a `BlockRenderer`. Add `useInfiniteQuery` for lists, the rich-layer motion from spec §6 v2, and a reduced-motion fallback.
- ✓ Every text on these pages traces to an API field (grep the web app for CV strings: 0 hits), and keyboard-only navigation works.
- ⚠ Hard-coding section headings. They also come from `SiteSettings`.
- ⎇ `feat(web): public pages from api`

### M3 — Write side (CRUD, transactions, indexes)

**p15 · Write API**: ⏱ 3h · ⇠ p13 · KB `networking`, `security`
- Why: the admin CMS needs POST, PATCH and DELETE with the same contracts.
- Do: add create, update and delete for projects, posts, skills, tags and experience. Use the shared zod input DTOs, return 201/200/204, and catch `P2002` (duplicate slug) as 409.
- ✓ The REST client file `api.http` exercises every route, and a duplicate slug returns 409 with a field error.
- ⚠ Using PUT semantics for partial updates. Use PATCH with partial schemas.
- ⎇ `feat(api): crud endpoints`

**p16 · Transactions + ordering**: ⏱ 2h · ⇠ p15
- Why: multi-row changes such as reordering or replacing tags must succeed or fail together.
- Do: add `PATCH /projects/order` and tag replacement inside `prisma.$transaction`. Write a test that forces a failure mid-way.
- ✓ The forced failure leaves the DB unchanged.
- ⚠ Running awaits outside the transaction client (`tx`).
- ⎇ `feat(api): transactional reorder`

**p17 · Indexes + EXPLAIN**: ⏱ 90m · ⇠ p16 · KB `performance`
- Why: indexes make the queries you actually run fast, and EXPLAIN proves it.
- Do: run `EXPLAIN` on the post list and tag filter, add `@@index` for `status, publishedAt` and the slug uniques, migrate, then re-run EXPLAIN.
- ✓ EXPLAIN shows index use (no full scan) for the list query, and the notes are saved in `docs/sql-notes.sql`.
- ⚠ Indexing every column, which slows writes.
- ⎇ `perf(db): indexes for list queries`

### M4 — Auth + admin CMS

**p18 · Users, argon2, MySQL sessions**: ⏱ 3h · ⇠ p15 · KB `security`
- Why: server sessions are the simplest safe login, and logout really logs out.
- Do: add `User` and `Session` models (id, userId, expiresAt, ip/ua hash). Add `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`. Use an httpOnly `Secure` `SameSite=Lax` cookie. Hash with argon2id. Add a seed admin script that reads its password from env.
- ✓ Login sets the cookie, `/auth/me` returns the user, logout deletes the session row, and an expired session gives 401.
- ⚠ Logging passwords or tokens. Store only the hash of the session id.
- ⎇ `feat(api): session auth`

**p19 · Guards, roles, CSRF**: ⏱ 2h · ⇠ p18 · KB `security`
- Why: only the admin can write, and cookies need CSRF protection.
- Do: add a `SessionGuard` and `RolesGuard` (`ADMIN`/`EDITOR`) on all write routes. Add a CSRF double-submit token header and rate limiting on login (`@nestjs/throttler`).
- ✓ Writes without a session return 401, writes without CSRF return 403, and the 6th bad login in a minute returns 429.
- ⚠ Guarding the controller but forgetting new routes. Make the guard global and add a `@Public()` opt-out.
- ⎇ `feat(api): guards + csrf + throttle`

**p20 · Admin shell (Linear-style)**: ⏱ 3h · ⇠ p09 p19 · KB `react`, `accessibility`
- Why: one dense, keyboard-first shell is reused by every admin page.
- Do: build `/admin` with a login page, protected layout (server check via `/auth/me`), shadcn sidebar, command palette (`cmdk`), and the dashboard from spec §5.11.
- ✓ Logged out, `/admin` redirects to login. Cmd-K navigates, and the dashboard counts come from the API.
- ⚠ Client-only auth checks. Check on the server in the layout.
- ⎇ `feat(web): admin shell`

**p21 · Admin tables**: ⏱ 3h · ⇠ p20 p13
- Why: TanStack Table plus the list contract gives sorting, filtering and paging in one pattern.
- Do: add a generic `DataTable` (server pagination, sort, `q`, row actions) used for posts, projects and messages. Add optimistic delete with rollback.
- ✓ Sort, search and paging hit the API (visible in the Network tab), and a failed delete restores the row.
- ⚠ Client-side sorting over a single page of data.
- ⎇ `feat(web): admin data table`

**p22 · Admin editor forms**: ⏱ 4h · ⇠ p21 p12
- Why: shared zod schemas plus TanStack Form give the same validation in the browser and on the server.
- Do: build the post and project editors (fields from spec §5.11 v2) with a block editor list (add, reorder, remove), a dirty guard, and save via mutation with invalidation.
- ✓ Server field errors map onto inputs, and edits appear on the public page after save (after p25: on publish).
- ⚠ Duplicating schemas in the web app. Import from `shared`.
- ⎇ `feat(web): admin editors`

### M5 — Realtime, media, publishing

**p23 · Contact form + SSE inbox**: ⏱ 3h · ⇠ p19 p21 · KB `web-apis`, `networking`
- Why: SSE is one-way server push over plain HTTP, so it is simpler than WebSockets for notifications.
- Do: add `POST /contact` (zod, honeypot, throttle), a `Message` model, and `GET /events` (SSE, session-guarded) that emits `message.created`. The admin inbox subscribes and invalidates the query.
- ✓ Submitting the public form makes the inbox update without a reload within 2 s, and reconnecting after an API restart works.
- ⚠ Proxies buffering SSE. Set `Cache-Control: no-cache` and send heartbeat comments.
- ⎇ `feat: contact + sse inbox`

**p24 · Uploads**: ⏱ 3h · ⇠ p19
- Why: images are content too, so they are stored with metadata and alt text.
- Do: add `POST /media` (multer, mime and size limits), `sharp` resize to webp variants, a `Media` model (alt en/vi, w/h), files on a Compose volume served at `/media/*`, and a picker in the editor.
- ✓ Uploading a JPG creates the variants, `<img>` uses `srcset` and alt, and a 20 MB or `.exe` upload is rejected.
- ⚠ Trusting the file extension. Check magic bytes or the sharp metadata.
- ⎇ `feat: media uploads`

**p25 · Drafts, publish, revalidate**: ⏱ 2h · ⇠ p22 p14
- Why: public pages are cached for speed, so publishing must explicitly refresh them.
- Do: add `POST /posts/:id/publish` and `/unpublish`. The API calls the web's `POST /api/revalidate` (secret header), which runs `revalidateTag('post:<slug>')`. Add a preview mode for drafts.
- ✓ Publishing shows the change on the public page in under 5 s without a redeploy, and a draft is visible only in preview.
- ⚠ Revalidating the whole site. Tag per entity.
- ⎇ `feat: publish + on-demand revalidate`

### M6 — Quality (SEO, analytics, audit, tests, a11y)

**p26 · SEO**: ⏱ 2h · ⇠ p14 · KB `nextjs`, `performance`
- Why: metadata also comes from the CMS, so sharing a link looks right.
- Do: add `generateMetadata` per page from API SEO fields, `sitemap.ts` and `robots.ts` from the API, OG images (`opengraph-image.tsx`), and JSON-LD `Person` (no email or phone).
- ✓ A Lighthouse SEO score of 100 on home, a post and a project, and the sitemap lists published slugs only.
- ⚠ The `metadataBase` is missing, which breaks OG URLs.
- ⎇ `feat(web): seo from cms`

**p27 · Analytics + audit log**: ⏱ 3h · ⇠ p19 p23 · KB `monitoring`
- Why: own your numbers (no third-party tracker) and know who changed what.
- Do: add `POST /analytics/view` (path, referrer host, day bucket, no IP stored) and an `AuditLog` (actor, action, entity, diff) written in the same transaction as each admin write. Add dashboard charts and an audit table.
- ✓ Page views increase on visits, and every CRUD action creates one audit row.
- ⚠ Storing personal data in analytics.
- ⎇ `feat: analytics + audit log`

**p28 · Tests**: ⏱ 3h · ⇠ p25 · KB `testing`
- Why: a small safety net lets you change things later without fear.
- Do: API tests with `vitest` + `supertest` against a test DB (Compose profile `test`) covering auth, CRUD and publish. Web tests with Playwright smoke (home, post, admin login), plus a GitHub Actions workflow.
- ✓ `pnpm test` is green locally and in CI.
- ⚠ Tests sharing state. Reset the DB per file.
- ⎇ `test: api + e2e smoke`

**p29 · A11y + performance audit**: ⏱ 2h · ⇠ p26 · KB `accessibility`, `performance`
- Why: typography and clarity are the brand (spec §3), so prove them.
- Do: run axe and Lighthouse on all spec §5 screens in both themes, fix the issues, and check focus rings, skip link, reduced motion, LCP image priority and font `display`.
- ✓ axe reports 0 serious issues, and Lighthouse is at least 95 for a11y and perf on mobile for home.
- ⚠ Low contrast in dark muted text. Re-check the §3 tokens.
- ⎇ `fix: a11y + perf audit`

### M7 — Ship (ops, hardening, content, deploy)

**p30 · Production Compose**: ⏱ 3h · ⇠ p28 · KB `devops`
- Why: the same containers locally and in production means no "works on my machine".
- Do: multi-stage Dockerfiles for web (`output: standalone`) and api. `compose.prod.yml` with db, api, web and caddy, healthchecks, `depends_on: service_healthy`, and `prisma migrate deploy` on api start.
- ✓ `docker compose -f compose.prod.yml up --build` serves the full site on `localhost`, and the images are under 300 MB.
- ⚠ Running `migrate dev` in production.
- ⎇ `chore(infra): production compose`

**p31 · Hardening + backup**: ⏱ 2h · ⇠ p30 · KB `security`
- Why: a public server is attacked from day one, and backups are only real once you have restored one.
- Do: add `helmet` + CSP, strict CORS, cookie `Secure`, and a non-root container user. Add a `backup` service running a daily `mysqldump` into a volume with 7-day rotation, plus `scripts/restore.sh`.
- ✓ Restoring yesterday's dump into a fresh DB brings the site back, and securityheaders.com gives grade A.
- ⚠ A CSP that blocks `next/font` or OG images. Test before deploying.
- ⎇ `chore: hardening + backups`

**p32 · Real content via admin**: ⏱ 3h · ⇠ p22 p24
- Why: this proves the "no hard-coded content" rule, because all content goes in through the CMS.
- Do: enter the real profile, experience, projects (spec §2 CV recommendations), 2 posts and media in en and vi through `/admin` only, then remove placeholder seeds from production.
- ✓ The production DB has 0 placeholder rows, and the web app contains no CV strings (grep).
- ⚠ Adding a personal phone or email to public fields. Use the contact form only.
- ⎇ `chore: production seed cleanup`

**p33 · Deploy + launch checklist**: ⏱ 3h · ⇠ p30 p31 p32 · KB `devops`, `monitoring`
- Why: shipping is the goal, and a checklist prevents launch-day surprises.
- Do: set up a VPS, docker, DNS, Caddy auto-HTTPS, and env secrets on the server. Add a GitHub Actions deploy (build, push to GHCR, ssh pull + up) and uptime monitoring, then run the launch checklist (spec §5 screens, both themes, both locales).
- ✓ The custom domain serves HTTPS, the deploy runs from a push to `main`, and an uptime ping is configured.
- ⚠ Secrets in the repo or image layers.
- ⎇ `chore: deploy pipeline`

## 2. Content data model (this repo)

### 2.1 Layout

```
practice/meta.json            # module intro + milestones (ordered) → step ids
practice/index.json           # GENERATED: meta + step summaries (for list/search)
practice/steps/p01.json … p33.json
scripts/check-practice.mjs    # links, budgets, prereq graph, PII
scripts/sync-practice-index.mjs   # rebuild index; --check for CI
```

### 2.2 Shapes

Here `L` means `{en:string, vi:string}`, and both locales must be non-empty.

```jsonc
// practice/meta.json
{ "version": 1,
  "title": L, "intro": L, "specPath": "plans/portfolio-design-system.md",
  "milestones": [ { "id": "m0", "title": L, "goal": L, "outcome": L, "steps": ["p01","p02","p03","p04"] } ] }

// practice/steps/p06.json
{ "kind": "practice-step", "id": "p06", "milestone": "m1", "order": 6,
  "title": L, "summary": L,                // summary = the "Why" line
  "estimateMin": 180, "prereqs": ["p03","p05"],
  "tags": ["prisma","mysql","migrations"],  // folded into search; lowercase ascii
  "concepts": [ { "term": L, "explain": L } ],          // 2–5
  "kbLinks":  [ { "slug": "system-design", "label": L } ],   // 0–3, slug must exist
  "questionLinks": [ { "id": "q-…", "label": L } ],     // 0–3, id must exist in qna
  "specRefs": ["§1.5", "§1.6"],
  "tasks":    [ { "title": L, "detail": L, "code": { "lang": "bash", "text": "pnpm prisma migrate dev --name init" } } ], // 3–6, code optional, not localized
  "doneWhen": [ L ],      // 1–4, each objectively checkable
  "pitfalls": [ L ],      // 1–3
  "commit": "feat(api): prisma schema + seed" }

// practice/index.json (generated, deterministic — no timestamps)
{ "version": 1, "title": L, "intro": L, "milestones": [ …meta.milestones ],
  "steps": [ { "id","milestone","order","title","summary","estimateMin","tags","prereqs" } ] }
```

### 2.3 Validation + CI

| Change | Rule |
|---|---|
| `schema/content.schema.json` | Add `$defs.practiceMeta`, `practiceStep`, `practiceIndex` (reuse `localized`), with `additionalProperties:false` |
| `scripts/validate.mjs` | Already walks all JSON for localized pairs. Add: if `practice/steps` exists, the file count equals the total ids in `meta.milestones[].steps` |
| `scripts/check-practice.mjs` | Ids `p\d{2}` are unique and contiguous, `order` matches the position in meta, and `milestone` matches. Prereqs exist, come earlier, and have no cycles. `kbLinks.slug` is in `knowledge-base/index.json`, and `questionLinks.id` is in `qna/questions.json`. Budgets follow §0 (`--strict` makes them errors). `estimateMin` is 30–300. `commit` matches `^(feat\|fix\|chore\|docs\|test\|perf\|refactor)(\(.+\))?: .+`. PII guard: no email or phone regex hits in any string. `--stats` prints totals per milestone |
| `scripts/sync-practice-index.mjs` | Builds the index from meta + steps. `--check` exits 1 on a diff |
| `.github/workflows/validate.yml` | Add steps `node scripts/check-practice.mjs . --strict` and `node scripts/sync-practice-index.mjs --check` |
| `README.md` | Layout lines + "after editing practice/, run sync-practice-index" |

The `vi` text is natural Vietnamese with diacritics. Technical terms (Docker, Prisma, migration, guard) stay in English.

## 3. App changes (interview-senior-fe)

These mirror the `study-plan` module. Reuse before building anything new.

| Area | Change |
|---|---|
| Content pull | `scripts/pull-data.mjs`: `looksLikeContentTree` treats `practice/` as optional (warn if missing), so old data trees still boot |
| Server readers | `server/utils/contentStore.ts`: add `readPracticeIndex()` and `readPracticeStep(id)` (id regex `^p\d{2}$`, otherwise 404) |
| API | `server/api/practice/index.get.ts` (index), `server/api/practice/steps/[id].get.ts`, `server/api/practice/search.get.ts?q=&locale=` |
| Search | `server/utils/practiceSearch.ts` builds per locale a cached record per step: `title`, `tags + concepts.term`, and `body` (summary, tasks, doneWhen, pitfalls), each via `foldSearchText`. Use `splitSearchKeywords` and keep a record only if `matchesAllKeywords(title+tags+body)` (AND). The score is a tier first (title hit 3, tags/concepts 2, body 1) and then `scoreKeywordHay`, so title matches always rank first. Return `{id,title,milestone,kind,snippet}` (≤20) |
| Types | `src/modules/content/types/practice.type.ts` (`PracticeMeta`, `PracticeStep`, `PracticeIndex`) exported from `index.ts` |
| Module | `src/modules/practice/` with `views/PracticeHome.vue`, `views/PracticeStep.vue`, `components/MilestoneList`, `components/StepCard`, `components/StepDetail`, `composables/use-practice-index.composable.ts`, `use-practice-progress.composable.ts`, `enums/practice-routes.enum.ts` |
| Pages | `pages/practice/index.vue` and `pages/practice/step/[id].vue`, which are thin wrappers like `pages/plan/*` |
| List view | The milestone accordion shows a progress bar per milestone (done/total), plus step cards (id, title, ⏱, tags, done tick, locked hint if prereqs are not done; this is informational only, never blocking). There is a search box at the top (debounced 200 ms, results replace the list, `?q=` kept in the URL), plus "Continue: next undone step" |
| Detail view | Header (milestone, ⏱, prereq chips linking to steps). Sections: Why, Concepts, Tasks (code blocks with copy), Done when (checkboxes are local UI only), Pitfalls, Commit (copy button), KB/Q&A links via `kb-links.util`, prev/next, and "Mark step done" |
| Reuse | `ContentSkeleton` (list + detail loading), `ContentStatus` (empty/error), `ContentList`, `BackLink`, `pick-locale.util`, `inline-md.util`, `kb-links.util`, `search-text.util`, `ProgressTools`/`EditGateModal` (edit gate for writes), `use-edit-mode.composable` |
| Progress | Generalize `progressStore.ts` to `readProgress(key)` / `writeProgress(key, …)`, where the key is `progress.json` (unchanged) or `practice-progress.json` with `{version:1, updatedAt, completed:string[]}`. Add `server/api/practice/progress.ts` (GET public, PUT behind the same auth as `/api/progress`, ids validated against the index). The client falls back to `localStorage` key `sf_practice_done` when the store is unavailable |
| Nav + hub | `AppRoute.Practice`. Add a `HUB_MODULES` card (`/practice`), an `AppTopBar` link, and i18n keys under `practice.*` in `i18n/locales/{vi,en}.json` (title, desc, cta, search placeholder, empty, error, markDone, continue, minutes, prereqs, sections) |
| Tests (vitest) | `tests/practice-search.test.ts` covers AND matching, "hieu nang"→"hiệu năng", case-insensitivity, title-first ordering and the empty query. `tests/practice-content.test.ts` covers readers with a fixture `tests/fixtures/practice-content-tree.mjs` (3 steps, 2 milestones). Add to `real-content.optional` that every index id resolves |

## 4. Execution batches (grok-4.6)

Rules for every batch:
- Branch `cursor/practice-<batch>-<suffix>`, opened as a draft PR to `main`.
- Read only spec §1.5, §1.6, §3, §5 and §6 plus this doc. Do not re-read the whole KB.
- Run `validate`, `check-content`, `check-practice --strict` and `sync-practice-index --check` before pushing.
- No phone numbers or emails.

| Batch | Repo | Scope | Acceptance |
|---|---|---|---|
| **D1 Scaffold + M0** | data | Schema defs, `check-practice.mjs`, `sync-practice-index.mjs`, CI, README, `meta.json` (all 8 milestones with all 33 ids), steps p01–p04 | CI is green, and `check-practice --stats` lists 4 steps. Running with missing steps is allowed via meta `draft:true`. Removing `draft` errors until all 33 exist. A deliberately bad KB slug fails the check |
| **D2 M1–M2** | data | p05–p14 | Strict budgets pass, every step has ≥1 doneWhen that is a command or an observable result, and the vi text is reviewed for diacritics |
| **D3 M3–M4** | data | p15–p22 | Same as D2, and security steps link `security` |
| **D4 M5–M7** | data | p23–p33, then remove `draft` from meta | All 33 steps are present, the index is in sync, and CI is green without `draft` |
| **A1 App** | interview-senior-fe | Everything in §3 | `pnpm test` + typecheck + build pass. `/practice` and `/practice/step/p01` render vi/en, light/dark, with skeletons while loading. Search "PRISMA migrate" finds p06 first, and "hieu nang" style queries work. Mark done persists across reloads (store or localStorage). The hub card and nav link are present. Old data trees without `practice/` still boot |

Order: D1 → (D2 ∥ A1) → D3 → D4. A1 develops against the fixture and the D1 data, and needs no change once D2–D4 land.

Token budget hints:
- Write the bilingual step files directly from §1. Each Do item becomes one or more `tasks`, ✓ becomes `doneWhen`, and ⚠ becomes `pitfalls`.
- Keep `detail` at 1–3 sentences or fewer, and add at most one `code` per task.
