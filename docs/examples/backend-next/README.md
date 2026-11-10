# Disposable books operations fixture

This is a teaching fixture, not the portfolio API. Copy this directory to a fresh `/tmp` path before running it. It uses Node 22, Docker and a loopback-only Redis container; never run it with real credentials or a real database. `books.mjs` stores books in memory, so a process restart loses writes. No email is sent. The worker's `SET NX` marker is **not** a reliable exactly-once external side-effect protocol.

```sh
cp -R docs/examples/backend-next /tmp/books-next-local
cd /tmp/books-next-local
npm ci --no-audit --no-fund
docker run -d --rm --name books-next-redis -p 127.0.0.1:6379:6379 redis:7-alpine
docker exec books-next-redis redis-cli ping
node worker.mjs # terminal A
node books.mjs  # terminal B
curl -s http://127.0.0.1:4319/health
curl -s http://127.0.0.1:4319/books/1
curl -s http://127.0.0.1:4319/books/1
curl -s -X POST -H 'content-type: application/json' -d '{"id":"1","title":"Refactoring"}' http://127.0.0.1:4319/books
curl -s http://127.0.0.1:4319/books/1
```

Stop terminals A and B with Ctrl-C, then run `docker stop books-next-redis`. Use `docker ps` if the chosen name or port is already occupied. Do not stop unrelated containers.

Observed on a disposable Node 22.21.1 / Redis 7-alpine run: `PONG`; health returned `{"status":"ok","redis":"reachable"}`; first GET returned `source:store`, second `source:cache`; POST returned 201 and `queued:true`; the next GET returned `source:store` with `Refactoring`. Worker printed `would send notification for book 1` and `job notify-1: processed`. Pino logged a generated request ID, status 200 and one observed duration of 3 ms. This is one local sample, not a latency benchmark or production evidence. Redis was stopped afterward.

Local CI-style gate in a fresh copy: `npm ci --no-audit --no-fund && npm run lint && npm run typecheck && npm test && npm run build && docker build -t books-next:local .`. The scripts named `lint`, `typecheck` and `build` only run JavaScript syntax checks; Vitest checks a book shape (1 test passed). The image built locally but was not run or pushed. No TS compiler, end-to-end test, GitHub Actions run or database migration was executed here. Replace these placeholders before using a workflow for a real Nest API. The Docker image expects Redis at its own localhost; running it would require an explicit isolated container network and Redis hostname configuration.
