// Publishing guard. The site may contain ONLY the works listed in works.json — nothing else, ever.
// Runs in GitHub Actions before every deploy and once a day; the deploy job does not run if this fails.
//
// Checks
//  1. works.json is valid; every listed work has its folder (index.html) and thumbnail.
//  2. Nothing unlisted is published: every folder under play/ must be a listed work or collection item.
//  3. Deny rules: no file path or text content may match a deny rule (rules come from the SITE_DENY secret,
//     one regular expression per line or comma — kept secret so this public repo never names private tools).
//  4. No credentials (key/token patterns, .env files) and no oversized files.
//  5. Repos listed in the PRIVATE_ONLY secret must stay private and must not serve a Pages site.
// Logs never print a denied name: only the rule number and a hashed location.
//
// Local run: node tools/guard.mjs   (optional tools/.guard.local.json {"deny":[...],"privateOnly":[...]} — gitignored)
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OWNER = 'aemtti'
const errors = [], warns = []
const fail = m => errors.push(m), warn = m => warns.push(m)
const h = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10)

let local = {}
try { local = JSON.parse(fs.readFileSync(path.join(root, 'tools/.guard.local.json'), 'utf8')) } catch {}
const split = s => String(s || '').split(/[\n,]/).map(x => x.trim()).filter(Boolean)
const denySrc = process.env.SITE_DENY ? split(process.env.SITE_DENY) : (local.deny || [])
const privateOnly = process.env.PRIVATE_ONLY ? split(process.env.PRIVATE_ONLY) : (local.privateOnly || [])
if (process.env.REQUIRE_SECRETS === '1' && (!denySrc.length || !privateOnly.length)) fail('SITE_DENY / PRIVATE_ONLY secrets are missing — refusing to deploy without the deny rules')
if (!denySrc.length) warn('no deny rules loaded (set SITE_DENY or tools/.guard.local.json)')
const deny = denySrc.map(s => { try { return new RegExp(s, 'i') } catch { fail('invalid deny rule #' + (denySrc.indexOf(s) + 1)); return null } }).filter(Boolean)

// Credentials that must never be published (bounded so base64 blobs don't trigger them)
const B = '(?<![A-Za-z0-9+/_-])', E = '(?![A-Za-z0-9+/_-])'
const SECRET_RULES = [
  ['private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['OpenAI/Anthropic key', new RegExp(B + 'sk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}' + E)],
  ['GitHub token', new RegExp(B + '(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}' + E + '|github_pat_[A-Za-z0-9_]{50,}')],
  ['AWS key', new RegExp(B + 'AKIA[0-9A-Z]{16}' + E)],
  ['Slack token', /xox[baprs]-[A-Za-z0-9-]{10,}/],
]

// 1. works.json
let site
try { site = JSON.parse(fs.readFileSync(path.join(root, 'works.json'), 'utf8')) } catch (e) { fail('works.json is not valid JSON: ' + e.message) }
const listed = new Set(), collections = new Map()
const need = (cond, msg) => { if (!cond) fail(msg) }
if (site) {
  const slugs = new Set()
  const checkWork = (w, where) => {
    need(w.slug && /^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)?$/.test(w.slug), `${where}: bad slug`)
    need(!slugs.has(w.slug), `${where}: duplicate slug`); slugs.add(w.slug)
    need(w.title && w.kind && w.thumb, `${where}: title/kind/thumb required`)
    need(fs.existsSync(path.join(root, w.thumb || '-')), `${where}: thumbnail missing`)
    if (!w.external) {
      need(w.url === `play/${w.slug}/`, `${where}: url must be play/<slug>/`)
      need(fs.existsSync(path.join(root, w.url || '-', 'index.html')), `${where}: play folder has no index.html`)
    } else need(/^https:\/\/aemtti\.github\.io\/[a-z0-9-]+\/$/.test(w.url || ''), `${where}: external url must be an aemtti.github.io project page`)
  }
  for (const [i, w] of (site.works || []).entries()) {
    const where = 'works[' + i + '] ' + (w.slug || '?')
    if (w.kind === 'collection') {
      need(w.slug && w.url === `play/${w.slug}/` && w.thumb && Array.isArray(w.items) && w.items.length, `${where}: collection needs slug/url/thumb/items`)
      need(fs.existsSync(path.join(root, w.thumb || '-')), `${where}: thumbnail missing`)
      collections.set(w.slug, new Set())
      for (const [j, it] of w.items.entries()) {
        const wi = `${where}.items[${j}] ${it.slug || '?'}`
        need((it.slug || '').startsWith(w.slug + '/'), `${wi}: item slug must start with ${w.slug}/`)
        checkWork(it, wi); collections.get(w.slug).add((it.slug || '').split('/')[1])
      }
    } else checkWork(w, where)
    if (!w.external) listed.add(w.slug)
  }
}

// 2. nothing unlisted under play/
const playDir = path.join(root, 'play')
if (fs.existsSync(playDir)) for (const d of fs.readdirSync(playDir, { withFileTypes: true })) {
  if (!d.isDirectory()) { fail('play/ must only contain work folders (found a file ' + h(d.name) + ')'); continue }
  if (!listed.has(d.name)) { fail('unlisted folder under play/ (id ' + h(d.name) + ') — add it to works.json or remove it'); continue }
  if (collections.has(d.name)) for (const e of fs.readdirSync(path.join(playDir, d.name), { withFileTypes: true }))
    if (e.isDirectory() && !collections.get(d.name).has(e.name)) fail(`unlisted item folder under play/${d.name}/ (id ${h(e.name)})`)
}

// Blank out runs of 160+ base64/url-safe characters (linear scan; a regex on multi-MB strings can overflow the stack)
function readable(s) {
  let out = '', last = 0, start = 0, run = 0
  for (let i = 0; i <= s.length; i++) {
    const c = i < s.length ? s.charCodeAt(i) : 0
    const b64 = (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 43 || c === 47 || c === 61 || c === 95 || c === 45
    if (i < s.length && b64) { if (run++ === 0) start = i }
    else { if (run >= 160) { out += s.slice(last, start) + ' '; last = i } run = 0 }
  }
  return out + s.slice(last)
}

// 3 + 4. walk every published file
const TEXT = /\.(html?|js|mjs|css|json|txt|md|svg|xml|csv|webmanifest)$/i
let total = 0, files = 0
const walk = d => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git' || (d === root && e.name === 'node_modules')) continue
    const p = path.join(d, e.name), rel = path.relative(root, p).replace(/\\/g, '/')
    for (const [k, re] of deny.entries()) if (re.test(rel)) fail(`deny rule #${k + 1} matched a path (id ${h(rel)})`)
    if (e.isDirectory()) { walk(p); continue }
    const st = fs.statSync(p); total += st.size; files++
    if (st.size > 95 * 1024 * 1024) fail(`file over 95 MB (id ${h(rel)})`)
    else if (st.size > 50 * 1024 * 1024) warn(`file over 50 MB: ${rel}`)
    if (/(^|\/)\.env(\.|$)|\.(pem|key|p12|pfx)$|id_rsa|cookies?\.txt$/i.test(rel)) fail(`credential-like file name (id ${h(rel)})`)
    if (TEXT.test(e.name) && st.size < 60 * 1024 * 1024 && !rel.startsWith('tools/') && !rel.startsWith('.github/')) {
      const s = fs.readFileSync(p, 'utf8')
      // deny rules look at readable text only: long base64/data runs (embedded audio, images) are blanked first
      const text = readable(s)
      for (const [k, re] of deny.entries()) if (re.test(text)) fail(`deny rule #${k + 1} matched file content (id ${h(rel)})`)
      for (const [name, re] of SECRET_RULES) if (re.test(s)) fail(`${name} pattern in ${rel}`)
    }
  }
}
walk(root)
if (total > 950 * 1024 * 1024) fail(`site is ${Math.round(total / 1048576)} MB (limit 950 MB)`)

// 5. private-only repos stay private and have no Pages site
async function status(url, headers) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(url, { headers, redirect: 'manual' }); return r.status } catch { await new Promise(r => setTimeout(r, 1500)) }
  }
  return -1
}
const headers = { 'User-Agent': 'aemtti-site-guard', Accept: 'application/vnd.github+json' }
if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN
for (const [k, name] of privateOnly.entries()) {
  const api = await status(`https://api.github.com/repos/${OWNER}/${encodeURIComponent(name)}`, headers)
  if (api === 200) fail(`private-only repo #${k + 1} is PUBLIC — make it private again`)
  else if (api !== 404) fail(`could not confirm private-only repo #${k + 1} is private (HTTP ${api})`)
  const pages = await status(`https://${OWNER}.github.io/${encodeURIComponent(name)}/`, { 'User-Agent': 'aemtti-site-guard' })
  if (pages === 200 || pages === 301 || pages === 302) fail(`private-only repo #${k + 1} is serving a Pages site — turn Pages off`)
}

for (const w of warns) console.log('warn:', w)
if (errors.length) { for (const e of errors) console.log('FAIL:', e); console.log(`guard: ${errors.length} problem(s) — not publishing`); process.exit(1) }
console.log(`guard: ok — ${listed.size} listed entries, ${files} files, ${Math.round(total / 1048576)} MB, ${deny.length} deny rules, ${privateOnly.length} private-only repos checked`)
