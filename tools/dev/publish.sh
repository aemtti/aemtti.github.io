#!/usr/bin/env bash
# Publish selected works: rebuild pages, commit ONLY those works (+ works.json/pages), run the guard on the
# committed tree in a throwaway clone (exactly what CI will see), then push. Aborts (and undoes the commit) if the guard fails.
#   bash tools/dev/publish.sh "commit message" slug [slug ...]      (a collection slug publishes the whole collection)
set -euo pipefail
cd "$(dirname "$0")/../.."
msg="$1"; shift
node tools/build-site.mjs
paths=(works.json index.html)
for s in "$@"; do
  [ -d "play/$s" ] || { echo "missing play/$s"; exit 1; }
  paths+=("play/$s")
  for t in thumbs/"$s".jpg thumbs/"$s"--*.jpg; do [ -f "$t" ] && paths+=("$t"); done
done
git add -- "${paths[@]}"
git add -A -- tools .github assets .gitignore 404.html README.md 2>/dev/null || true
git diff --cached --quiet && { echo "nothing to publish"; exit 0; }
git commit -q -m "$msg"
tmp="$(mktemp -d)"
git clone -q --no-hardlinks . "$tmp/site"
[ -f tools/.guard.local.json ] && cp tools/.guard.local.json "$tmp/site/tools/"
if ! node "$tmp/site/tools/guard.mjs"; then
  echo "guard failed on the committed tree — undoing the commit"; git reset -q --soft HEAD~1; rm -rf "$tmp"; exit 1
fi
rm -rf "$tmp"
GIT_TERMINAL_PROMPT=0 git push -q origin HEAD:main
echo "published: $* ($(git rev-parse --short HEAD))"
