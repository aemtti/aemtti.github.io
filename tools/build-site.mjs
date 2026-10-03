// Builds the gallery pages from works.json (the single source of truth for what the site shows).
//   node tools/build-site.mjs            → index.html + play/<collection>/index.html for every collection
// Only works listed in works.json are shown; nothing is discovered automatically.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const site = JSON.parse(fs.readFileSync(path.join(root, 'works.json'), 'utf8'))
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const KIND = { game: '게임', art: '아트', program: '프로그램', sim: '시뮬레이션', toy: '인터랙티브', film: '영상', music: '음악', collection: '모음' }
const BASE = 'https://aemtti.github.io/'

function card(w, rel) {
  const href = w.external ? w.url : rel + w.url
  const kinds = w.kind === 'collection' ? [...new Set((w.items || []).map(i => i.kind))] : [w.kind]
  const badges = [`<span class="b k">${esc(KIND[w.kind] || w.kind)}</span>`]
  if (w.kind === 'collection') badges.push(`<span class="b">${(w.items || []).length}개</span>`)
  if (w.orientation === 'landscape') badges.push('<span class="b" title="휴대폰은 가로로">가로 ⟲</span>')
  if (w.needs === 'webgpu') badges.push('<span class="b" title="WebGPU 지원 브라우저 필요 (최신 크롬 등)">WebGPU</span>')
  const how = w.mobile || w.desktop ? `<p class="how"><span class="m">📱 ${esc(w.mobile || '')}</span><span class="d">⌨ ${esc(w.desktop || '')}</span></p>` : ''
  return `<a class="card" href="${esc(href)}" data-kind="${esc(kinds.join(' '))}">
  <div class="thumb"><img src="${esc(rel + w.thumb)}" alt="" loading="lazy" decoding="async"></div>
  <div class="body"><h2>${esc(w.title)}${w.en && w.en !== w.title ? ` <small>${esc(w.en)}</small>` : ''}</h2>
  <p class="desc">${esc(w.desc)}</p>${how}<p class="badges">${badges.join('')}</p></div></a>`
}

function page({ title, desc, rel, heading, intro, cards, chips, back, ogImage, canonical }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(BASE + ogImage)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f3efe6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#161412" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${rel}assets/icon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${rel}assets/site.css">
</head>
<body>
<header>
${back ? `<a class="back" href="${rel}">← 전체 작품</a>` : ''}
<h1>${esc(heading)}</h1>
<p>${intro}</p>
${chips || ''}
</header>
<main class="grid">
${cards.join('\n')}
</main>
<footer><p>모든 그림·소리·움직임은 코드로 만들었어요. 휴대폰과 PC 모두에서 할 수 있어요.</p><p class="upd">업데이트 ${esc(site.updated)}</p></footer>
<script src="${rel}assets/site.js" defer></script>
</body>
</html>
`
}

const works = site.works.filter(w => !w.hidden)
const counts = {}
for (const w of works) for (const k of (w.kind === 'collection' ? [...new Set(w.items.map(i => i.kind))] : [w.kind])) counts[k] = (counts[k] || 0) + 1
const order = ['game', 'art', 'program', 'sim', 'toy', 'film', 'music']
const chips = `<nav class="chips" aria-label="분류"><button type="button" data-f="all" aria-pressed="true">전체</button>${order.filter(k => counts[k]).map(k => `<button type="button" data-f="${k}" aria-pressed="false">${KIND[k]}</button>`).join('')}</nav>`

fs.writeFileSync(path.join(root, 'index.html'), page({
  title: 'aemtti — 코드로 만든 작품들', desc: site.description, rel: '', heading: 'aemtti',
  intro: esc(site.description), cards: works.map(w => card(w, '')), chips, ogImage: site.ogImage, canonical: BASE,
}))

let n = 1
for (const c of works.filter(w => w.kind === 'collection')) {
  const dir = path.join(root, c.url)
  fs.mkdirSync(dir, { recursive: true })
  const depth = c.url.replace(/\/$/, '').split('/').length
  const rel = '../'.repeat(depth)
  // items' urls/thumbs are site-root relative; cards get the same rel prefix
  fs.writeFileSync(path.join(dir, 'index.html'), page({
    title: `${c.title} — aemtti`, desc: c.desc, rel, heading: c.title, intro: esc(c.desc), back: true,
    cards: c.items.filter(i => !i.hidden).map(i => card(i, rel)), ogImage: c.thumb, canonical: BASE + c.url,
  }))
  n++
}
console.log(`built index.html (${works.length} entries) and ${n - 1} collection page(s)`)
