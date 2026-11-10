#!/bin/sh
set -eu

container=${REDIS_CONTAINER:-books-next-rev1-redis}
case "$container" in books-next-rev1-redis|books-next-rev2-redis) ;; *) echo 'Use only a named disposable lab container' >&2; exit 1 ;; esac
base=${BASE_URL:-http://127.0.0.1:3000/api}
docker inspect "$container" >/dev/null
test "$(curl --max-time 2 -s -o /dev/null -w '%{http_code}' "$base/health/ready")" = 200
docker stop "$container" >/dev/null
trap 'docker start "$container" >/dev/null' EXIT INT TERM

test "$(curl --max-time 2 -s -o /dev/null -w '%{http_code}' "$base/health/ready")" = 503
post=$(curl --max-time 2 -s -o /dev/null -w '%{http_code}' -X POST "$base/books" \
  -H 'content-type: application/json' -H 'x-test-role: editor' \
  -d '{"title":"Redis offline","locale":"en"}')
patch=$(curl --max-time 2 -s -o /dev/null -w '%{http_code}' -X PATCH "$base/books/1" \
  -H 'content-type: application/json' -H 'x-test-role: editor' \
  -d '{"title":"Sample offline","locale":"en"}')
test "$post" = 503
test "$patch" = 503
printf 'Redis down: POST=%s PATCH=%s (both within 2s)\n' "$post" "$patch"

docker start "$container" >/dev/null
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if test "$(curl --max-time 2 -s -o /dev/null -w '%{http_code}' "$base/health/ready")" = 200; then
    printf 'Redis recovered: ready=200 without API restart\n'
    exit 0
  fi
  sleep .5
done
echo 'Redis did not recover within 5 seconds' >&2
exit 1
