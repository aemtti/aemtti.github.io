"use strict";
// ---------- Save / load via downloadable JSON (no localStorage) ----------

function serializeSave() {
  // saved from the game-over menu: keep what CONTINUE would give (hearts and place)
  const fallen = !!(P && P.dead);
  return {
    v: SAVE_VERSION,
    game: GAME_TITLE,
    hp: fallen ? Math.min(G.maxhp, 6) : G.hp, maxhp: G.maxhp, gems: G.gems, keys: G.keys,
    bombs: G.bombs, bombMax: G.bombMax, shards: G.shards,
    heartPieces: G.heartPieces || 0,
    stats: { frames: G.stats.frames, deaths: G.stats.deaths },
    inv: Object.assign({}, G.inv),
    bItem: G.bItem,
    hintIdx: G.hintIdx || 0,
    flags: Object.assign({}, G.flags),
    dmaps: JSON.parse(JSON.stringify(G.dmaps)),
    loc: fallen ? continueLocation() : saveLocation(),
  };
}

// Where CONTINUE puts a fallen hero: the dungeon's entrance, else the start.
function continueLocation() {
  if (G.area === "dungeon" && G.dungeon) return { area: "dungeon", dungeon: G.dungeon };
  return { area: "overworld", sx: OW_START.sx, sy: OW_START.sy, px: OW_START.x, py: OW_START.y };
}

// Saving mid-crossing (on the raft, a ladder, the tether, or falling) could put the
// hero back down on water or over a drop, so it waits for firm ground.
function canSaveNow() {
  return !(P && (P.rafting || (P.laddering && P.laddering.entered) || P.pull || P.fallT > 0));
}

// Where to resume: overworld saves keep screen+position, dungeon saves resume
// at that dungeon's entrance (NES-style compromise). Cave saves use the cave's
// overworld entrance.
function saveLocation() {
  if (G.area === "dungeon" && G.dungeon) {
    return { area: "dungeon", dungeon: G.dungeon };
  }
  if (G.area === "cave" && G.caveReturn) {
    const r = G.caveReturn;
    return { area: "overworld", sx: r.sx, sy: r.sy, px: r.x, py: r.y };
  }
  // (rounded down: every wall edge lies on a whole pixel, so the spot stays as open as
  // it was; rounding a half pixel up could put his side into the rock beside him, and
  // the load would then move him off to the nearest tile)
  return { area: "overworld", sx: G.sx, sy: G.sy, px: Math.floor(P.x), py: Math.floor(P.y) };
}

function saveGame() {
  const data = JSON.stringify(serializeSave(), null, 2);
  // (played by touch the download may wait for the finger to lift: afterTouch below)
  afterTouch(() => {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sunstone-quest.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
  G.saveMsg = 150;
  Sound.sfx("save_ok");
}

// A phone opens the file window, or starts a download, only inside the player's own touch, and
// a touch counts when the finger lifts. Pressed through an on-screen button (touch.js) the game
// hears the press a frame after the finger lands, so what cannot run yet waits for that lift.
// (Keys, a mouse, and taps answered on the lift itself run at once, as they always did.)
let _afterTouch = null;
function afterTouch(fn) {
  const ua = typeof navigator !== "undefined" ? navigator.userActivation : null;
  if (typeof window !== "undefined" && window.TOUCH_PLAY && ua && !ua.isActive) { _afterTouch = fn; return; }
  fn();
}
function runAfterTouch() { const f = _afterTouch; _afterTouch = null; if (f) f(); }

let _fileInput = null;
function initSaveUI() {
  window.addEventListener("pointerup", runAfterTouch, true);
  window.addEventListener("touchend", runAfterTouch, true);
  _fileInput = document.createElement("input");
  _fileInput.type = "file";
  _fileInput.accept = ".json,application/json";
  _fileInput.style.display = "none";
  document.body.appendChild(_fileInput);
  _fileInput.addEventListener("change", () => {
    const f = _fileInput.files && _fileInput.files[0];
    _fileInput.value = "";
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(r.result);
        applySave(o);
      } catch (err) {
        console.error("Bad save file", err);
        G.loadErr = 180;
      }
    };
    r.readAsText(f);
  });
}

function loadViaFile() {
  afterTouch(() => { if (_fileInput) _fileInput.click(); });
}

function validNum(v, lo, hi, dflt) {
  v = Number(v);
  if (!isFinite(v)) return dflt;
  return clamp(Math.floor(v), lo, hi);
}

// Older saves: version 1 knew the Shadow Keep as level 4 (it is level 7 now).
function migrateSave(o) {
  if (o && o.v === 1) {
    const flags = {};
    for (const k in (o.flags || {})) flags[k.replace(/^d4:/, "d7:")] = o.flags[k];
    o.flags = flags;
    if (o.dmaps && o.dmaps[4]) { o.dmaps[7] = o.dmaps[4]; delete o.dmaps[4]; }
    if (o.loc && o.loc.area === "dungeon" && Number(o.loc.dungeon) === 4) o.loc.dungeon = 7;
    o.v = 2;
  }
  // version 1 broke the keep's seal with three shards; now it takes all six. A seal
  // opened with fewer closes again, and a hero saved inside the keep waits at its gate.
  if (o && o.flags && typeof o.flags === "object" && o.flags["gate:open"] && validNum(o.shards, 0, SHARDS_NEEDED, 0) < SHARDS_NEEDED) {
    delete o.flags["gate:open"];
    if (o.loc && o.loc.area === "dungeon" && Number(o.loc.dungeon) === 7) {
      const e = DUNGEONS[7].entranceOW;
      o.loc = { area: "overworld", sx: e.sx, sy: e.sy, px: e.x * TS, py: (e.y + 1) * TS };
    }
  }
  // Rooms rebuilt around crystal eyes: a boss door already unlocked with a key stays
  // open (its eyes count as woken), and a key already won in the Shadow Keep's east
  // hall is not laid out a second time. Those boss doors took a key, and each level
  // had a second key a room's foes dropped (level 1 room 3,3, level 2 room 2,2), which
  // is gone now: a hero who spent a key on the door and never won that drop gets the
  // key back, or the treasure room's lock would have none left. (The old door's flag
  // goes once it is carried over, so the key comes back only once.)
  if (o && o.flags && typeof o.flags === "object") {
    const f = o.flags;
    for (const [door, eyes, drop] of [["d1:V:2,1", "d1:sw:2,2", "d1:kdrop:3,3"], ["d2:V:1,1", "d2:sw:1,2", "d2:kdrop:2,2"]]) {
      if (!f[door]) continue;
      f[eyes] = 1;
      if (!f[drop]) o.keys = validNum(o.keys, 0, 9, 0) + 1;
      delete f[door];
    }
    if (f["d7:kdrop:4,4"]) f["d7:item:4,4"] = 1;
  }
  return o;
}

function applySave(o) {
  o = migrateSave(o);
  if (!o || o.v !== SAVE_VERSION) { G.loadErr = 180; return; }
  resetGameState();
  initPlayer();
  G.maxhp = validNum(o.maxhp, 2, 40, 6);
  G.hp = validNum(o.hp, 1, G.maxhp, G.maxhp);
  G.gems = validNum(o.gems, 0, 255, 0);
  G.keys = validNum(o.keys, 0, 9, 0);
  G.bombs = validNum(o.bombs, 0, 16, 0);
  G.bombMax = validNum(o.bombMax, 8, 16, 8);
  G.shards = validNum(o.shards, 0, SHARDS_NEEDED, 0);
  G.heartPieces = validNum(o.heartPieces, 0, 3, 0);
  if (o.stats) { G.stats.frames = validNum(o.stats.frames, 0, 1e9, 0); G.stats.deaths = validNum(o.stats.deaths, 0, 1e6, 0); }
  G.hintIdx = validNum(o.hintIdx, 0, 99, 0);
  if (o.inv && typeof o.inv === "object") {
    for (const k in G.inv) if (k in o.inv) G.inv[k] = validNum(o.inv[k], 0, 3, 0);
  }
  if (typeof o.bItem === "string" || o.bItem === null) G.bItem = o.bItem;
  if (o.flags && typeof o.flags === "object") {
    for (const k in o.flags) if (o.flags[k]) G.flags[k] = 1;
  }
  if (o.dmaps && typeof o.dmaps === "object") {
    for (const d of [1, 2, 3, 4, 5, 6, 7]) {
      if (o.dmaps[d]) {
        G.dmaps[d].map = o.dmaps[d].map ? 1 : 0;
        G.dmaps[d].compass = o.dmaps[d].compass ? 1 : 0;
      }
    }
  }
  const loc = o.loc;
  if (loc && loc.area === "dungeon" && DUNGEONS[loc.dungeon]) {
    enterDungeon(validNum(loc.dungeon, 1, 7, 1));
  } else if (loc && loc.area === "overworld") {
    const sx = validNum(loc.sx, 0, OWW - 1, OW_START.sx);
    const sy = validNum(loc.sy, 0, OWH - 1, OW_START.sy);
    // (he may stand up to half his size across the screen's edge, as far as the screen
    // turns: main.js updatePlayWorld; the checks below judge the spot)
    const px = validNum(loc.px, -8, PW - 8, OW_START.x);
    const py = validNum(loc.py, -8, PH - 8, OW_START.y);
    loadOverworldScreen(sx, sy, px, py);
    // guard against hand-edited or stale positions (an older save made on the raft, a
    // spot of the old world now shut in by rock or trees): resume only on ground the
    // hero can get home from with what he holds, else on the nearest ground that walks
    // to the start (it may lie on the next screen)
    const gx = sx * COLS + Math.floor((P.x + 8) / TS), gy = sy * ROWS + Math.floor((P.y + 12) / TS);
    if (terrainBlocked(P.x, P.y) || !groundFromStart(G.inv)[gy * WW + gx]) {
      const [hx, hy] = homeGroundNear(gx, gy);
      loadOverworldScreen(Math.floor(hx / COLS), Math.floor(hy / ROWS), (hx % COLS) * TS, (hy % ROWS) * TS);
    }
  } else {
    loadOverworldScreen(OW_START.sx, OW_START.sy, OW_START.x, OW_START.y);
  }
  G.mode = "play";
  Sound.sfx("load_ok");
}
