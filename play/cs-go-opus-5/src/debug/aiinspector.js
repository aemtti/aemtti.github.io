// aiinspector.js ? live, non-invasive observability for match bots.
//
// F8 toggles the overlay and F7 selects the next bot. The inspector never
// changes simulation state: it samples decisions already made by the bots and
// draws their path, goal, state and recent transition log onto the HUD.
import * as THREE from 'three';
import * as C from '../game/constants.js';
import { toThree } from '../render/scene.js';

const FONT = "'Cascadia Mono','Consolas','SF Mono',monospace";
const MAX_EVENTS = 90;

function shortPos(p) {
  return p ? `${Math.round(p.x)},${Math.round(p.y)}` : '-';
}

export class AIInspector {
  constructor(game) {
    this.game = game;
    this.enabled = false;
    this.selectedId = 0;
    this.events = [];
    this.seq = 0;
    this._v = new THREE.Vector3();
  }

  resetRound() {
    this.events.length = 0;
    this.seq = 0;
    const bot = this.selectedBot();
    if (!bot || !bot.pl.alive) this.selectFirstAlive();
  }

  record(bot, type, detail = '') {
    if (!bot || !bot.pl) return;
    const last = this.events[this.events.length - 1];
    const signature = `${bot.pl.id}:${type}:${detail}`;
    if (last && last.signature === signature && this.game.now - last.time < 0.75) {
      last.count++;
      last.time = this.game.now;
      return;
    }
    this.events.push({
      seq: ++this.seq,
      time: this.game.now,
      botId: bot.pl.id,
      name: bot.pl.name,
      type,
      detail: String(detail || ''),
      signature,
      count: 1,
    });
    if (this.events.length > MAX_EVENTS) this.events.shift();
  }

  bots() {
    return this.game.players.filter((p) => p.bot).map((p) => p.bot);
  }

  selectedBot() {
    return this.bots().find((b) => b.pl.id === this.selectedId) || null;
  }

  selectFirstAlive() {
    const all = this.bots();
    const bot = all.find((b) => b.pl.alive) || all[0] || null;
    this.selectedId = bot ? bot.pl.id : 0;
    return bot;
  }

  cycle(direction = 1) {
    const all = this.bots();
    if (!all.length) return null;
    let i = all.findIndex((b) => b.pl.id === this.selectedId);
    if (i < 0) i = 0;
    else i = (i + direction + all.length) % all.length;
    this.selectedId = all[i].pl.id;
    return all[i];
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled && !this.selectedBot()) this.selectFirstAlive();
    return this.enabled;
  }

  project(pos) {
    const camera = this.game.scene && this.game.scene.camera;
    if (!camera || !pos) return null;
    toThree(pos, this._v);
    this._v.project(camera);
    if (this._v.z < -1 || this._v.z > 1) return null;
    return {
      x: (this._v.x * 0.5 + 0.5) * this.game.hud.w,
      y: (-this._v.y * 0.5 + 0.5) * this.game.hud.h,
    };
  }

  drawWorld(g, bot) {
    const nav = this.game.world && this.game.world.nav;
    if (!nav || !bot) return;
    const points = [{ x: bot.pl.pos.x, y: bot.pl.pos.y, z: bot.pl.pos.z + 6 }];
    if (bot.path) {
      for (let i = bot.pathIdx; i < bot.path.length; i++) {
        const n = nav.nodes[bot.path[i]];
        if (n) points.push({ x: n.x, y: n.y, z: n.z + 6 });
      }
    }
    if (bot.goal) points.push({ x: bot.goal.x, y: bot.goal.y, z: (bot.goal.z || bot.pl.pos.z) + 6 });

    g.save();
    g.lineWidth = 2;
    g.strokeStyle = bot.pl.team === C.TEAM.CT ? '#65b4ff' : '#ffc15a';
    g.fillStyle = g.strokeStyle;
    g.globalAlpha = 0.9;
    let started = false;
    g.beginPath();
    for (const point of points) {
      const p = this.project(point);
      if (!p) { started = false; continue; }
      if (!started) { g.moveTo(p.x, p.y); started = true; }
      else g.lineTo(p.x, p.y);
    }
    g.stroke();

    if (bot.goal) {
      const p = this.project({
        x: bot.goal.x, y: bot.goal.y,
        z: (bot.goal.z || bot.pl.pos.z) + 10,
      });
      if (p) {
        g.beginPath();
        g.arc(p.x, p.y, 7, 0, Math.PI * 2);
        g.stroke();
      }
    }
    g.restore();
  }

  drawLabels(g) {
    g.save();
    g.font = `11px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'bottom';
    for (const bot of this.bots()) {
      if (!bot.pl.alive) continue;
      const p = this.project({
        x: bot.pl.pos.x, y: bot.pl.pos.y, z: bot.pl.pos.z + bot.pl.height + 18,
      });
      if (!p) continue;
      const selected = bot.pl.id === this.selectedId;
      const label = `${bot.pl.name} ? ${bot.state}/${bot.goalName}`;
      const w = g.measureText(label).width + 10;
      g.fillStyle = selected ? 'rgba(5,10,15,.92)' : 'rgba(5,10,15,.68)';
      g.fillRect(p.x - w / 2, p.y - 16, w, 16);
      g.fillStyle = bot.pl.team === C.TEAM.CT ? '#8ac8ff' : '#ffd17c';
      g.fillText(label, p.x, p.y - 2);
    }
    g.restore();
  }

  drawPanel(g, bot) {
    const x = Math.max(12, this.game.hud.w - 390);
    const y = 96;
    const w = 374;
    const d = bot ? bot.diagnostics() : null;
    const lines = [
      `AI INSPECTOR  seed ${this.game.aiSeed}  [F7 next ? F8 close]`,
      d ? `${d.name}  ${d.team}  ${d.role}  hp ${d.health}` : 'no bot selected',
      d ? `state ${d.state}  task ${d.task}  reason ${d.decision}` : '',
      d ? `goal ${shortPos(d.goal)}  path ${d.path}  node ${d.pathIndex}` : '',
      d ? `move ${d.movement}  stuck ${d.stuck.toFixed(2)}s  failures ${d.navFailures}` : '',
      d ? `enemy ${d.enemy}  confidence ${d.confidence.toFixed(2)}  phase ${d.combat}` : '',
    ].filter(Boolean);

    const recent = this.events
      .filter((e) => !bot || e.botId === bot.pl.id)
      .slice(-7)
      .map((e) => {
        const count = e.count > 1 ? ` ?${e.count}` : '';
        return `${e.time.toFixed(1).padStart(6)}  ${e.type.padEnd(9)} ${e.detail}${count}`;
      });
    lines.push('? recent decisions ?', ...recent);

    const h = 18 + lines.length * 16;
    g.save();
    g.fillStyle = 'rgba(5,9,13,.88)';
    g.fillRect(x, y, w, h);
    g.strokeStyle = 'rgba(72,214,255,.58)';
    g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    g.font = `11px ${FONT}`;
    g.textAlign = 'left';
    g.textBaseline = 'top';
    for (let i = 0; i < lines.length; i++) {
      g.fillStyle = i === 0 ? '#55ddff' : i < 6 ? '#d8e8f2' : '#9fb1bd';
      g.fillText(lines[i], x + 10, y + 9 + i * 16);
    }
    g.restore();
  }

  draw() {
    if (!this.enabled || this.game.mode !== 'match' || !this.game.hud) return;
    const g = this.game.hud.ctx;
    const bot = this.selectedBot() || this.selectFirstAlive();
    this.drawWorld(g, bot);
    this.drawLabels(g);
    this.drawPanel(g, bot);
  }
}
