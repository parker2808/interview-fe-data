# Backend operations continuation

## Scope

Stack on `content/backend-from-frontend`, without changing the eight core chapters' anchors, topic count or app contract. Four bilingual chapters 9–12 follow core chapter 8 in `backend-learning.json`; the separate disposable example lives in `docs/examples/backend-next/`. The portfolio repository is evidence only. Never connect to a real service or deploy.

## Acceptance criteria

- AC1: Explain Redis/cache-aside, TTL, invalidation and stampede with explicit Next.js tag-cache comparison and source-status boundaries.
- AC2: Explain BullMQ queue/worker, retry/backoff, duplicate execution, idempotency and an application-owned dead-letter policy with email/image examples.
- AC3: Explain structured logging, Pino, request ID, health checks, OTel tracing and Sentry errors without asserting unobserved production wiring.
- AC4: Explain general CI/CD with GitHub Actions, lint, typecheck, Vitest, Docker build, migrate-on-deploy; distinguish configured code from live Render/Vercel/TiDB.
- AC5: Each chapter provides EN/VI theory, ASCII diagram, comparison table, runnable book-API fixture, diagnosis, worked Q&A, exercise/acceptance and official references.
- AC6: Run examples in disposable local copies, record exact outputs and limits; run data/app validation and check no secrets/PII. Do not merge or deploy.

## Verification

Run Node 22 and a disposable Docker Redis, exercise GET/POST, worker completion, status/log outputs, local npm checks and a local toy image build. Duplicate/retry/DLQ scenarios are theory and guided exercises, not claims of execution. Run repo scripts; app tests/build from the app branch with this data checkout when possible. Publish only a stacked data PR for review, base `content/backend-from-frontend`.
