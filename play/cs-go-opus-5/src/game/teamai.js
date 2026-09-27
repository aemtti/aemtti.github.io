// teamai.js — round setup, and nothing else.
//
// Everything here happens ONCE, when the round starts: which site the T side
// attacks, who plays which role, which position each defender holds, and when
// each bot leaves spawn. After that this object is never consulted again for
// decisions, and it holds no live state at all.
//
// There is deliberately no shared vision, no callouts, no dynamic rotation
// orders and no position reservations. Those were tried and they are what made
// the bots wander: every one of them is a signal that changes several times a
// second, and anything that changes several times a second will keep cancelling
// whatever a bot had decided to do.
import * as C from './constants.js';
import { SITES } from '../world/brushes.js';
import { pickHoldSpot } from '../world/nav.js';

export const ROUTES_T = {
  rushA: ['T Spawn', 'Long Doors', 'A Long', 'A Site'],
  shortA: ['T Spawn', 'T Mid', 'Mid', 'Catwalk', 'A Short', 'A Site'],
  rushB: ['T Spawn', 'Outside Tunnels', 'Upper Tunnels', 'Lower Tunnels', 'B Site'],
  midB: ['T Spawn', 'T Mid', 'Mid', 'Lower Tunnels', 'B Site'],
};
export const PLAN_SITE = { rushA: 'A', shortA: 'A', rushB: 'B', midB: 'B' };
/** the lurker walks a different corridor to the same site */
export const LURK_ROUTE = { rushA: 'shortA', shortA: 'rushA', rushB: 'midB', midB: 'rushB' };

export const CT_HOLDS = [
  { name: 'A Site', site: 'A', spot: { x: 1600, y: 1900 }, watch: { x: 1900, y: 1100 } },
  { name: 'B Site', site: 'B', spot: { x: -1900, y: 1900 }, watch: { x: -1750, y: 1200 } },
  { name: 'A Long', site: 'A', spot: { x: 2050, y: 1000 }, watch: { x: 2100, y: -600 } },
  { name: 'Lower Tunnels', site: 'B', spot: { x: -1650, y: 1250 }, watch: { x: -1700, y: 300 } },
  { name: 'Mid', site: null, spot: { x: 0, y: 900 }, watch: { x: 0, y: -800 } },
];

export class TeamAI {
  constructor(game) {
    this.game = game;
    this.plan = 'rushA';
    this.targetSite = 'A';
  }

  planRound() {
    const rnd = this.game.aiRng || Math.random;
    const r = rnd();
    this.plan = r < 0.30 ? 'rushA' : r < 0.56 ? 'rushB' : r < 0.80 ? 'shortA' : 'midB';
    this.targetSite = PLAN_SITE[this.plan];
    this.assignT();
    this.assignCT();
  }

  assignT() {
    const carrier = this.game.bomb.carrier;
    const mates = this.game.players.filter((p) => p.team === C.TEAM.T && p.bot);
    // the carrier is never an entry — he has to live long enough to plant
    const pool = mates.slice().sort((a, b) => {
      if (a === carrier) return 1;
      if (b === carrier) return -1;
      return b.money - a.money;
    });
    let entries = 0, lurkers = 0, awpers = 0;
    pool.forEach((p, i) => {
      const b = p.bot;
      if (!b) return;
      if (awpers < 1 && p.money >= 5000 && b.rng() < 0.5) { b.role = 'awper'; awpers++; }
      else if (entries < 2) { b.role = 'entry'; entries++; }
      else if (lurkers < 1 && b.rng() < 0.7) { b.role = 'lurker'; lurkers++; }
      else b.role = 'support';
      b.route = ROUTES_T[b.role === 'lurker' ? LURK_ROUTE[this.plan] : this.plan];
      // leave a beat apart so five bodies do not hit the same doorway at once
      b.startAt = this.game.now + C.FREEZE_TIME + i * 0.55 +
        (b.role === 'entry' ? 0 : b.role === 'support' ? 0.8 : 1.4);
      b.postSpread = i;
    });
  }

  assignCT() {
    const mates = this.game.players.filter((p) => p.team === C.TEAM.CT && p.bot);
    let awpers = 0;
    mates.forEach((p, i) => {
      const b = p.bot;
      b.hold = CT_HOLDS[i % CT_HOLDS.length];
      if (i < 2) b.role = 'anchor';
      else if (awpers < 1 && p.money >= 5000 && b.rng() < 0.5) { b.role = 'awper'; awpers++; }
      else b.role = 'rotator';
      b.startAt = this.game.now + C.FREEZE_TIME + i * 0.55;
      b.postSpread = i;
      // resolve the assignment into a concrete stand-here spot, once
      const nav = this.game.world.nav;
      const cover = pickHoldSpot(nav, this.game.world, b.hold.spot, b.hold.watch);
      const base = cover || b.hold.spot;
      const a = (i * 2.399963) % (Math.PI * 2);
      b.post = { x: base.x + Math.cos(a) * 55, y: base.y + Math.sin(a) * 55 };
      b.watch = b.hold.watch;
    });
  }

  siteObj(name) {
    return SITES.find((s) => s.name === (name || this.targetSite)) || SITES[0];
  }
}
