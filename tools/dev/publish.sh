#!/usr/bin/env bash
# Publish selected works: rebuild pages, commit ONLY those works (+ works.json/pages), run the guard on the
# committed tree in a throwaway clone (exactly what CI will see), then push. Aborts (and undoes the commit) if the guard fails.
#   bash tools/dev/publish.sh "commit message" slug [slug ...]
# A collection slug publishes its generated index page and only the items listed in works.json (unlisted work-in-progress
# folders inside the collection stay uncommitted).
set -euo pipefail
cd "$(dirname "$0")/../.."
msg="$1"; shift
node tools/build-site.mjs
mapfile -t paths < <(node -e '
const fs = require("fs"), j = JSON.parse(fs.readFileSync("works.json", "utf8")), out = ["works.json", "index.html"]
for (const s of process.argv.slice(1)) {
  const w = j.works.find(x => x.slug === s)
  if (!w) { console.error("not in works.json: " + s); process.exit(1) }
  if (w.external) continue
  out.push(w.thumb)
  if (w.kind === "collection") { out.push(w.url + "index.html"); for (const i of w.items) out.push(i.url, i.thumb) }
  else out.push(w.url)
}
for (const p of out) { if (!fs.existsSync(p)) { console.error("missing " + p); process.exit(1) } console.log(p) }
' "$@")
git add -- "${paths[@]}"
git add -A -- tools .github assets .gitignore 404.html README.md favicon.ico thumbs/_og.jpg 2>/dev/null || true
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
