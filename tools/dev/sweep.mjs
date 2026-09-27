// Opens every listed work on a phone (portrait + landscape) and on desktop, taps once, and records page errors,
// failed requests and a screenshot. Use before every publish of many changes.
//   node tools/dev/serve.mjs . 8787 &   then   node tools/dev/sweep.mjs [http://127.0.0.1:8787/] [slug-filter]
// Writes out/sweep/<slug>--<preset>.jpg and out/sweep/report.json; exit code 1 if any page threw errors.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { open, PRESETS } from './cdp.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const base = process.argv[2] || 'http://127.0.0.1:8787/'
const filter = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : ''
const shardArg = process.argv.find(a => a.startsWith('--shard='))            // --shard=i/n: run every n-th item starting at i
const [shardI, shardN] = shardArg ? shardArg.slice(8).split('/').map(Number) : [0, 1]
const tag = shardArg ? '-' + shardI : ''
const site = JSON.parse(fs.readFileSync(path.join(root, 'works.json'), 'utf8'))
const list = []
for (const w of site.works) {
  if (w.external || w.hidden) continue
  if (w.kind === 'collection') { list.push({ slug: w.slug, url: w.url, collection: true }); for (const i of w.items) if (!i.hidden) list.push(i) }
  else list.push(w)
}
const outDir = path.join(root, 'out', 'sweep'); fs.mkdirSync(outDir, { recursive: true })
const report = []
for (const w of list.filter(w => w.slug.includes(filter)).filter((_, i) => i % shardN === shardI)) {
  for (const preset of w.collection ? ['phone'] : ['phone', 'phone-land', 'desktop']) {
    const page = await open({ preset, gpu: w.needs === 'webgpu' })
    const r = { slug: w.slug, preset }
    try {
      await page.goto(base + w.url, 3000)
      const P = PRESETS[preset]
      if (!w.collection) { if (P.touch) await page.tap(P.width / 2, P.height / 2); else await page.click(P.width / 2, P.height / 2); await page.wait(1500) }
      const info = await page.eval(`({ title: document.title, scrollW: document.documentElement.scrollWidth, w: innerWidth, vp: !!document.querySelector('meta[name=viewport]') })`)
      Object.assign(r, info, { hscroll: info.scrollW > info.w + 2 })
      await page.shot(path.join(outDir, `${w.slug.replace('/', '--')}--${preset}.jpg`))
    } catch (e) { r.fatal = String(e.message || e).slice(0, 200) }
    r.errors = page.errors.slice(0, 5); r.failed = page.failed.filter(f => !/favicon/.test(f)).slice(0, 5)
    await page.close()
    report.push(r)
    const bad = r.fatal || r.errors.length || r.failed.length || r.hscroll || r.vp === false
    console.log(`${bad ? 'CHECK' : 'ok   '} ${w.slug.padEnd(40)} ${preset.padEnd(11)} ${r.fatal || ''}${r.errors.length ? ' errors:' + r.errors.length : ''}${r.failed.length ? ' failed:' + r.failed.length : ''}${r.hscroll ? ' h-scroll' : ''}${r.vp === false ? ' no-viewport' : ''}`)
  }
}
fs.writeFileSync(path.join(outDir, 'report' + tag + '.json'), JSON.stringify(report, null, 1))
process.exit(report.some(r => r.fatal || r.errors.length) ? 1 : 0)
