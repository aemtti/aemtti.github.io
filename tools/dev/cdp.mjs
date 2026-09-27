// Headless Chrome driver for checking works on phone / tablet / desktop (touch emulation included).
//
// Library:
//   import { open } from './cdp.mjs'
//   const page = await open({ preset: 'phone' })          // or 'phone-land', 'tablet', 'desktop'; { gpu: true } for WebGPU
//   await page.goto('http://127.0.0.1:8787/play/orbit-golf/')
//   await page.tap(195, 700); await page.drag(100, 700, 100, 600, 300); await page.stick(80, 700, 40, 0, 800)
//   await page.touches([[80, 700], [320, 700]], 600)     // two fingers held together
//   await page.key('Space'); await page.shot('out/orbit-phone.png'); console.log(page.errors)
//   await page.close()
//
// CLI (prints a JSON report; exit code 1 if the page threw errors):
//   node tools/cdp.mjs --url <url> [--preset phone] [--gpu] [--steps '<json array>'] [--shot file.png] [--wait 2500]
//   steps: {"wait":ms} {"tap":[x,y]} {"drag":[x1,y1,x2,y2,ms]} {"stick":[x,y,dx,dy,ms]} {"touches":[[x,y],[x,y]],"ms":600}
//          {"click":[x,y]} {"key":"Space"} {"hold":["KeyW",800]} {"eval":"expr"} {"shot":"file.png"}
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36'
export const PRESETS = {
  phone: { width: 390, height: 844, dpr: 3, mobile: true, touch: true, ua: MOBILE_UA },
  'phone-land': { width: 844, height: 390, dpr: 3, mobile: true, touch: true, ua: MOBILE_UA },
  'phone-small': { width: 360, height: 640, dpr: 2, mobile: true, touch: true, ua: MOBILE_UA },
  tablet: { width: 820, height: 1180, dpr: 2, mobile: true, touch: true, ua: MOBILE_UA.replace('Pixel 8', 'Pixel Tablet').replace(' Mobile', '') },
  desktop: { width: 1366, height: 768, dpr: 1, mobile: false, touch: false },
}
const VK = { Space: 32, Enter: 13, Escape: 27, Tab: 9, Backspace: 8, ShiftLeft: 16, ShiftRight: 16, ControlLeft: 17, AltLeft: 18,
  ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 }
const KEYNAME = { Space: ' ', Enter: 'Enter', Escape: 'Escape', Tab: 'Tab', Backspace: 'Backspace', ShiftLeft: 'Shift', ShiftRight: 'Shift',
  ControlLeft: 'Control', AltLeft: 'Alt', ArrowLeft: 'ArrowLeft', ArrowUp: 'ArrowUp', ArrowRight: 'ArrowRight', ArrowDown: 'ArrowDown' }
const sleep = ms => new Promise(r => setTimeout(r, ms))

class Session {
  constructor(ws) {
    this.ws = ws; this.seq = 0; this.pending = new Map(); this.handlers = []
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data)
      if (m.id && this.pending.has(m.id)) {
        const p = this.pending.get(m.id); this.pending.delete(m.id); clearTimeout(p.timer)
        m.error ? p.rej(new Error(m.error.message + ' @ ' + p.what)) : p.res(m.result)
      }
      else if (m.method) for (const h of this.handlers) h(m)
    })
  }
  send(method, params = {}) {
    const id = ++this.seq
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((res, rej) => {
      const timer = setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('CDP timeout: ' + method)) } }, 60000)
      timer.unref?.()
      this.pending.set(id, { res, rej, timer, what: method + ' ' + JSON.stringify(params).slice(0, 200) })
    })
  }
  on(fn) { this.handlers.push(fn) }
}

async function waitJson(port, pathname, tries = 100) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}${pathname}`); if (r.ok) return await r.json() } catch {}
    await sleep(100)
  }
  throw new Error('Chrome did not start')
}

export async function open({ preset = 'phone', gpu = false, headless = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'))
  // port 0: Chrome picks a free port and writes it to DevToolsActivePort (safe when several agents run at once)
  const args = ['--remote-debugging-port=0', `--user-data-dir=${dir}`, '--no-first-run', '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--mute-audio', '--hide-scrollbars']
  if (headless) args.unshift('--headless=new')
  if (gpu) args.push('--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-gpu-rasterization')
  args.push('about:blank')
  const proc = spawn(CHROME, args, { stdio: 'ignore' })
  let port = 0
  for (let i = 0; i < 150 && !port; i++) {
    try { port = Number(fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split('\n')[0]) } catch {}
    if (!port) await sleep(100)
  }
  if (!port) throw new Error('Chrome did not report a debugging port')
  const list = await waitJson(port, '/json/list')
  const target = list.find(t => t.type === 'page')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej) })
  const s = new Session(ws)
  const page = new Page(s, proc, dir, PRESETS[preset] || preset)
  await page.init()
  return page
}

class Page {
  constructor(s, proc, dir, preset) { this.s = s; this.proc = proc; this.dir = dir; this.preset = preset; this.errors = []; this.console = []; this.failed = []; this.loaded = null }
  async init() {
    const s = this.s
    s.on(m => {
      if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; this.errors.push((d.exception && d.exception.description || d.text || '').split('\n').slice(0, 3).join(' | ')) }
      else if (m.method === 'Runtime.consoleAPICalled') {
        const t = m.params.type, text = m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ')
        this.console.push(`[${t}] ${text}`.slice(0, 300)); if (t === 'error') this.errors.push('console.error: ' + text.slice(0, 300))
      }
      else if (m.method === 'Network.loadingFailed' && !m.params.canceled) this.failed.push(m.params.errorText + ' ' + (m.params.requestId || ''))
      else if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) this.failed.push(m.params.response.status + ' ' + m.params.response.url)
      else if (m.method === 'Page.loadEventFired' && this.loaded) { this.loaded(); this.loaded = null }
    })
    await s.send('Page.enable'); await s.send('Runtime.enable'); await s.send('Network.enable')
    await this.emulate(this.preset)
  }
  async emulate(p) {
    this.preset = p
    const land = p.width > p.height
    await this.s.send('Emulation.setDeviceMetricsOverride', { width: p.width, height: p.height, deviceScaleFactor: p.dpr, mobile: !!p.mobile,
      screenOrientation: p.mobile ? { type: land ? 'landscapePrimary' : 'portraitPrimary', angle: land ? 90 : 0 } : undefined })
    await this.s.send('Emulation.setTouchEmulationEnabled', p.touch ? { enabled: true, maxTouchPoints: 5 } : { enabled: false })
    if (p.ua) await this.s.send('Emulation.setUserAgentOverride', { userAgent: p.ua, platform: 'Linux armv81' })
  }
  async goto(url, waitMs = 1500) {
    const done = new Promise(r => { this.loaded = r; setTimeout(r, 30000) })
    await this.s.send('Page.navigate', { url })
    await done; await sleep(waitMs)
  }
  wait(ms) { return sleep(ms) }
  async eval(expression) {                                  // top-level `await` is allowed (REPL mode is used only then)
    const r = await this.s.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, replMode: /\bawait\b/.test(expression) })
    if (r.exceptionDetails) throw new Error('eval failed: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text))
    return r.result.value
  }
  // Chrome wants the released points listed on touchEnd, so remember what is down.
  touch(type, pts) {
    if (type === 'touchEnd' && !pts.length) pts = this.active || []
    if (type === 'touchEnd' && !pts.length) return Promise.resolve()
    this.active = type === 'touchEnd' ? [] : pts
    return this.s.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i, radiusX: 8, radiusY: 8, force: 1 })) })
  }
  async tap(x, y, holdMs = 70) { await this.touch('touchStart', [[x, y]]); await sleep(holdMs); await this.touch('touchEnd', []); await sleep(120) }
  async drag(x1, y1, x2, y2, ms = 400, steps = 14) {
    await this.touch('touchStart', [[x1, y1]])
    for (let i = 1; i <= steps; i++) { await sleep(ms / steps); await this.touch('touchMove', [[x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps]]) }
    await sleep(40); await this.touch('touchEnd', []); await sleep(120)
  }
  async stick(x, y, dx, dy, holdMs = 800) {                  // virtual joystick: press, push, hold, release
    await this.touch('touchStart', [[x, y]])
    for (let i = 1; i <= 6; i++) { await sleep(25); await this.touch('touchMove', [[x + dx * i / 6, y + dy * i / 6]]) }
    const t0 = Date.now(); while (Date.now() - t0 < holdMs) { await sleep(50); await this.touch('touchMove', [[x + dx, y + dy + ((Date.now() / 50) % 2 ? 0.5 : 0)]]) }
    await this.touch('touchEnd', []); await sleep(120)
  }
  async touches(points, ms = 600) {                        // several fingers down together, then all up
    await this.touch('touchStart', points)
    const t0 = Date.now(); while (Date.now() - t0 < ms) { await sleep(50); await this.touch('touchMove', points.map(([x, y]) => [x, y + ((Date.now() / 50) % 2 ? 0.5 : 0)])) }
    await this.touch('touchEnd', []); await sleep(120)
  }
  async click(x, y) {
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await this.s.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 })
    await sleep(120)
  }
  keyInfo(code) {
    let key = KEYNAME[code], vk = VK[code]
    if (!key && /^Key[A-Z]$/.test(code)) { key = code.slice(3).toLowerCase(); vk = code.charCodeAt(3) }
    if (!key && /^Digit\d$/.test(code)) { key = code.slice(5); vk = code.charCodeAt(5) }
    return { key: key || code, code, windowsVirtualKeyCode: vk || 0, nativeVirtualKeyCode: vk || 0 }
  }
  async key(code, holdMs = 60) {
    const k = this.keyInfo(code)
    await this.s.send('Input.dispatchKeyEvent', { type: 'keyDown', ...k, text: k.key.length === 1 ? k.key : undefined })
    await sleep(holdMs)
    await this.s.send('Input.dispatchKeyEvent', { type: 'keyUp', ...k }); await sleep(80)
  }
  async shot(file) {
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true })
    const r = await this.s.send('Page.captureScreenshot', { format: file.endsWith('.jpg') ? 'jpeg' : 'png', quality: file.endsWith('.jpg') ? 82 : undefined })
    fs.writeFileSync(file, Buffer.from(r.data, 'base64')); return file
  }
  async close() { try { await this.s.send("Browser.close") } catch {} try { this.s.ws.close() } catch {} try { this.proc.kill() } catch {} await sleep(300); try { fs.rmSync(this.dir, { recursive: true, force: true }) } catch {} }
}

export async function runSteps(page, steps) {
  const shots = []
  for (const st of steps) {
    if (st.wait) await page.wait(st.wait)
    else if (st.tap) await page.tap(...st.tap)
    else if (st.drag) await page.drag(...st.drag)
    else if (st.stick) await page.stick(...st.stick)
    else if (st.touches) await page.touches(st.touches, st.ms || 600)
    else if (st.click) await page.click(...st.click)
    else if (st.key) await page.key(st.key)
    else if (st.hold) await page.key(st.hold[0], st.hold[1])
    else if (st.eval) console.log('eval →', JSON.stringify(await page.eval(st.eval)).slice(0, 500))
    else if (st.shot) shots.push(await page.shot(st.shot))
  }
  return shots
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'))) {
  const a = process.argv.slice(2), opt = n => { const i = a.indexOf('--' + n); return i >= 0 ? a[i + 1] : undefined }
  const page = await open({ preset: opt('preset') || 'phone', gpu: a.includes('--gpu') })
  let code = 0
  try {
    await page.goto(opt('url'), Number(opt('wait') || 2500))
    const shots = await runSteps(page, JSON.parse(opt('steps') || '[]'))
    if (opt('shot')) shots.push(await page.shot(opt('shot')))
    const info = await page.eval(`({ title: document.title, w: innerWidth, h: innerHeight, coarse: matchMedia('(pointer: coarse)').matches, touch: 'ontouchstart' in window, scrollW: document.documentElement.scrollWidth })`)
    console.log(JSON.stringify({ ...info, errors: page.errors, failed: page.failed, console: page.console.slice(-15), shots }, null, 1))
    if (page.errors.length) code = 1
  } finally { await page.close() }
  process.exit(code)
}
