# Nest books operations lab (chapters 9–12)

This is the chapter 8 Nest TypeScript `/api/books` memory app extended with Redis cache-aside, a BullMQ notification simulation, Pino and probes. It retains a Zod input contract and guard-first writes. It does **not** connect Prisma/MySQL, send email, emit OpenTelemetry/Sentry events or deploy. The processor runs in the API process **only for this lab**. Consult the bilingual guide in `knowledge-base/backend-learning.json` for tradeoffs and the exact file delta.

## Run in a disposable copy

Use Node 22 and Docker. Run these commands from the **data repo root**, not against any shared Redis instance. Choose an unused local port; this example uses `6387` and `3000`. Keep the API terminal running during the HTTP exercises.

```bash
cp -R docs/examples/backend-next /tmp/books-next-rev1
cd /tmp/books-next-rev1
npm ci --no-audit --no-fund
docker run -d --rm --name books-next-rev1-redis -p 127.0.0.1:6387:6379 redis:7-alpine
REDIS_PORT=6387 npm run build
REDIS_PORT=6387 npm start
```

In another terminal, run from `/tmp/books-next-rev1`:

```bash
curl -s 'http://127.0.0.1:3000/api/books?locale=en'
curl -s 'http://127.0.0.1:3000/api/books?locale=en'
docker exec books-next-rev1-redis redis-cli TTL books:list:v1:locale:en
curl -si -X POST 'http://127.0.0.1:3000/api/books' -H 'content-type: application/json' -H 'x-test-role: editor' -H 'x-request-id: local-create' -d '{"title":"DDD","locale":"en"}'
curl -si -X PATCH 'http://127.0.0.1:3000/api/books/3' -H 'content-type: application/json' -H 'x-test-role: editor' -H 'x-request-id: local-patch' -d '{"title":"DDD revised","locale":"en"}'
curl -s 'http://127.0.0.1:3000/api/books?locale=en'
REDIS_PORT=6387 node dist/inspect.js notify-3-1 notify-3-2
curl -si -X POST 'http://127.0.0.1:3000/api/books' -H 'content-type: application/json' -H 'x-test-role: editor' -d '{"title":"FAIL_DEMO","locale":"en"}'
sleep 1
REDIS_PORT=6387 node dist/inspect.js notify-4-1
LAB_AUTH_HEADER="$(printf '%s: %s' authorization dummy-header)"
curl -si 'http://127.0.0.1:3000/api/health/ready' -H 'x-request-id: local-health' -H "$LAB_AUTH_HEADER" -H 'cookie: dummy-cookie'
```

**Observed on a fresh disposable run:** GET starts with `"source":"store"` and then `"source":"cache"`; TTL is positive and at most 30 seconds. POST `DDD` returns HTTP 201 and id 3; PATCH returns HTTP 200 with id 3 and revised title; subsequent GET reads `"source":"store"`. `notify-3-1` and `notify-3-2` complete. POST `FAIL_DEMO` returns HTTP 201 with id 4; `notify-4-1: failed, attemptsMade=2, reason=forced teaching failure`. The readiness response is HTTP 200 with `x-request-id: local-health`; Pino logs that request ID with dummy `authorization` and `cookie` values replaced by `[REDACTED]`. Reused Redis data or an already-running API changes ids/counts: start fresh, or inspect actual returned ids instead of relying on 3/4. No email is sent.

To observe Redis-down behavior, **stop only this named container** while the API remains running, then run:

```bash
docker stop books-next-rev1-redis
curl --max-time 3 -s -o /dev/null -w 'live=%{http_code}\n' 'http://127.0.0.1:3000/api/health/live'
curl --max-time 3 -s -o /dev/null -w 'ready=%{http_code}\n' 'http://127.0.0.1:3000/api/health/ready'
curl --max-time 3 -s 'http://127.0.0.1:3000/api/books?locale=en'
```

**Observed with the same running Nest process:** `live=200`, `ready=503`, and GET returns `source:"store"` with HTTP 200 in under 3 seconds. With Redis unavailable, don't attempt a queue-backed POST: memory write could succeed while enqueue fails and the API returns 503. Stop the API with Ctrl-C when finished. The lab allows two seconds for shutdown before exiting if a BullMQ connection cannot close while Redis is down; this is a teaching safety limit, not a production worker shutdown policy. The local cache client disables offline queuing and automatic reconnect; that does not establish production availability or consistency.

## Review-only quality gate

Start a **fresh** disposable Redis container as above for tests if you stopped it. Inside the isolated copy:

```bash
npm run lint
npm run typecheck
REDIS_PORT=6387 npm test
npm run build
test -f dist/main.js
docker build -t reading-api:ci .
docker image inspect reading-api:ci --format '{{.Config.User}}'
```

**Observed locally:** ESLint, `tsc --noEmit`, Nest build and 2/2 Vitest/Supertest tests pass, `dist/main.js` exists, the image builds, and its runtime user is `node`. The complete example workflow lives at `.github/workflows/books-ci.yml` **inside this fixture**, so the data repo's GitHub Actions do not run it. In a separate toy repository it would need to be moved to that repository's root `.github/workflows/`. It supplies a MySQL 8.4 service for a possible future Prisma test, but the current memory-backed tests do not use MySQL. No GitHub workflow of this fixture, real migration, hosted service, image publication or deployment was exercised.
