// hud.js — canvas2d overlay: crosshair, radar, killfeed, health/ammo, objective state.
import * as C from '../game/constants.js';
import { GRID, GRID_W, GRID_H, CELL, SITES } from '../world/brushes.js';
import { fmtTime, clamp, normAngle } from '../core/math.js';
import { currentWeapon, ammoOf, nadeCount } from '../game/player.js';
import { inaccuracy } from '../game/weapons.js';
import { settings } from '../core/settings.js';

const FONT = "'Bahnschrift','DIN Alternate','Arial Narrow',Arial,sans-serif";

function buildRadarBase() {
  const s = 4;                                  // pixels per cell
  const c = document.createElement('canvas');
  c.width = GRID_W * s; c.height = GRID_H * s;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(10,14,19,0)';
  g.fillRect(0, 0, c.width, c.height);
  for (let r = 0; r < GRID_H; r++) {
    for (let col = 0; col < GRID_W; col++) {
      if (GRID[r][col] !== '.') continue;
      g.fillStyle = '#5d6a76';
      g.fillRect(col * s, r * s, s, s);
    }
  }
  // outline the open space
  g.globalCompositeOperation = 'source-atop';
  g.globalCompositeOperation = 'source-over';
  return { canvas: c, scale: s };
}

export class HUD {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.radar = buildRadarBase();
    this.killfeed = [];
    this.messages = [];
    this.bigMsg = null;
    this.hitmarkT = 0;
    this.hitmarkKill = false;
    this.hitmarkHS = false;
    this.damage = [];
    this.centerHint = '';
    this.w = 1280; this.h = 720;
  }

  resize(w, h) {
    this.w = w; this.h = h;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---------------------------------------------------------- notifications
  kill(victim, attacker, weaponId, headshot) {
    this.killfeed.push({
      a: attacker ? attacker.name : 'world',
      aTeam: attacker ? attacker.team : 0,
      v: victim.name, vTeam: victim.team,
      w: weaponId || 'world', hs: headshot, t: this.game.now,
    });
    if (this.killfeed.length > 6) this.killfeed.shift();
  }

  log(text) {
    this.messages.push({ text, t: this.game.now });
    if (this.messages.length > 5) this.messages.shift();
  }

  bigMessage(text, dur = 2.5, sub = '') {
    this.bigMsg = { text, sub, until: this.game.now + dur };
  }

  hitmark(hs, kill) {
    this.hitmarkT = kill ? 0.42 : 0.22;
    this.hitmarkKill = kill;
    this.hitmarkHS = hs;
  }

  damageFrom(dir, amount) {
    const yaw = Math.atan2(-dir.y, -dir.x);
    this.damage.push({ yaw, t: this.game.now, amount });
    if (this.damage.length > 8) this.damage.shift();
  }

  clearRound() { this.damage.length = 0; }

  // Touch screens: the thumbs own the bottom corners (move stick bottom-left, fire
  // buttons bottom-right, pause/score/buy top-right), so health moves to the bottom
  // centre, ammo under the top-right buttons and the killfeed under the radar.
  get touch() { return !!this.game.touchUI; }

  /**
   * where things go this frame. Desktop values are the original layout; safe-area
   * insets (notch / home bar, game.safe from ui/touch.js) are 0 there.
   */
  layout() {
    const W = this.w, H = this.h, touch = this.touch, tall = touch && W < H;
    const L = this._layout || (this._layout = {});
    const sf = this.game.safe;
    const st = sf ? sf.t : 0, sr = sf ? sf.r : 0, sb = sf ? sf.b : 0, sl = sf ? sf.l : 0;
    const radarTop = (tall ? 64 : 18) + st;                    // upright phone: below the score bar
    const radar = Math.round(Math.min(H * 0.26, 230, touch ? W * (tall ? 0.28 : 0.3) : Infinity));
    L.st = st; L.sl = sl; L.sr = sr;
    L.radarTop = radarTop;
    L.radar = radar;
    // touch: inventory strip left-aligned under the radar, killfeed below it
    L.stripY = touch ? radarTop + radar + (tall ? 54 : 16) : 0;
    L.feedTop = !touch ? 60 + st : L.stripY + 26;
    L.hpY = (touch && tall ? H - 276 : H - 26) - sb;          // tall: above the fire buttons
    L.hpShift = touch ? Math.round(W / 2 - 125) - 22 : sl;     // touch: bottom centre
    L.ammoY = !touch ? H - 26 - sb : (tall ? 168 : 112) + st;  // touch: under the top-right buttons
    L.bombY = (tall ? radarTop + radar + 14 - st : 84) + st;
    L.buyY = (tall ? radarTop + radar + 34 - st : 104) + st;
    L.deadY = (tall ? H - 356 : H - 96) - sb;
    return L;
  }

  radarSize() { return this.layout().radar; }

  radarTop() { return this.layout().radarTop; }

  /** key names in on-screen hints: keyboard letters on desktop, button names on touch */
  keyText(s) {
    if (!this.touch || !s) return s;
    return s.replace('[E]', '[USE]').replace('PRESS B', 'TAP BUY').replace('[MOUSE1]', '[FIRE]');
  }

  // ---------------------------------------------------------- draw
  draw(dt) {
    const g = this.ctx;
    const W = this.w, H = this.h;
    g.clearRect(0, 0, W, H);
    const game = this.game;
    const pl = game.localPlayer;
    if (!pl) return;
    this.hitmarkT = Math.max(0, this.hitmarkT - dt);

    const view = game.viewTarget || pl;
    this.drawRadar(g, view);
    this.drawTopBar(g);
    this.drawKillfeed(g);
    this.drawPlayerState(g, view);
    this.drawObjective(g, view);
    this.drawDamage(g, view);
    if (view.alive) this.drawCrosshair(g, view);
    this.drawHitmark(g);
    this.drawMessages(g);
    this.drawBigMessage(g);
    if (!pl.alive) this.drawDeadOverlay(g);
  }

  // ------------------------------------------------------------- radar
  drawRadar(g, pl) {
    const size = this.radarSize();
    const x = 18 + this.layout().sl, y = this.radarTop();
    const cx = x + size / 2, cy = y + size / 2;
    const game = this.game;

    g.save();
    g.beginPath();
    g.rect(x, y, size, size);
    g.fillStyle = 'rgba(8,12,17,.62)';
    g.fill();
    g.strokeStyle = 'rgba(120,140,160,.35)';
    g.lineWidth = 1;
    g.stroke();
    g.clip();

    const zoom = size / (26 * CELL);           // show ~26 cells across
    g.translate(cx, cy);
    g.rotate(pl.yaw - Math.PI / 2);       // rotate the map so "forward" is up
    g.scale(zoom, zoom);
    g.translate(-pl.pos.x, pl.pos.y);          // radar y is inverted

    // map plate
    const rs = this.radar.scale;
    const mw = GRID_W * CELL, mh = GRID_H * CELL;
    g.globalAlpha = 0.85;
    g.imageSmoothingEnabled = false;
    g.drawImage(this.radar.canvas, 0, 0, GRID_W * rs, GRID_H * rs, -mw / 2, -mh / 2, mw, mh);
    g.globalAlpha = 1;

    // bombsites
    g.font = `bold ${340}px ${FONT}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const s of SITES) {
      g.fillStyle = 'rgba(230,180,90,.30)';
      g.fillRect(s.min.x, -s.max.y, s.max.x - s.min.x, s.max.y - s.min.y);
      g.save();
      g.translate((s.min.x + s.max.x) / 2, -(s.min.y + s.max.y) / 2);
      g.rotate(-(pl.yaw - Math.PI / 2));   // keep the letter upright
      g.fillStyle = 'rgba(255,215,140,.75)';
      g.fillText(s.name, 0, 0);
      g.restore();
    }

    const dot = (px, py, r, fill, stroke) => {
      g.beginPath();
      g.arc(px, -py, r, 0, 7);
      g.fillStyle = fill; g.fill();
      if (stroke) { g.lineWidth = 14; g.strokeStyle = stroke; g.stroke(); }
    };

    // bomb
    const bomb = game.bomb;
    if (bomb.state === 'planted' || bomb.state === 'dropped') {
      const blink = bomb.state === 'planted' ? (Math.sin(game.now * 12) > 0 ? 1 : 0.25) : 0.9;
      g.globalAlpha = blink;
      dot(bomb.pos.x, bomb.pos.y, 46, '#ff4030', 'rgba(0,0,0,.7)');
      g.globalAlpha = 1;
    } else if (bomb.state === 'carried' && bomb.carrier && bomb.carrier.team === pl.team) {
      dot(bomb.carrier.pos.x, bomb.carrier.pos.y, 34, 'rgba(255,90,60,.85)');
    }

    // players
    for (const p of game.players) {
      if (!p.alive) continue;
      const mate = p.team === pl.team;
      const spotted = game.spotted.has(p.id);
      if (!mate && !spotted) continue;
      const col = mate ? (p === pl ? '#ffffff' : '#5ad06a') : '#ff5a3c';
      // facing wedge
      g.save();
      g.translate(p.pos.x, -p.pos.y);
      g.rotate(-p.yaw);
      g.beginPath();
      g.moveTo(0, 0); g.arc(0, 0, 150, -0.42, 0.42);
      g.closePath();
      g.fillStyle = mate ? 'rgba(90,208,106,.16)' : 'rgba(255,90,60,.20)';
      g.fill();
      g.restore();
      dot(p.pos.x, p.pos.y, p === pl ? 52 : 44, col, 'rgba(0,0,0,.65)');
    }
    g.restore();

    // frame + name
    g.font = `${this.touch ? 12 : 11}px ${FONT}`;           // touch screens: 12px minimum
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillStyle = 'rgba(200,215,228,.55)';
    g.fillText('de_sandstorm', x + 6, y + size - 7);
  }

  // ------------------------------------------------------------- top bar
  drawTopBar(g) {
    const st = this.layout().st;                            // notch / status bar (0 on desktop)
    if (st) { g.save(); g.translate(0, st); }
    this._drawTopBar(g);
    if (st) g.restore();
  }

  _drawTopBar(g) {
    const game = this.game, m = game.match;
    const W = this.w;
    const cx = W / 2;
    const h = 44;
    g.fillStyle = 'rgba(8,12,17,.72)';
    g.fillRect(cx - 150, 0, 300, h);
    g.strokeStyle = 'rgba(120,140,160,.25)';
    g.strokeRect(cx - 150, 0, 300, h);

    let time = m.timer;
    let col = '#e6edf3';
    if (game.bomb.state === 'planted') { time = game.bomb.timer; col = '#ff5a3c'; }
    else if (m.state === 'over') col = '#f0a020';
    g.font = `bold 24px ${FONT}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = col;
    g.fillText(fmtTime(Math.max(0, time)), cx, h / 2 + 1);

    const ctScore = m.score[C.TEAM.CT], tScore = m.score[C.TEAM.T];
    g.font = `bold 27px ${FONT}`;
    g.fillStyle = C.TEAM_COLOR[C.TEAM.CT];
    g.fillText(String(ctScore), cx - 96, h / 2 + 1);
    g.fillStyle = C.TEAM_COLOR[C.TEAM.T];
    g.fillText(String(tScore), cx + 96, h / 2 + 1);

    // alive counts
    const alive = (t) => game.players.filter((p) => p.team === t && p.alive).length;
    g.font = `12px ${FONT}`;
    g.fillStyle = 'rgba(200,215,228,.6)';
    g.fillText(`${alive(C.TEAM.CT)} ALIVE`, cx - 96, h + 12);
    g.fillText(`${alive(C.TEAM.T)} ALIVE`, cx + 96, h + 12);
    g.fillStyle = 'rgba(200,215,228,.4)';
    g.font = `${this.touch ? 12 : 11}px ${FONT}`;           // touch screens: 12px minimum
    g.fillText(`ROUND ${m.round} / MR${m.maxRounds}`, cx, h + 12);
  }

  // ------------------------------------------------------------- killfeed
  drawKillfeed(g) {
    const W = this.w;
    const now = this.game.now;
    const touch = this.touch;
    // desktop: top-right, right-aligned; touch: under the radar, left-aligned, at most 4 rows
    let y = this.layout().feedTop;
    let rows = 0;
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (let i = this.killfeed.length - 1; i >= 0; i--) {
      const k = this.killfeed[i];
      const age = now - k.t;
      if (age > 7) continue;
      if (touch && ++rows > 4) break;
      const a = clamp((7 - age) / 1.2, 0, 1);
      g.globalAlpha = a;
      g.font = `14px ${FONT}`;
      const wname = this.weaponLabel(k.w);
      const txt = `${k.a}   ${wname}${k.hs ? ' ⌖' : ''}   ${k.v}`;
      const tw = g.measureText(txt).width;
      const L = this.layout();
      const right = touch ? 18 + L.sl + tw + 12 : W - 18 - L.sr;   // right edge of the row's box
      g.fillStyle = 'rgba(8,12,17,.6)';
      g.fillRect(right - tw - 12, y - 11, tw + 12, 22);
      // colour the two names
      const vw = g.measureText(k.v).width;
      const mid = `   ${wname}${k.hs ? ' ⌖' : ''}   `;
      const mw = g.measureText(mid).width;
      g.textAlign = 'right';
      g.fillStyle = C.TEAM_COLOR[k.vTeam] || '#ccc';
      g.fillText(k.v, right - 6, y);
      g.fillStyle = 'rgba(220,230,240,.85)';
      g.fillText(mid, right - 6 - vw, y);
      g.fillStyle = C.TEAM_COLOR[k.aTeam] || '#ccc';
      g.fillText(k.a, right - 6 - vw - mw, y);
      y += 26;
      g.globalAlpha = 1;
    }
  }

  weaponLabel(id) {
    if (!id) return 'bomb';
    if (id === 'world') return 'died';
    if (id === 'fall') return 'fell';
    if (id === 'he') return 'HE';
    if (id === 'knife') return 'knife';
    const w = this.game.weaponOf(id);
    return w ? w.name : id;
  }

  // ------------------------------------------------------------- player state
  drawPlayerState(g, pl) {
    const H = this.h, W = this.w;
    const touch = this.touch;
    // desktop: health bottom-left, ammo bottom-right. Touch (see layout): health
    // bottom-centre (above the fire buttons on an upright phone), ammo top-right.
    const L = this.layout();
    const y = L.hpY;                                             // health baseline
    const hx = L.hpShift;                                        // health x shift
    const ay = L.ammoY;                                          // ammo baseline
    g.textBaseline = 'alphabetic';

    // health / armour
    g.textAlign = 'left';
    g.font = `bold 38px ${FONT}`;
    const hpCol = pl.health > 50 ? '#e6edf3' : pl.health > 20 ? '#ffb03a' : '#ff4a3a';
    g.fillStyle = 'rgba(0,0,0,.45)';
    g.fillRect(hx + 22, y - 44, 250, 56);
    g.fillStyle = hpCol;
    g.fillText(String(Math.max(0, Math.ceil(pl.health))), hx + 34, y);
    g.font = `12px ${FONT}`;
    g.fillStyle = 'rgba(200,215,228,.55)';
    g.fillText('HP', hx + 34, y - 32);

    g.font = `bold 30px ${FONT}`;
    g.fillStyle = pl.armor > 0 ? '#6fa8dc' : 'rgba(140,155,170,.35)';
    g.fillText(String(Math.max(0, Math.round(pl.armor))), hx + 130, y - 2);
    g.font = `12px ${FONT}`;
    g.fillStyle = 'rgba(200,215,228,.55)';
    g.fillText(pl.helmet ? 'ARMOR+HELM' : 'ARMOR', hx + 130, y - 32);

    // money
    g.font = `bold 20px ${FONT}`;
    g.fillStyle = '#7dd87d';
    g.fillText(`$${pl.money}`, hx + 34, y - 56);

    // ammo (RW: right edge inside the safe area — the full width on desktop)
    const RW = W - L.sr;
    const w = currentWeapon(pl);
    const am = ammoOf(pl, w.id);
    g.textAlign = 'right';
    g.fillStyle = 'rgba(0,0,0,.45)';
    g.fillRect(RW - 260, ay - 44, 238, 56);
    if (w.mag > 0) {
      g.font = `bold 38px ${FONT}`;
      g.fillStyle = am.mag === 0 ? '#ff4a3a' : am.mag <= w.mag * 0.25 ? '#ffb03a' : '#e6edf3';
      g.fillText(String(am.mag), RW - 92, ay);
      g.font = `20px ${FONT}`;
      g.fillStyle = 'rgba(200,215,228,.55)';
      g.fillText(`/ ${am.reserve}`, RW - 34, ay);
    } else {
      g.font = `bold 24px ${FONT}`;
      g.fillStyle = 'rgba(200,215,228,.7)';
      g.fillText('—', RW - 34, ay);
    }
    g.font = `13px ${FONT}`;
    g.fillStyle = 'rgba(200,215,228,.75)';
    g.fillText(w.name.toUpperCase(), RW - 34, ay - 32);

    // inventory strip
    let ix = RW - 34;
    g.font = `12px ${FONT}`;
    const items = [];
    if (pl.inv.primary) items.push(this.game.weaponOf(pl.inv.primary).name);
    if (pl.inv.secondary) items.push(this.game.weaponOf(pl.inv.secondary).name);
    for (const n of ['he', 'flash', 'smoke']) {
      const c = nadeCount(pl, n);
      if (c > 0) items.push(`${this.game.weaponOf(n).name}${c > 1 ? ' x' + c : ''}`);
    }
    if (pl.inv.c4) items.push('C4');
    if (pl.hasKit) items.push('KIT');
    g.fillStyle = 'rgba(200,215,228,.45)';
    if (touch) {
      // touch: left column under the radar (the buttons own the right side)
      g.textAlign = 'left';
      g.fillText(items.join('  ·  '), 18 + L.sl, L.stripY);
      g.textAlign = 'right';
    } else {
      g.fillText(items.join('  ·  '), ix, ay - 52);
    }
    ix = 0;

    if (pl.st.reloading) {
      g.textAlign = 'center';
      g.font = `15px ${FONT}`;
      g.fillStyle = '#f0a020';
      g.fillText('RELOADING', W / 2, H * 0.62);
    }
  }

  // ------------------------------------------------------------- objective
  drawObjective(g, pl) {
    const game = this.game, W = this.w, H = this.h;
    g.textAlign = 'center';

    const bar = (label, frac, col) => {
      const bw = 260, bh = 10, bx = W / 2 - bw / 2, by = H * 0.68;
      g.fillStyle = 'rgba(0,0,0,.55)';
      g.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
      g.fillStyle = col;
      g.fillRect(bx, by, bw * clamp(frac, 0, 1), bh);
      g.font = `14px ${FONT}`;
      g.fillStyle = '#e6edf3';
      g.fillText(label, W / 2, by - 8);
    };

    if (pl.planting) bar('PLANTING THE BOMB', pl.plantProgress, '#f0a020');
    else if (pl.defusing) bar(pl.hasKit ? 'DEFUSING (KIT)' : 'DEFUSING', pl.defuseProgress, '#4bb3ff');
    else if (this.centerHint) {
      g.font = `14px ${FONT}`;
      g.fillStyle = 'rgba(230,237,243,.8)';
      g.fillText(this.keyText(this.centerHint), W / 2, H * 0.66);
    }

    if (game.bomb.state === 'planted') {
      g.font = `bold 16px ${FONT}`;
      g.fillStyle = Math.sin(game.now * 8) > 0 ? '#ff5a3c' : 'rgba(255,90,60,.5)';
      g.fillText('BOMB PLANTED', W / 2, this.layout().bombY);
    }
    if (game.match.canBuy && pl.alive) {
      g.font = `12px ${FONT}`;
      g.fillStyle = 'rgba(230,237,243,.6)';
      g.fillText(this.keyText(`BUY TIME  ${Math.ceil(game.match.buyTimer)}s   ·   PRESS B`), W / 2, this.layout().buyY);
    }
  }

  // ------------------------------------------------------------- feedback
  drawDamage(g, pl) {
    const now = this.game.now;
    const cx = this.w / 2, cy = this.h / 2;
    for (const d of this.damage) {
      const age = now - d.t;
      if (age > 1.5) continue;
      const a = (1 - age / 1.5) * 0.85;
      const rel = normAngle(d.yaw - pl.yaw);
      g.save();
      g.translate(cx, cy);
      g.rotate(-rel + Math.PI / 2);
      g.beginPath();
      const r = 92;
      g.arc(0, 0, r, -0.34 - Math.PI / 2, 0.34 - Math.PI / 2);
      g.lineWidth = 5 + clamp(d.amount / 12, 0, 6);
      g.strokeStyle = `rgba(220,40,30,${a})`;
      g.stroke();
      g.restore();
    }
  }

  drawCrosshair(g, pl) {
    const cx = Math.round(this.w / 2), cy = Math.round(this.h / 2);
    if (pl.st.scopeLevel > 0) return;
    const w = currentWeapon(pl);
    let gap = settings.chGap + 3;
    if (settings.chDynamic) {
      const cone = inaccuracy(w, pl, pl.st);
      gap += clamp(cone * 5.2, 0, 44);
    }
    const len = settings.chSize;
    const th = settings.chThick;
    g.strokeStyle = 'rgba(0,0,0,.75)';
    g.lineWidth = th + 2;
    this._chLines(g, cx, cy, gap, len);
    g.strokeStyle = settings.chColor;
    g.lineWidth = th;
    this._chLines(g, cx, cy, gap, len);
    if (settings.chDot) {
      g.fillStyle = settings.chColor;
      g.fillRect(cx - th / 2, cy - th / 2, th, th);
    }
  }

  _chLines(g, cx, cy, gap, len) {
    if (len <= 0) return;
    g.beginPath();
    g.moveTo(cx - gap - len, cy + 0.5); g.lineTo(cx - gap, cy + 0.5);
    g.moveTo(cx + gap, cy + 0.5); g.lineTo(cx + gap + len, cy + 0.5);
    g.moveTo(cx + 0.5, cy - gap - len); g.lineTo(cx + 0.5, cy - gap);
    g.moveTo(cx + 0.5, cy + gap); g.lineTo(cx + 0.5, cy + gap + len);
    g.stroke();
  }

  drawHitmark(g) {
    if (this.hitmarkT <= 0) return;
    const cx = this.w / 2, cy = this.h / 2;
    const a = clamp(this.hitmarkT / 0.22, 0, 1);
    const r0 = 5, r1 = 11 + (1 - a) * 4;
    g.strokeStyle = this.hitmarkKill ? `rgba(255,70,50,${a})`
      : this.hitmarkHS ? `rgba(255,215,80,${a})` : `rgba(255,255,255,${a})`;
    g.lineWidth = 2;
    g.beginPath();
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      g.moveTo(cx + sx * r0, cy + sy * r0);
      g.lineTo(cx + sx * r1, cy + sy * r1);
    }
    g.stroke();
  }

  drawMessages(g) {
    const now = this.game.now;
    let y = this.h * 0.30;
    g.textAlign = 'center';
    g.font = `14px ${FONT}`;
    for (const m of this.messages) {
      const age = now - m.t;
      if (age > 5) continue;
      g.fillStyle = `rgba(230,237,243,${clamp((5 - age) / 1.2, 0, 0.85)})`;
      g.fillText(m.text, this.w / 2, y);
      y += 20;
    }
  }

  drawBigMessage(g) {
    if (!this.bigMsg || this.game.now > this.bigMsg.until) return;
    g.textAlign = 'center';
    g.font = `bold 42px ${FONT}`;
    g.fillStyle = 'rgba(0,0,0,.5)';
    g.fillText(this.bigMsg.text, this.w / 2 + 2, this.h * 0.24 + 2);
    g.fillStyle = '#f0a020';
    g.fillText(this.bigMsg.text, this.w / 2, this.h * 0.24);
    if (this.bigMsg.sub) {
      g.font = `16px ${FONT}`;
      g.fillStyle = 'rgba(230,237,243,.8)';
      g.fillText(this.bigMsg.sub, this.w / 2, this.h * 0.24 + 30);
    }
  }

  drawDeadOverlay(g) {
    const game = this.game;
    g.textAlign = 'center';
    g.font = `13px ${FONT}`;
    g.fillStyle = 'rgba(230,237,243,.75)';
    const t = game.viewTarget && game.viewTarget !== game.localPlayer
      ? `SPECTATING  ${game.viewTarget.name}   ·   [MOUSE1] next player`
      : 'YOU ARE DEAD';
    g.fillText(this.keyText(t), this.w / 2, this.layout().deadY);
  }
}
