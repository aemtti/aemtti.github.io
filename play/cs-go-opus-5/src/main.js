// main.js — boot, the game object every system talks to, input, and the frame loop.
import * as C from './game/constants.js';
import { settings, saveSettings } from './core/settings.js';
import {
  Input, initInput, takeLook, endFrame, requestLock, exitLock, down, hit, moveAxes,
} from './core/input.js';
import * as A from './core/audio.js';
import { clamp, normAngle, DEG, rng, damp, forwardVec, angleVectors, makeRng } from './core/math.js';
import { buildMap } from './world/mapbuild.js';
import { traceClear } from './world/nav.js';
import { BUY_ZONES } from './world/brushes.js';
import { createScene } from './render/scene.js';
import { FX } from './render/fx.js';
import { createPlayerModel } from './render/playermodel.js';
import { ViewModel, VM_KIND } from './render/viewmodel.js';
import {
  createPlayer, currentWeapon, switchTo, slotWeapon, nextNade, bestWeapon,
  removeNade, nadeCount,
} from './game/player.js';
import { pmove, eyePos } from './game/physics.js';
import { fireWeapon, startReload, updateWeaponState, applyDamage, killPlayer } from './game/combat.js';
import { WEAPONS, SLOT } from './game/weapons.js';
import { Match } from './game/match.js';
import { Bomb } from './game/bomb.js';
import { GrenadeSystem } from './game/grenades.js';
import { Bot } from './game/bots.js';
import { TeamAI } from './game/teamai.js';
import { HUD } from './ui/hud.js';
import { BuyMenu, renderScoreboard, wireSettings, wireSegment } from './ui/menus.js';
import { DebugMode, DEBUG_HELP } from './debug/debug.js';
import { AIInspector } from './debug/aiinspector.js';
import { TouchUI } from './ui/touch.js';

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------- game state
const game = {
  now: 0,
  mode: 'menu',                 // menu | match | debug
  running: false,
  paused: false,
  players: [],
  localPlayer: null,
  viewTarget: null,
  spotted: new Set(),
  teamAI: null,
  friendlyFire: false,
  settings,
  shake: 0,
  world: null, scene: null, fx: null, hud: null, buy: null,
  match: null, bomb: null, nades: null, vm: null,
  weaponOf: (id) => WEAPONS[id] || null,
  aiSeed: 1337,
  aiRng: makeRng(1337),
  aiInspector: null,
};
window.GAME = game;

game.resetAIRandom = function (seed = 1337) {
  const n = Number(seed);
  game.aiSeed = Number.isFinite(n) ? (n >>> 0) : 1337;
  game.aiRng = makeRng(game.aiSeed || 1);
  return game.aiSeed;
};

// ---------------------------------------------------------------- callbacks
game.noise = function (source, radius, kind, pos) {
  const p = pos || source.pos;
  for (const b of game.players) {
    if (!b.bot || b === source || !b.alive) continue;
    if (source && b.team === source.team && kind !== 'explosion') continue;
    b.bot.hearNoise(p, radius, kind);
  }
};

game.shakeView = function (amt) { game.shake = Math.min(9, game.shake + amt); };

game.shakeAt = function (pos, radius, amt) {
  const pl = game.viewTarget || game.localPlayer;
  if (!pl) return;
  const d = Math.hypot(pl.pos.x - pos.x, pl.pos.y - pos.y, pl.pos.z - pos.z);
  if (d > radius) return;
  game.shakeView(amt * (1 - d / radius));
};

game.switchToBest = function (pl) { switchTo(pl, bestWeapon(pl), game.now); };

game.canBuyNow = function () {
  const pl = game.localPlayer;
  if (!pl || !pl.alive || !game.match.canBuy) return false;
  const z = BUY_ZONES[pl.team === C.TEAM.T ? 'T' : 'CT'];
  return pl.pos.x >= z.min.x && pl.pos.x <= z.max.x && pl.pos.y >= z.min.y && pl.pos.y <= z.max.y;
};

game.onKill = function (victim, attacker, weaponId, headshot) {
  game.hud.kill(victim, attacker, weaponId, headshot);
  if (victim.inv.c4) game.bomb.dropAt(victim.pos);
  game.fx.bloodPool(victim.pos, victim.pos.z);
  if (victim === game.localPlayer) {
    game.hud.bigMessage('', 0);
    pickSpectateTarget();
  }
  if (attacker === game.localPlayer && attacker !== victim) {
    game.hud.log(`${headshot ? 'HEADSHOT — ' : ''}killed ${victim.name}` +
      (attacker.roundKills > 1 ? `  (${attacker.roundKills}k)` : ''));
  }
  game.match.checkWinConditions();
};

game.onRoundStart = function () {
  game.teamAI.planRound();               // must run before bots pick routes
  for (const p of game.players) {
    if (p.bot) { p.bot.onRoundStart(); p.bot.buy(); }
    if (!p.model) buildModel(p);
    p.model.group.visible = true;
  }
  if (game.aiInspector) game.aiInspector.resetRound();
  game.spotted.clear();
  game.hud.clearRound();
  game.hud.bigMessage(`ROUND ${game.match.round}`, 2.4,
    game.match.pistolRound ? 'PISTOL ROUND' : '');
  game.buy.toggle(false);
  if (game.localPlayer) game.viewTarget = game.localPlayer;
};

game.onFreezeEnd = function () {
  game.hud.log('Round started');
};

game.onRoundEnd = function (winner, reason, mvp) {
  const name = C.TEAM_NAME[winner];
  const why = {
    elim: 'eliminated the opposition', time: 'ran down the clock',
    bomb: 'detonated the bomb', defuse: 'defused the bomb',
  }[reason] || '';
  game.hud.bigMessage(`${name}S WIN`, C.ROUND_END_TIME - 0.5,
    `${why}${mvp ? '   ·   MVP: ' + mvp.name : ''}`);
  game.buy.toggle(false);
};

game.onBombPlanted = function (pl, site) {
  game.hud.bigMessage('BOMB PLANTED', 2.2, site ? `BOMBSITE ${site.name}` : '');
  game.hud.log(`${pl.name} planted the bomb at ${site ? site.name : '?'}`);
  A.SFX.planted();
  game.noise(pl, 3000, 'explosion');
};

game.onBombDefused = function (pl) {
  game.hud.log(`${pl.name} defused the bomb`);
  game.match.endRound(C.TEAM.CT, 'defuse');
};

game.onBombExploded = function () {
  game.match.endRound(C.TEAM.T, 'bomb');
};

game.onSideSwap = function () {
  for (const p of game.players) if (p.bot) p.bot.onSideSwap();
};

game.onMatchOver = function () {
  const m = game.match;
  const you = game.localPlayer;
  const won = m.score[you.team] > m.score[you.team === C.TEAM.T ? C.TEAM.CT : C.TEAM.T];
  $('end-title').textContent = won ? 'VICTORY' : 'DEFEAT';
  $('end-score').innerHTML =
    `<span style="color:${C.TEAM_COLOR[C.TEAM.CT]}">${m.score[C.TEAM.CT]}</span>` +
    ` <span style="color:#556">:</span> ` +
    `<span style="color:${C.TEAM_COLOR[C.TEAM.T]}">${m.score[C.TEAM.T]}</span>`;
  $('end-stats').innerHTML =
    `${you.name} — ${you.kills} kills · ${you.deaths} deaths · ${you.assists} assists<br>` +
    `${Math.round(you.damageDealt)} damage · ${you.mvps} MVP · ` +
    `${(you.kills / Math.max(1, you.deaths)).toFixed(2)} K/D`;
  $('endmatch').classList.remove('hidden');
  exitLock();
  game.paused = true;
};

game.rebuildModel = function (p) {
  if (p.model) { p.model.dispose(); p.model = null; }
  buildModel(p);
};

// ---------------------------------------------------------------- setup
let scene, world, vm, hudEl, canvas, debug;
let lookDx = 0, lookDy = 0;
let nadeCharging = 0, nadePower = 1;
let scoreboardOpen = false;
let spotTimer = 0;

function buildModel(p) {
  const m = createPlayerModel(p.team);
  scene.root.add(m.group);
  p.model = m;
}

function shuffled(source, random) {
  const out = source.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}

function createPlayers(localTeam, difficulty) {
  game.players.length = 0;
  const namesT = shuffled(C.BOT_NAMES_T, game.aiRng);
  const namesCT = shuffled(C.BOT_NAMES_CT, game.aiRng);
  const other = localTeam === C.TEAM.T ? C.TEAM.CT : C.TEAM.T;

  const me = createPlayer({ name: 'you', team: localTeam });
  game.players.push(me);
  game.localPlayer = me;
  game.viewTarget = me;

  for (let i = 0; i < C.TEAM_SIZE - 1; i++) {
    const p = createPlayer({
      name: (localTeam === C.TEAM.T ? namesT : namesCT)[i], team: localTeam, isBot: true,
    });
    new Bot(game, p, difficulty);
    game.players.push(p);
  }
  for (let i = 0; i < C.TEAM_SIZE; i++) {
    const p = createPlayer({
      name: (other === C.TEAM.T ? namesT : namesCT)[i + 4], team: other, isBot: true,
    });
    new Bot(game, p, difficulty);
    game.players.push(p);
  }
  for (const p of game.players) buildModel(p);
}

function pickSpectateTarget() {
  const me = game.localPlayer;
  const mates = game.players.filter((p) => p.team === me.team && p.alive);
  game.viewTarget = mates[0] || me;
}

function cycleSpectate() {
  const me = game.localPlayer;
  const mates = game.players.filter((p) => p.team === me.team && p.alive);
  if (!mates.length) { game.viewTarget = me; return; }
  const i = mates.indexOf(game.viewTarget);
  game.viewTarget = mates[(i + 1) % mates.length];
}

// ---------------------------------------------------------------- local input
function localThink(dt) {
  const pl = game.localPlayer;
  const cmd = { forward: 0, side: 0, jump: false, duck: false, walk: false, yaw: pl.yaw, speedCap: 250 };
  const look = takeLook();
  lookDx = look.yaw; lookDy = look.pitch;

  if (!pl.alive) {
    if (Input.mousePressed[0]) cycleSpectate();
    return cmd;
  }

  // ---- view
  let sensScale = 1;
  if (pl.st.scopeLevel > 0) {
    const w = currentWeapon(pl);
    sensScale = (w.scope[pl.st.scopeLevel - 1] / settings.fov) * 1.15;
  }
  // being flashed does not stop you aiming, but it hides the world
  pl.yaw = normAngle(pl.yaw + look.yaw * sensScale);
  pl.pitch = clamp(pl.pitch + look.pitch * sensScale, -89 * DEG, 89 * DEG);
  cmd.yaw = pl.yaw;

  if (game.match.frozen) return cmd;

  // ---- movement
  const ax = moveAxes();
  cmd.forward = ax.f; cmd.side = ax.s;
  cmd.jump = down('Space');
  // C only — Ctrl+W/A/S/D are browser shortcuts (Ctrl+W closes the tab) and
  // cannot be preventDefault()ed, so crouch-while-moving was unusable on Ctrl
  cmd.duck = down('KeyC');
  cmd.walk = down('ShiftLeft') || down('ShiftRight');
  cmd.speedCap = currentWeapon(pl).speed;

  // ---- weapon selection (digits belong to the shop while it is open)
  const shopping = game.buy.open;
  if (!shopping) {
    if (hit('Digit1')) switchTo(pl, slotWeapon(pl, SLOT.PRIMARY) || slotWeapon(pl, SLOT.SECONDARY), game.now);
    if (hit('Digit2')) switchTo(pl, slotWeapon(pl, SLOT.SECONDARY), game.now);
    if (hit('Digit3')) switchTo(pl, 'knife', game.now);
    if (hit('Digit4')) {
      if (currentWeapon(pl).cat === 'nade') nextNade(pl, game.now);
      else switchTo(pl, slotWeapon(pl, SLOT.NADE), game.now);
    }
    if (hit('Digit5') && pl.inv.c4) switchTo(pl, 'c4', game.now);
  }
  if (hit('KeyQ')) switchTo(pl, pl.lastWeapon, game.now);
  if (Input.wheel) {
    const order = [pl.inv.primary, pl.inv.secondary, 'knife', pl.inv.nades[0], pl.inv.c4 ? 'c4' : null]
      .filter(Boolean);
    const i = order.indexOf(pl.cur);
    switchTo(pl, order[(i + (Input.wheel > 0 ? 1 : order.length - 1)) % order.length], game.now);
  }
  if (hit('KeyG')) dropWeapon(pl);
  if (hit('KeyR')) startReload(game, pl);

  const w = currentWeapon(pl);

  // ---- scope
  if (Input.mousePressed[2]) {
    if (w.scope) {
      pl.st.scopeLevel = (pl.st.scopeLevel + 1) % (w.scope.length + 1);
      A.click(pl.pos, 1800, 0.03, 0.2, 6);
    } else if (w.cat === 'nade') {
      nadeCharging = 1; nadePower = 0.35;
    }
  }
  if (Input.mousePressed[0] && w.cat === 'nade') { nadeCharging = 1; nadePower = 1; }

  // ---- fire / throw
  if (w.cat === 'nade') {
    if (nadeCharging && !Input.mouse[0] && !Input.mouse[2]) {
      nadeCharging = 0;
      const id = w.id;
      game.nades.throwNade(pl, id, nadePower);
      removeNade(pl, id);
      pl.st.nextFire = game.now + 0.5;
      setTimeout(() => {
        if (!nadeCount(pl, id)) {
          if (pl.inv.nades.length) switchTo(pl, pl.inv.nades[0], game.now);
          else game.switchToBest(pl);
        }
      }, 400);
    }
  } else if (Input.mouse[0]) {
    if (game.now >= pl.st.deployEnd) fireWeapon(game, pl);
  } else {
    pl.st.triggerHeld = false;
  }

  // ---- plant / defuse
  const useHeld = down('KeyE');
  const bomb = game.bomb;
  if (bomb.state === 'carried' && bomb.carrier === pl) {
    if (bomb.canPlant(pl)) {
      const r = bomb.updatePlant(pl, useHeld, dt);
      if (r === 'planting') { cmd.forward = 0; cmd.side = 0; cmd.duck = true; }
    } else if (game.hud) {
      game.hud.centerHint = '';
    }
  } else if (bomb.state === 'planted' && pl.team === C.TEAM.CT) {
    if (bomb.canDefuse(pl)) {
      const r = bomb.updateDefuse(pl, useHeld, dt);
      if (r === 'defusing') { cmd.forward = 0; cmd.side = 0; cmd.duck = true; }
      game.hud.centerHint = useHeld ? '' : 'HOLD [E] TO DEFUSE';
    } else game.hud.centerHint = '';
  } else if (bomb.state === 'dropped' && pl.team === C.TEAM.T) {
    const d = Math.hypot(bomb.pos.x - pl.pos.x, bomb.pos.y - pl.pos.y);
    if (d < 90) {
      game.hud.centerHint = 'PRESS [E] TO PICK UP THE BOMB';
      if (useHeld) bomb.pickUp(pl);
    } else game.hud.centerHint = '';
  } else if (bomb.state === 'carried' && bomb.carrier === pl && !bomb.canPlant(pl)) {
    game.hud.centerHint = '';
  } else {
    game.hud.centerHint = '';
  }
  if (bomb.state === 'carried' && bomb.carrier === pl && bomb.siteAt(pl.pos.x, pl.pos.y) &&
      !pl.planting) {
    game.hud.centerHint = 'HOLD [E] TO PLANT';
  }

  return cmd;
}

function dropWeapon(pl) {
  if (pl.inv.c4 && pl.cur === 'c4') {
    game.bomb.dropAt(pl.pos);
    game.switchToBest(pl);
    game.hud.log('Dropped the bomb');
    return;
  }
  const w = currentWeapon(pl);
  if (w.slot === SLOT.PRIMARY && pl.inv.primary) {
    pl.inv.primary = null;
    game.switchToBest(pl);
  } else if (w.slot === SLOT.SECONDARY && pl.inv.secondary) {
    pl.inv.secondary = null;
    game.switchToBest(pl);
  }
}

// ---------------------------------------------------------------- simulation
function stepPlayer(p, dt) {
  const cmd = p.bot ? p.bot.think(dt) : localThink(dt);
  if (!p.alive) {
    // the dead skip updateWeaponState, so fade their blind here or dying while
    // flashed leaves the overlay stuck on for the whole spectate
    if (p.flashAmount > 0) p.flashAmount = Math.max(0, p.flashAmount - dt * p.flashDecay);
    return;
  }
  if (game.match.frozen) { cmd.forward = 0; cmd.side = 0; cmd.jump = false; }

  const before = { x: p.pos.x, y: p.pos.y, z: p.pos.z };
  const res = pmove(game.world, p, cmd, dt, game.players);
  if (res.fallDamage > 0) {
    applyDamage(game, p, null, res.fallDamage, C.HITGROUP.LEG, 'fall', null, null);
    A.impact(1, p.pos);
  }
  // fell out of the map
  if (p.pos.z < -600) killPlayer(game, p, null, null, false);

  // footsteps
  const moved = Math.hypot(p.pos.x - before.x, p.pos.y - before.y);
  if (p.onGround && p.speed2d > 55) {
    p.footAccum += moved;
    const stride = p.ducked ? 96 : (cmd.walk ? 110 : 78);
    if (p.footAccum > stride) {
      p.footAccum = 0;
      const quiet = cmd.walk || p.ducked;
      const surf = game.world.surfaceAt(p.pos.x, p.pos.y);
      if (!quiet || p === game.localPlayer) {
        A.footstep(surf, p.pos, quiet ? 0.28 : 1);
      }
      if (!quiet) game.noise(p, 1100, 'step');
    }
  } else if (res.landed) {
    const surf = game.world.surfaceAt(p.pos.x, p.pos.y);
    A.footstep(surf, p.pos, 1.2);
    if (res.landSpeed > 260) game.noise(p, 900, 'step');
  }

  updateWeaponState(game, p, dt);
}

function updateSpotted() {
  game.spotted.clear();
  const me = game.localPlayer;
  if (!me) return;
  const mates = game.players.filter((p) => p.team === me.team && p.alive);
  for (const e of game.players) {
    if (e.team === me.team || !e.alive) continue;
    for (const m of mates) {
      const eye = eyePos(m);
      const tp = { x: e.pos.x, y: e.pos.y, z: e.pos.z + e.height * 0.7 };
      const dx = tp.x - eye.x, dy = tp.y - eye.y, dz = tp.z - eye.z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist > 3200) continue;
      const look = forwardVec(m.yaw, m.pitch);
      if ((dx * look.x + dy * look.y + dz * look.z) / dist < 0.34) continue;
      if (game.nades.blocksLOS(eye, tp)) continue;
      if (!traceClear(game.world, eye, tp)) continue;
      game.spotted.add(e.id);
      break;
    }
  }
}

function step(dt) {
  game.now += dt;
  game.match.update(dt);
  for (const p of game.players) stepPlayer(p, dt);
  game.bomb.update(dt);
  game.nades.update(dt);
  game.fx.update(dt);

  // buy time ran out, or we walked out of the zone
  if (game.buy.open && !game.canBuyNow()) game.buy.toggle(false);

  spotTimer -= dt;
  if (spotTimer <= 0) { spotTimer = 0.1; updateSpotted(); }

  game.shake = damp(game.shake, 0, 7, dt);
  // screen effects follow whoever the camera is riding: while spectating you
  // are blinded when they are, not when your corpse was
  const viewer = game.viewTarget || game.localPlayer;
  const flash = viewer ? viewer.flashAmount : 0;
  if (flash > 0) $('flash').style.opacity = String(clamp(flash, 0, 1));
  else if ($('flash').style.opacity !== '0') $('flash').style.opacity = '0';

  const hp = viewer && viewer.alive ? viewer.health : 100;
  $('vignette').style.opacity = String(clamp((45 - hp) / 45, 0, 0.85));
}

// ---------------------------------------------------------------- rendering
function updateModels(dt) {
  const me = game.localPlayer;
  const view = game.viewTarget || me;
  for (const p of game.players) {
    if (!p.model) continue;
    // Whoever the camera is riding gets their body hidden — the view is from
    // inside their head, so rendering it fills the screen with the back of a
    // helmet. This applies while spectating too, not just when alive.
    const isCamera = p === view;
    p.model.group.visible = !isCamera;
    // keep animating even while hidden so switching targets never shows a
    // model frozen at a stale pose for a frame
    p.model.update(p, dt, p.team === me.team, me.team);
    if (isCamera) continue;
    p.model.setWeaponLook(VM_KIND(currentWeapon(p)));
    if (p.st.lastShot > game.now - 0.05) p.model.kick();
  }
}

function updateCamera(dt) {
  const me = game.localPlayer;
  const view = game.viewTarget || me;
  const eye = eyePos(view);
  let yaw = view.yaw + view.punch.x * DEG;
  let pitch = view.pitch - view.punch.y * DEG;

  if (game.shake > 0.01) {
    yaw += rng.gauss() * game.shake * 0.0018;
    pitch += rng.gauss() * game.shake * 0.0018;
    eye.z += rng.gauss() * game.shake * 0.35;
  }
  if (!view.alive) {
    eye.z += 24;
    pitch = clamp(pitch, -0.2, 1.2);
  }

  const w = currentWeapon(view);
  let fov = settings.fov;
  if (view.st.scopeLevel > 0 && w.scope) fov = w.scope[view.st.scopeLevel - 1];
  scene.setCamera(eye, yaw, pitch, 0, fov);

  const right = angleVectors(yaw, 0).r;
  A.setListener(eye, right);

  // scope overlay
  const scoped = view.st.scopeLevel > 0;
  $('scope').classList.toggle('hidden', !scoped);
  game.vm.hidden = scoped || !view.alive || view === null;

  // viewmodel
  if (me.alive && view === me) {
    game.vm.setWeapon(VM_KIND(w));
    const reloading = me.st.reloading;
    const deploying = game.now < me.st.deployEnd;
    const lower = reloading ? 0.75 : deploying ? 0.85 : (nadeCharging ? 0.25 : 0);
    game.vm.update(dt, me, {
      time: game.now, lookDx, lookDy,
      bobEnabled: settings.bob, lowerTarget: lower,
    });
  } else {
    game.vm.hidden = true;
    game.vm.update(dt, view, { time: game.now, lookDx: 0, lookDy: 0, bobEnabled: false, lowerTarget: 1 });
  }
  scene.vmRoot.visible = !game.vm.hidden;
}

// ---------------------------------------------------------------- loop
let lastT = 0;

function frame(ts) {
  if (!game.running) return;
  requestAnimationFrame(frame);
  const now = ts / 1000;
  let dt = lastT ? now - lastT : 1 / 60;
  lastT = now;
  dt = clamp(dt, 0.0005, 0.1);
  tick(dt);
}

function tick(dt) {
  if (game.touch) game.touch.update();       // phones: on-screen controls follow the game state
  if (game.mode === 'debug') {
    if (!game.paused) debug.update(dt);
    debug.updateCamera(dt);
    scene.render();
    debug.draw(dt, game.hud);
    endFrame();
    return;
  }
  if (!game.paused) {
    // sub-step long frames so movement stays stable
    let remaining = dt;
    let guard = 0;
    while (remaining > 1e-5 && guard++ < 4) {
      const s = Math.min(remaining, 1 / 45);
      step(s);
      remaining -= s;
    }
  }
  updateModels(dt);
  updateCamera(dt);
  game.hud.draw(dt);
  if (game.aiInspector) game.aiInspector.draw();
  if (scoreboardOpen) renderScoreboard(game);
  scene.render();
  endFrame();
}

// exposed so the loop can be driven manually when rAF is throttled
game.step = (dt) => { tick(dt || 1 / 60); };
game.frame = () => tick(1 / 60);

// ---------------------------------------------------------------- boot
function initEngine() {
  canvas = $('game');
  hudEl = $('hud');
  scene = createScene(canvas);
  game.scene = scene;

  world = buildMap();
  game.world = world;
  scene.root.add(world.group);

  game.fx = new FX(scene.root, scene);
  vm = new ViewModel(scene.vmRoot);
  game.vm = vm;
  game.fx.onLocalAttack = (pl) => { if (pl === game.localPlayer) vm.onSwing(); };

  game.hud = new HUD(hudEl, game);
  game.bomb = new Bomb(game);
  game.nades = new GrenadeSystem(game);
  game.buy = new BuyMenu(game);
  game.teamAI = new TeamAI(game);
  game.aiInspector = new AIInspector(game);
  debug = new DebugMode(game, scene);
  game.debug = debug;
  $('debughelp').textContent = DEBUG_HELP.trim();

  initInput(canvas);
  Input.onEscape = () => {
    if (!game.running) return;
    if (game.mode === 'debug') { exitDebug(); return; }
    if (game.buy.open) { game.buy.toggle(false); return; }
    togglePause();
  };
  Input.onLockChange = (locked) => {
    Input.enabled = game.running;
    if (game.touch) game.touch.update();
    if (game.mode === 'debug') return;      // the inspector never pauses
    if (!locked && game.running && !game.paused && !game.buy.open) togglePause(true);
  };

  addEventListener('resize', doResize);
  doResize();
}

function doResize() {
  const { w, h } = scene.resize();
  game.hud.resize(w, h);
  game.fx.setViewportScale(h, settings.fov);
}

function togglePause(force) {
  const want = force !== undefined ? force : !game.paused;
  game.paused = want;
  $('pause').classList.toggle('hidden', !want);
  if (want) exitLock(); else requestLock();
}

/** sandbox mode: the map, a free camera and the collision debug overlays. */
function startDebug() {
  game.mode = 'debug';
  game.players.length = 0;
  game.localPlayer = null;
  game.viewTarget = null;
  game.running = true;
  game.paused = false;
  Input.enabled = true;
  debug.enter();
  $('menu').classList.add('hidden');
  $('endmatch').classList.add('hidden');
  $('scoreboard').classList.add('hidden');
  lastT = 0;
  requestAnimationFrame(frame);
  requestLock();
}

function exitDebug() {
  debug.exit();
  game.mode = 'menu';
  game.running = false;
  Input.enabled = false;
  exitLock();
  $('debugpanel').classList.add('hidden');
  $('debughelp').classList.add('hidden');
  $('menu').classList.remove('hidden');
  game.hud.ctx.clearRect(0, 0, game.hud.w, game.hud.h);
  scene.render();
}

function startMatch() {
  let seed = 1337;
  try {
    const raw = new URLSearchParams(location.search).get('seed');
    if (raw !== null && raw !== '') seed = Number(raw);
  } catch (e) { /* file-like test environments */ }
  game.resetAIRandom(seed);
  const team = settings.team === 'T' ? C.TEAM.T : C.TEAM.CT;
  game.mode = 'match';
  createPlayers(team, settings.difficulty);
  game.match = new Match(game, settings.matchLen);
  game.running = true;
  game.paused = false;
  Input.enabled = true;
  game.match.begin();
  $('menu').classList.add('hidden');
  $('endmatch').classList.add('hidden');
  lastT = 0;
  requestAnimationFrame(frame);
  requestLock();
}

// ---------------------------------------------------------------- UI wiring
function wireUI() {
  wireSegment('pick-team', settings.team, (v) => { settings.team = v; saveSettings(); });
  wireSegment('pick-diff', settings.difficulty, (v) => { settings.difficulty = +v; saveSettings(); });
  wireSegment('pick-len', settings.matchLen, (v) => { settings.matchLen = +v; saveSettings(); });
  wireSettings((key) => {
    if (key === 'volume') A.setVolume(settings.volume);
    if (key === 'shadows') scene.setShadows(settings.shadows);
    if (key === 'fov') { game.fx.setViewportScale(scene.height, settings.fov); }
  });

  $('btn-play').onclick = () => {
    A.initAudio(); A.resumeAudio();
    if (!game.running) startMatch();
  };
  $('btn-debug').onclick = () => {
    if (!game.running) startDebug();
  };
  $('btn-settings').onclick = () => {
    $('menu').classList.add('hidden');
    $('settings').classList.remove('hidden');
    game._settingsFrom = 'menu';
  };
  $('btn-pause-settings').onclick = () => {
    $('pause').classList.add('hidden');
    $('settings').classList.remove('hidden');
    game._settingsFrom = 'pause';
  };
  $('btn-settings-back').onclick = () => {
    $('settings').classList.add('hidden');
    if (game._settingsFrom === 'pause') $('pause').classList.remove('hidden');
    else $('menu').classList.remove('hidden');
  };
  $('btn-resume').onclick = () => togglePause(false);
  $('btn-quit').onclick = () => location.reload();
  $('btn-again').onclick = () => location.reload();

  addEventListener('keydown', (e) => {
    if (!game.running || game.paused) return;
    if (game.mode !== 'match') return;      // the inspector owns its own keys
    if (e.code === 'F8' && !e.repeat) {
      const on = game.aiInspector.toggle();
      game.hud.log(`AI inspector ${on ? 'enabled' : 'disabled'} ? seed ${game.aiSeed}`);
      e.preventDefault();
      return;
    }
    if (e.code === 'F7' && !e.repeat && game.aiInspector.enabled) {
      const bot = game.aiInspector.cycle(e.shiftKey ? -1 : 1);
      if (bot) game.hud.log(`Inspecting ${bot.pl.name}`);
      e.preventDefault();
      return;
    }
    if (e.code === 'Tab') { scoreboardOpen = true; $('scoreboard').classList.remove('hidden'); }
    if (e.code === 'KeyB' && !e.repeat) game.buy.toggle();
    else if (game.buy.open && !e.repeat) {
      if (game.buy.handleKey(e.code)) e.preventDefault();
    }
  });
  addEventListener('keyup', (e) => {
    if (e.code === 'Tab') { scoreboardOpen = false; $('scoreboard').classList.add('hidden'); }
  });
}

// ---------------------------------------------------------------- go
function boot() {
  try {
    initEngine();
    wireUI();
    game.touch = new TouchUI(game);          // phones / tablets (hidden on desktop)
    $('loading').classList.add('hidden');
    // idle background render so the menu is not on a black screen
    scene.setCamera({ x: 0, y: -1500, z: 220 }, Math.PI / 2, -0.02, 0, settings.fov);
    scene.render();
  } catch (err) {
    $('loading').innerHTML = `<div style="color:#ff6a5a;max-width:640px;text-align:center">
      <b>FAILED TO START</b><br><br><pre style="white-space:pre-wrap;font-size:12px">${
        (err && err.stack || err)}</pre></div>`;
    throw err;
  }
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
else boot();

export { game };
