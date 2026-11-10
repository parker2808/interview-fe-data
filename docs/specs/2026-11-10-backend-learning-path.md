# Backend learning path from frontend

## Scope

### Revision after Parker's review (2026-11-10)

The initial PR #65 guide is an outline, not finished teaching material. Retain the existing `backend-learning` catalog entry and 23-topic count, but replace its outline with connected, substantial chapters within that document. Each core chapter must explain the problem, request/data lifecycle, vocabulary and tradeoffs, source evidence, a contextual toy reading-list example, failure modes, questions with worked answers, a guided exercise with acceptance criteria and official references. The introductory chapter must map prerequisites and terms; the final chapter must separate optional services from the core. EN and VI must cover the same concepts, with idiomatic Vietnamese. No production connection, live-status assertion or unrelated code changes.

Review the four-case protected POST test separately: anonymous 401, authenticated reader 403, authorized editor with invalid payload 400, authorized editor with valid payload success. Use explicit test identities and an isolated toy app. Any excerpt that is not a complete runnable program must be labeled as an excerpt and name its dependencies/setup.

Add a bilingual knowledge-base guide grounded in the backend of the portfolio project on its `main` branch, not in a CV. Preserve the existing six catalog groups and content schema; this is a guide, not a change to the 30-day frontend plan or practice steps. The consuming app automatically reads the generated catalog at build time.

## Acceptance criteria

- AC1: The guide distinguishes source-implemented behavior, declared dependencies and configured/planned environments without claiming that a dependency proves usage or that configuration proves a live deployment. Inspect the API, shared contracts, database, tests and infrastructure files.
- AC2: EN/VI sections lead from HTTP/Node/TypeScript through NestJS, Zod contracts, MySQL/Prisma, auth, testing and Docker/operations, each with a concrete example or exercise and official references. Separate essentials from optional follow-ups.
- AC3: MySQL 8.4 is local; TiDB Cloud is the documented production target; `@prisma/adapter-mariadb` is a driver adapter, not evidence of a MariaDB production server. Testing uses Vitest and Supertest, not Jest; request validation uses Zod rather than assuming class-validator.
- AC4: Regenerate the catalog under the existing `infra` group; the app can resolve the new slug and its EN/VI headings without a schema change. Update app UI topic counts, root READMEs and context changelogs.
- AC5: All content and app validation pass against the new data checkout, and no secret, PII, production operation, merge or change to the source portfolio repo occurs.

## Plan and verification

1. Add the bilingual guide and catalog entry (AC1–4); run `sync-kb-index.mjs`, `validate.mjs`, `check-content.mjs`.
2. Update the consuming app's topic count and README (AC4); validate pulled content against this worktree and run its tests.
3. Inspect both diffs and scan for sensitive content; open unmerged PRs for independent review (AC5).

## Source boundaries

Evidence is the portfolio repository `main`: `README.md`, `apps/api/src/`, `apps/api/test/`, `apps/api/package.json`, `apps/api/prisma/`, `packages/contracts/src/`, `docker-compose.yml`, `render.yaml`, `apps/api/Dockerfile` and `docs/PLAN.md`. Configuration describes intent, not proof of running production. No changes to that repository.
