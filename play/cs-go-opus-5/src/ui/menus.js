// menus.js — buy menu, scoreboard, settings panel and the main-menu wiring.
import { BUY_MENU, WEAPONS, GEAR, SLOT } from '../game/weapons.js';
import * as C from '../game/constants.js';
import { giveWeapon, nadeCount } from '../game/player.js';
import { settings, saveSettings } from '../core/settings.js';
import { setVolume, SFX } from '../core/audio.js';
import { fmtTime } from '../core/math.js';
import { Input, requestLock, exitLock } from '../core/input.js';

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------- buy menu
export class BuyMenu {
  constructor(game) {
    this.game = game;
    this.el = $('buy');
    this.catsEl = $('buy-cats');
    this.itemsEl = $('buy-items');
    this.open = false;
    this.cat = 2;                 // rifles by default
    this.mode = 'cat';            // 'cat' = digits pick a category, 'items' = digits buy
    this.buildCats();
  }

  buildCats() {
    this.catsEl.innerHTML = '';
    BUY_MENU.forEach((c, i) => {
      const d = document.createElement('div');
      d.textContent = `${i + 1}. ${c.key.toUpperCase()}`;
      d.onclick = () => { this.cat = i; this.mode = 'items'; this.render(); };
      this.catsEl.appendChild(d);
    });
  }

  itemInfo(id) {
    if (WEAPONS[id]) {
      const w = WEAPONS[id];
      return {
        name: w.name, price: w.price, team: w.team, w,
        stat: w.cat === 'nade' ? 'GRENADE'
          : `${w.dmg} DMG · ${w.mag > 0 ? w.mag + ' RD' : '—'} · ${Math.round(w.speed)} U/S`,
      };
    }
    const gr = GEAR[id];
    return { name: gr.name, price: gr.price, team: gr.team, gear: gr, stat: 'EQUIPMENT' };
  }

  owned(id, pl) {
    if (id === 'kevlar') return pl.armor > 0;
    if (id === 'kevlarhelmet') return pl.helmet;
    if (id === 'defusekit') return pl.hasKit;
    const w = WEAPONS[id];
    if (!w) return false;
    if (w.slot === SLOT.NADE) return nadeCount(pl, id) >= (w.maxCarry || 1);
    return pl.inv.primary === id || pl.inv.secondary === id;
  }

  priceFor(id, pl) {
    if (id === 'kevlarhelmet' && pl.armor > 0 && !pl.helmet) return 350;
    const info = this.itemInfo(id);
    return info.price;
  }

  render() {
    const pl = this.game.localPlayer;
    if (!pl) return;
    $('buy-money').textContent = `$${pl.money}`;
    $('buy-time').textContent = `BUY TIME ${fmtTime(Math.max(0, this.game.match.buyTimer))}`;
    [...this.catsEl.children].forEach((c, i) => c.classList.toggle('on', i === this.cat));
    // which pane the number keys are talking to
    this.el.classList.toggle('pick-cat', this.mode === 'cat');
    const foot = $('buy-foot');
    if (foot) {
      foot.textContent = this.mode === 'cat'
        ? '1-6 choose a category  ·  or click anything  ·  B closes'
        : '1-9 buy  ·  0 / BACKSPACE back to categories  ·  B closes';
    }
    this.itemsEl.innerHTML = '';
    const cat = BUY_MENU[this.cat];
    let n = 1;
    for (const id of cat.items) {
      const info = this.itemInfo(id);
      if (info.team && info.team !== pl.team) continue;
      const price = this.priceFor(id, pl);
      const owned = this.owned(id, pl);
      const afford = pl.money >= price && !owned;
      const d = document.createElement('div');
      d.className = 'bi' + (afford ? '' : ' no') + (owned ? ' own' : '');
      d.innerHTML = `<div class="k">${n}</div><div class="n">${info.name}</div>` +
        `<div class="p">${owned ? 'OWNED' : '$' + price}</div><div class="st">${info.stat}</div>`;
      d.onclick = () => this.buy(id);
      this.itemsEl.appendChild(d);
      n++;
    }
  }

  buy(id) {
    const game = this.game;
    const pl = game.localPlayer;
    if (!game.canBuyNow()) { SFX.deny(); return false; }
    const price = this.priceFor(id, pl);
    if (this.owned(id, pl) || pl.money < price) { SFX.deny(); return false; }

    if (id === 'kevlar' || id === 'kevlarhelmet') {
      pl.armor = 100;
      if (id === 'kevlarhelmet') pl.helmet = true;
    } else if (id === 'defusekit') {
      if (pl.team !== C.TEAM.CT) { SFX.deny(); return false; }
      pl.hasKit = true;
    } else {
      const w = WEAPONS[id];
      if (w.team && w.team !== pl.team) { SFX.deny(); return false; }
      if (!giveWeapon(pl, id, { noSwitch: w.slot === SLOT.NADE })) { SFX.deny(); return false; }
      if (w.slot !== SLOT.NADE) game.switchToBest(pl);
    }
    pl.money -= price;
    SFX.buy();
    this.render();
    return true;
  }

  toggle(force) {
    const want = force !== undefined ? force : !this.open;
    if (want && !this.game.canBuyNow()) {
      this.game.hud.log('You cannot buy right now');
      SFX.deny();
      return;
    }
    if (want === this.open) return;
    this.open = want;
    this.mode = 'cat';
    this.el.classList.toggle('hidden', !this.open);
    // Hand the cursor back while shopping. The menu is a DOM panel, so under
    // pointer lock none of it is clickable and the only way in is the keyboard.
    Input.lockBlocked = this.open;
    if (this.open) { this.render(); exitLock(); }
    else if (this.game.running && !this.game.paused) requestLock();
  }

  /**
   * Two-level number keys, the way the classic buy menu works: a digit picks a
   * category, then digits buy from it. Previously a digit was always spent on
   * the item list, so with rifles open by default 1-6 bought rifles and nothing
   * could ever reach the category list.
   */
  handleKey(code) {
    if (!this.open) return false;
    if (code === 'Backspace' || code === 'Digit0') {
      if (this.mode === 'items') { this.mode = 'cat'; this.render(); return true; }
      return false;
    }
    const d = parseInt(code.replace('Digit', ''), 10);
    if (isNaN(d) || d < 1) return false;
    if (this.mode === 'cat') {
      if (d > BUY_MENU.length) return false;
      this.cat = d - 1;
      this.mode = 'items';
      this.render();
      return true;
    }
    const items = [...this.itemsEl.children];
    if (items[d - 1]) { items[d - 1].click(); return true; }
    return false;
  }
}

// ---------------------------------------------------------------- scoreboard
export function renderScoreboard(game) {
  const el = $('scoreboard');
  const m = game.match;
  const rows = (team) => game.players
    .filter((p) => p.team === team)
    .sort((a, b) => b.score - a.score || b.kills - a.kills)
    .map((p) => `<div class="sb-row${p === game.localPlayer ? ' me' : ''}${p.alive ? '' : ' dead'}">
        <span class="nm">${p.isBot ? 'BOT ' : ''}${p.name}</span>
        <span class="c hi">${p.kills}</span><span class="c">${p.deaths}</span>
        <span class="c">${p.assists}</span><span class="c">${Math.round(p.damageDealt)}</span>
        <span class="c">${p.mvps}</span><span class="c">$${p.money}</span>
      </div>`).join('');

  el.innerHTML = `
    <div class="sb-head">
      <span class="m">de_sandstorm · COMPETITIVE MR${m.maxRounds}</span>
      <span class="sc" style="color:${C.TEAM_COLOR[C.TEAM.CT]}">${m.score[C.TEAM.CT]}</span>
      <span class="sc" style="color:#556">:</span>
      <span class="sc" style="color:${C.TEAM_COLOR[C.TEAM.T]}">${m.score[C.TEAM.T]}</span>
    </div>
    <div class="sb-team ct"><span>COUNTER-TERRORISTS</span></div>
    <div class="sb-cols"><span class="nm">PLAYER</span><span class="c">K</span><span class="c">D</span>
      <span class="c">A</span><span class="c">DMG</span><span class="c">MVP</span><span class="c">MONEY</span></div>
    ${rows(C.TEAM.CT)}
    <div class="sb-team t"><span>TERRORISTS</span></div>
    <div class="sb-cols"><span class="nm">PLAYER</span><span class="c">K</span><span class="c">D</span>
      <span class="c">A</span><span class="c">DMG</span><span class="c">MVP</span><span class="c">MONEY</span></div>
    ${rows(C.TEAM.T)}`;
}

// ---------------------------------------------------------------- settings
export function wireSettings(onChange) {
  const bind = (id, key, out, fmt) => {
    const el = $(id);
    if (!el) return;
    if (el.type === 'checkbox') {
      el.checked = !!settings[key];
      el.onchange = () => { settings[key] = el.checked; saveSettings(); onChange(key); };
    } else {
      el.value = settings[key];
      const upd = () => {
        settings[key] = parseFloat(el.value);
        if (out) $(out).textContent = fmt ? fmt(settings[key]) : settings[key];
        saveSettings();
        onChange(key);
      };
      el.oninput = upd;
      upd();
    }
  };
  bind('s-sens', 'sens', 'v-sens', (v) => v.toFixed(2));
  bind('s-tsens', 'touchSens', 'v-tsens', (v) => v.toFixed(2));   // touch screens only
  bind('s-fov', 'fov', 'v-fov', (v) => String(Math.round(v)));
  bind('s-vol', 'volume', 'v-vol', (v) => Math.round(v * 100) + '%');
  bind('s-chs', 'chSize', 'v-chs');
  bind('s-chg', 'chGap', 'v-chg');
  bind('s-chd', 'chDot');
  bind('s-chdyn', 'chDynamic');
  bind('s-bob', 'bob');
  bind('s-shadow', 'shadows');
  bind('s-blood', 'blood');

  const seg = $('s-chcol');
  if (seg) {
    [...seg.children].forEach((b) => {
      b.classList.toggle('on', b.dataset.v === settings.chColor);
      b.onclick = () => {
        settings.chColor = b.dataset.v;
        [...seg.children].forEach((x) => x.classList.toggle('on', x === b));
        saveSettings();
        onChange('chColor');
      };
    });
  }
  setVolume(settings.volume);
}

/** simple segmented-control helper for the main menu */
export function wireSegment(id, initial, onPick) {
  const seg = $(id);
  if (!seg) return;
  [...seg.children].forEach((b) => {
    b.classList.toggle('on', b.dataset.v === String(initial));
    b.onclick = () => {
      [...seg.children].forEach((x) => x.classList.toggle('on', x === b));
      onPick(b.dataset.v);
    };
  });
}
