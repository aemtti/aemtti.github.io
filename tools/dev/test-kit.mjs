// Verifies touch-kit.js in headless Chrome: stick → WASD keys, analog aim stick, multi-touch with a button, rotate hint.
import { open, PRESETS } from './cdp.mjs'
const url = 'http://127.0.0.1:8789/demo.html'
const p = await open({ preset: 'phone-land' })
const out = []
const check = (name, ok, got) => { out.push(`${ok ? 'PASS' : 'FAIL'} ${name}  (${JSON.stringify(got)})`) }
try {
  await p.goto(url, 800)
  // 1) move stick up-right from (150,300): expect KeyW + KeyD held, released after lift
  await p.touch('touchStart', [[150, 300]]); await p.wait(30)
  for (let i = 1; i <= 5; i++) { await p.touch('touchMove', [[150 + 8 * i, 300 - 8 * i]]); await p.wait(20) }
  let k = await p.eval('__keys()'); check('stick up-right holds W+D', k === 'KeyD:68,KeyW:87', k)
  await p.touch('touchEnd', []); await p.wait(60)
  k = await p.eval('__keys()'); check('stick release clears keys', k === '', k)
  // 2) aim stick analog on the right half + FIRE button at the same time (two fingers)
  await p.touch('touchStart', [[560, 250]]); await p.wait(30)
  await p.touch('touchMove', [[600, 250]]); await p.wait(30)
  let aim = await p.eval('__aim'); check('aim stick analog x>0', aim.on && aim.x > 0.5 && Math.abs(aim.y) < 0.1, aim)
  await p.touch('touchStart', [[600, 250], [792, 336]]); await p.wait(60)   // second finger on FIRE
  k = await p.eval('__keys()'); check('FIRE holds Space while aiming', k === 'Space:32', k)
  await p.touch('touchEnd', []); await p.wait(60)
  k = await p.eval('__keys()'); aim = await p.eval('__aim'); check('all released', k === '' && !aim.on, { k, aim })
  await p.shot('out/kit-land.png')
  // 3) portrait: rotate hint visible
  await p.emulate(PRESETS.phone); await p.goto(url, 600)
  const rot = await p.eval(`getComputedStyle(document.querySelector('.tk-rot')).display`); check('portrait shows rotate hint', rot === 'flex', rot)
  await p.shot('out/kit-portrait.png')
  // 4) desktop: kit hidden
  await p.emulate(PRESETS.desktop); await p.goto(url, 600)
  const vis = await p.eval(`document.querySelector('.tk-root').classList.contains('tk-off')`); check('desktop hides controls', vis === true, vis)
  check('no page errors', p.errors.length === 0, p.errors)
} finally { await p.close() }
console.log(out.join('\n'))
