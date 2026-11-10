# Backend operations continuation

## Scope

Revise PR #66 on its existing branch, without changing chapters 1–8, their anchors, topic count or the app contract. Four bilingual chapters 9–12 follow chapter 8. The disposable `docs/examples/backend-next/` must extend chapter 8's Nest TypeScript books API, not substitute an unrelated `node:http` server. The portfolio repository is evidence only. Never connect to a real hosted service or deploy.

## Acceptance criteria

- AC1: Explain Redis/cache-aside, TTL, invalidation and stampede with explicit Next.js tag-cache comparison and source-status boundaries.
- AC2: Explain BullMQ queue/worker, retry/backoff, duplicate execution, idempotency and an application-owned dead-letter policy with email/image examples.
- AC3: Explain structured logging, Pino, request ID, health checks, OTel tracing and Sentry errors without asserting unobserved production wiring.
- AC4: Explain general CI/CD with GitHub Actions, lint, typecheck, Vitest, Docker build, migrate-on-deploy; distinguish configured code from live Render/Vercel/TiDB.
- AC5: Each chapter provides equal-depth EN/VI theory, ASCII diagram, comparison table, exact Nest fixture file delta, troubleshooting (at least four cases), worked Q&A (at least four), exercise with observable acceptance, and official references.
- AC6: Preserve `/api/books` on port 3000 with a Zod pipe, Nest module/service/controller, BullModule/WorkerHost, nestjs-pino and a multi-stage non-root image. CI must run actual ESLint, TypeScript checks, Vitest/Supertest and Docker build; show a review-only workflow with Redis/MySQL services.
- AC7: Run a disposable local Redis lab: cache hit/invalidation, incoming request ID, Redis-down GET/readiness (bounded), two revisions of one book, forced-failure retry/failed state. Capture exact outputs; state unrun telemetry/deploy/migration explicitly. Run data/app gates and privacy scan. Do not merge or deploy.

## Verification

Use Node 22 and a named disposable Docker Redis, a fresh `/tmp` copy and real fixture scripts. Inspect generated `dist/main.js`, actual HTTP responses and queue states; stop only that named container. Run repo scripts and consumer tests/build with `CONTENT_LOCAL_PATH` targeting this branch. Push new commits to existing PR #66, base `content/backend-from-frontend`.

## Revision evidence boundaries

The chapter 8/9–12 connection is the Nest TypeScript `/api/books` memory API and its Zod/guard contract. Chapter 5's Prisma/MySQL lab remains separate; no persistence integration is claimed. The fixture now uses `npm ci`, real ESLint/TypeScript/Vitest/Nest scripts, and a multistage non-root image. The processor runs in the API process for the teaching lab only. The nested workflow is illustrative; MySQL is provisioned there but not queried by these memory-backed tests. Local Redis cache/retry/probe behavior and build output are measurable; OTel, Sentry, outbox, Prisma migrations, hosted database and deployment remain explicitly unrun.
