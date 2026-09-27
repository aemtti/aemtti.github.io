// Collector: brings in works that other repositories have marked for the site with a `site.json` file,
// so a work made on any machine (home desktop, shop laptop, phone) reaches the site without hand-editing works.json.
// Runs in GitHub Actions BEFORE build-site.mjs and guard.mjs — everything it adds still has to pass the guard.
//
// Needs the secret SITE_COLLECT_TOKEN (fine-grained token, Contents: read-only on the owner's repositories).
// Without it the collector does nothing and the site deploys exactly as before.
//
// site.json in a source repository (default branch):
// { "works": [ {
//     "slug": "one-more-floor",            // lowercase-kebab, becomes play/<slug>/
//     "title": "한 층 더", "en": "One More Floor",
//     "kind": "game",                      // game · toy · art · film · music
//     "orientation": "portrait",           // any · portrait · landscape
//     "desc": "…", "mobile": "…", "desktop": "…",
//     "entry": "2026-09-26-one-more-floor", // a folder with index.html, or a single .html file (committed, already built)
//     "thumb": "2026-09-26-one-more-floor/thumb.jpg",   // optional 1280×720 image; otherwise a screenshot is taken
//     "needs": "webgpu"                     // optional
// } ] }
//
// Rules: repos named in PRIVATE_ONLY are never read; a slug that already exists as a hand-made works.json entry is
// skipped (hand-made entries win); only the listed entry path is copied, without docs, maps, env files or anything
// over 45 MB. Auto entries carry "auto": "<repo>" and are rebuilt on every run — they are never committed.
// Writes auto-manifest.json (published) and, in Actions, `changed=true|false` so the hourly run deploys only on change.
//
// Local test (in a throwaway copy of this repo): SITE_COLLECT_TOKEN=$(gh auth token) PRIVATE_ONLY=a,b node tools/collect.mjs
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'
import crypto from 'node:crypto'
import { execFileSync, spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OWNER = 'aemtti', SELF = 'aemtti.github.io'
const TOKEN = process.env.SITE_COLLECT_TOKEN || ''
const KINDS = new Set(['game', 'toy', 'art', 'film', 'music'])
const MAX_FILE = 45 * 1024 * 1024, MAX_WORK = 150 * 1024 * 1024
const SKIP_NAME = /^(\.git|node_modules|\.openai|\.env.*|site\.json|CLAUDE\.md|AGENTS\.md|README\.md)$|\.(md|map|pem|key)$/i
const log = (...a) => console.log('collect:', ...a)

function output(changed) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`)
}
if (!TOKEN) { log('no SITE_COLLECT_TOKEN — skipping (site deploys as before)'); output(false); process.exit(0) }

let local = {}
try { local = JSON.parse(fs.readFileSync(path.join(root, 'tools/.guard.local.json'), 'utf8')) } catch {}
const split = s => String(s || '').split(/[\n,]/).map(x => x.trim()).filter(Boolean)
const privateOnly = new Set((process.env.PRIVATE_ONLY ? split(process.env.PRIVATE_ONLY) : (local.privateOnly || [])).map(s => s.toLowerCase()))
if (!privateOnly.size) { log('PRIVATE_ONLY is empty — refusing to read other repositories'); output(false); process.exit(0) }

const api = async (p) => {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch('https://api.github.com' + p, { headers: { Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github+json', 'User-Agent': 'aemtti-site-collect' } })
      if (r.status === 404) return null
      if (!r.ok) throw new Error('HTTP ' + r.status)
      return r.json()
    } catch (e) { if (i === 2) throw e; await new Promise(r => setTimeout(r, 1500)) }
  }
}

const sitePath = path.join(root, 'works.json')
const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'))
const manual = new Set()
for (const w of site.works || []) { manual.add(w.slug); for (const it of w.items || []) manual.add(it.slug) }

// every repository the token can read, owned by the account
const repos = []
for (let page = 1; page < 20; page++) {
  const list = await api(`/user/repos?per_page=100&affiliation=owner&page=${page}`)
  if (!list || !list.length) break
  repos.push(...list)
}
log(`${repos.length} repositories visible`)

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'collect-'))
const found = [], manifest = [], taken = new Set()
const safeRel = p => typeof p === 'string' && p && !path.isAbsolute(p) && !p.split(/[\\/]/).includes('..')

function copyTree(src, dst, budget) {
  fs.mkdirSync(dst, { recursive: true })
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP_NAME.test(e.name)) continue
    const s = path.join(src, e.name), d = path.join(dst, e.name)
    if (e.isSymbolicLink()) continue
    if (e.isDirectory()) { copyTree(s, d, budget); continue }
    const size = fs.statSync(s).size
    if (size > MAX_FILE) throw new Error('a file is over 45 MB')
    budget.used += size
    if (budget.used > MAX_WORK) throw new Error('the work is over 150 MB')
    fs.copyFileSync(s, d)
  }
}

for (const repo of repos) {
  const name = repo.name
  if (name === SELF || repo.fork || repo.archived || privateOnly.has(name.toLowerCase())) continue
  const meta = await api(`/repos/${OWNER}/${encodeURIComponent(name)}/contents/site.json?ref=${encodeURIComponent(repo.default_branch)}`)
  if (!meta || meta.type !== 'file') continue
  let spec
  try { spec = JSON.parse(Buffer.from(meta.content, 'base64').toString('utf8')) } catch { log(`${name}: site.json is not valid JSON — skipped`); continue }
  const works = Array.isArray(spec.works) ? spec.works : []
  if (!works.length) continue
  const branch = await api(`/repos/${OWNER}/${encodeURIComponent(name)}/branches/${encodeURIComponent(repo.default_branch)}`)
  const sha = branch?.commit?.sha || '', date = branch?.commit?.commit?.committer?.date || ''

  // shallow, sparse clone of just the listed paths (the token never appears in logs: GitHub masks secrets)
  const dir = path.join(tmp, name)
  const paths = [...new Set(works.flatMap(w => [w.entry, w.thumb]).filter(safeRel))]
  try {
    const url = `https://x-access-token:${TOKEN}@github.com/${OWNER}/${name}.git`
    execFileSync('git', ['clone', '--quiet', '--depth', '1', '--filter=blob:none', '--sparse', '--branch', repo.default_branch, url, dir], { stdio: 'pipe' })
    execFileSync('git', ['-C', dir, 'sparse-checkout', 'set', '--no-cone', ...paths.map(p => '/' + p.replace(/\\/g, '/'))], { stdio: 'pipe' })
  } catch { log(`${name}: could not fetch the files — skipped`); continue }

  const slugs = []
  for (const [i, w] of works.entries()) {
    const where = `${name} works[${i}]`
    const slug = String(w.slug || '')
    if (!/^[a-z0-9][a-z0-9-]{0,48}$/.test(slug)) { log(`${where}: bad slug — skipped`); continue }
    if (manual.has(slug)) { log(`${where}: "${slug}" is already a hand-made entry — skipped`); continue }
    if (taken.has(slug)) { log(`${where}: "${slug}" is used by another repository — skipped`); continue }
    if (!KINDS.has(w.kind) || !w.title || !w.desc || !safeRel(w.entry)) { log(`${where}: needs kind/title/desc/entry — skipped`); continue }
    const src = path.join(dir, w.entry)
    const out = path.join(root, 'play', slug)
    try {
      fs.rmSync(out, { recursive: true, force: true })
      if (fs.existsSync(src) && fs.statSync(src).isFile() && /\.html?$/i.test(src)) {
        if (fs.statSync(src).size > MAX_FILE) throw new Error('the file is over 45 MB')
        fs.mkdirSync(out, { recursive: true }); fs.copyFileSync(src, path.join(out, 'index.html'))
      } else if (fs.existsSync(path.join(src, 'index.html'))) copyTree(src, out, { used: 0 })
      else throw new Error('entry has no index.html')
    } catch (e) { fs.rmSync(out, { recursive: true, force: true }); log(`${where}: ${e.message} — skipped`); continue }

    let thumb = ''
    if (safeRel(w.thumb) && /\.(jpe?g|png|webp)$/i.test(w.thumb) && fs.existsSync(path.join(dir, w.thumb))) {
      thumb = `thumbs/${slug}${path.extname(w.thumb).toLowerCase()}`
      fs.copyFileSync(path.join(dir, w.thumb), path.join(root, thumb))
    }
    taken.add(slug); slugs.push(slug)
    found.push({ date, entry: {
      slug, title: String(w.title), ...(w.en ? { en: String(w.en) } : {}), kind: w.kind,
      orientation: ['any', 'portrait', 'landscape'].includes(w.orientation) ? w.orientation : 'any',
      desc: String(w.desc), ...(w.mobile ? { mobile: String(w.mobile) } : {}), ...(w.desktop ? { desktop: String(w.desktop) } : {}),
      url: `play/${slug}/`, thumb, ...(w.needs === 'webgpu' ? { needs: 'webgpu' } : {}), auto: name,
    } })
  }
  if (slugs.length) manifest.push({ repo: name, sha, slugs, spec: crypto.createHash('sha256').update(JSON.stringify(works)).digest('hex').slice(0, 16) })
}

// thumbnails that were not provided: screenshot the work in headless Chrome, or fall back to a simple card
const pending = found.filter(f => !f.entry.thumb)
if (pending.length) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.wasm': 'application/wasm' }
  const server = http.createServer((q, s) => {
    let p = decodeURIComponent(new URL(q.url, 'http://x').pathname)
    if (p.endsWith('/')) p += 'index.html'
    const f = path.join(root, p)
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end() }
    s.writeHead(200, { 'Content-Type': types[path.extname(f).toLowerCase()] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s)
  })
  await new Promise(r => server.listen(0, '127.0.0.1', r))
  const port = server.address().port
  const chrome = [process.env.CHROME, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].filter(Boolean)
  for (const f of pending) {
    const png = path.join(root, 'thumbs', f.entry.slug + '.png')
    // async on purpose: the little server above must keep answering while Chrome loads the page
    const run = (bin, args) => new Promise(res => {
      let p
      try { p = spawn(bin, args, { stdio: 'ignore' }) } catch { return res(-1) }
      const t = setTimeout(() => { try { p.kill() } catch {} }, 60000)
      p.on('error', () => { clearTimeout(t); res(-1) })
      p.on('exit', code => { clearTimeout(t); res(code) })
    })
    for (const bin of chrome) {
      const status = await run(bin, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--mute-audio', '--window-size=1280,720',
        `--user-data-dir=${path.join(tmp, 'chrome-profile')}`, '--no-first-run', '--no-default-browser-check',
        '--virtual-time-budget=5000', `--screenshot=${png}`, `http://127.0.0.1:${port}/play/${f.entry.slug}/`])
      if (status === 0 && fs.existsSync(png) && fs.statSync(png).size > 2000) break
    }
    if (fs.existsSync(png) && fs.statSync(png).size > 2000) f.entry.thumb = `thumbs/${f.entry.slug}.png`
    else {
      const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
      fs.writeFileSync(path.join(root, 'thumbs', f.entry.slug + '.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#201d1a"/><text x="640" y="380" font-family="sans-serif" font-size="72" fill="#eee8dd" text-anchor="middle">${esc(f.entry.title)}</text></svg>`)
      f.entry.thumb = `thumbs/${f.entry.slug}.svg`
    }
  }
  server.close()
}

// newest works first, ahead of the hand-curated list
found.sort((a, b) => String(b.date).localeCompare(String(a.date)))
site.works = [...found.map(f => f.entry), ...(site.works || [])]
fs.writeFileSync(sitePath, JSON.stringify(site, null, 2) + '\n')

const hash = crypto.createHash('sha256').update(JSON.stringify(manifest)).digest('hex').slice(0, 16)
fs.writeFileSync(path.join(root, 'auto-manifest.json'), JSON.stringify({ hash, works: manifest.map(m => ({ repo: m.repo, sha: m.sha.slice(0, 12), slugs: m.slugs })) }, null, 2) + '\n')
fs.rmSync(tmp, { recursive: true, force: true })

let live = ''
try { const r = await fetch(`https://${OWNER}.github.io/auto-manifest.json?t=${Date.now()}`, { cache: 'no-store' }); if (r.ok) live = (await r.json()).hash || '' } catch {}
const changed = live !== hash
log(`${found.length} work(s) from ${manifest.length} repositor${manifest.length === 1 ? 'y' : 'ies'} · ${changed ? 'changed since the live site' : 'same as the live site'}`)
output(changed)
