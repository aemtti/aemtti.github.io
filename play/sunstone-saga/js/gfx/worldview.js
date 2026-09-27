"use strict";
// ---------- Per-frame drawing of play / cave / transition / death at 512x480 ----------
// (the full-screen pages are in screens2.js)

// ---------- HUD state ----------
function hudState() {
  const s = {
    area: "ow", sx: G.sx, sy: G.sy, biome: (x, y) => BIOME[y][x],
    gems: G.gems, keys: G.keys, bombs: G.bombs, hp: G.hp, maxhp: G.maxhp, frame: G.frame,
    // the B item and the sword you carry are shown as their treasures; every X item has
    // a model (a new one without an entry in B_ITEM_MODEL is tried by its own name), and
    // one used up (the potion drunk, the last bomb thrown) leaves the box empty
    bModel: G.bItem && bItemOwned(G.bItem) ? B_ITEM_MODEL[G.bItem] || G.bItem : null,
    aModel: G.inv.sword ? "sword" + Math.min(3, G.inv.sword) : null,
  };
  if (G.area === "cave" && G.caveReturn) { s.sx = G.caveReturn.sx; s.sy = G.caveReturn.sy; }
  if (G.area === "dungeon") {
    s.area = "dun";
    const d = DUNGEONS[G.dungeon];
    const dm = G.dmaps[G.dungeon] || {};
    s.rooms = Object.keys(d.rooms).map(k => {
      const [x, y] = k.split(",").map(Number);
      const isHere = x === G.rx && y === G.ry;
      return { x, y, seen: !!G.flags["d" + G.dungeon + ":seen:" + k] || isHere, mapped: !!dm.map, isHere, here: isHere && ((G.frame >> 3) & 1), shard: !!dm.compass && d.rooms[k].item === "shard" };
    });
  }
  return s;
}

// ---------- text boxes ----------
// (sized to its lines; the speaker's name on a tab when the box says who is talking;
// a blinking arrow once the text is all out, to say a press moves on. `d` is G.dialog
// unless given; it may set its own top `y`, line height `lh`, and `more: false` when
// a press has nothing to move on to)
function dialogBoxH(n, lh) { return (n - 1) * (lh || 20) + 42; }
function drawDialog2(c, dd) {
  const d = dd || G.dialog;
  if (!d) return;
  // (a box may also set its own height `h`, for slimmer margins)
  const lh = d.lh || 20, h = d.h || dialogBoxH(d.lines.length, lh);
  const tw = Math.max(textWidth2(d.who || ""), ...d.lines.map(l => textWidth2(l)));
  const w = Math.min(RW - 80, Math.max(220, tw + 64)), x = Math.round((RW - w) / 2);
  const y = d.y !== undefined ? d.y : RHUD + 16 + (d.who ? 10 : 0);
  if (d.who) { const nw = textWidth2(d.who) + 20; drawPanel(c, x + 12, y - 16, nw, 20); drawText2(c, d.who, x + 22, y - 11, STYLE.ramps.gold[3]); }
  drawPanel(c, x, y, w, h);
  for (let i = 0; i < d.lines.length; i++) {
    let line = d.lines[i];
    if (!d.done) {
      if (i > d.li) line = "";
      else if (i === d.li) line = line.slice(0, d.ci);
    }
    drawText2(c, line, x + 20, y + 14 + i * lh, STYLE.ramps.white[0]);
  }
  if (d.done && d.more !== false && ((G.frame >> 4) & 1)) {
    const ax = x + w - 18, ay = y + h - 13;
    c.fillStyle = STYLE.ramps.gold[3];
    for (let r = 0; r < 4; r++) c.fillRect(ax - 3 + r, ay + r, 7 - 2 * r, 1);
  }
}
// The cave host's talk box (caves.js caveTalkBox): under the host, ending just over the
// wares; while the hero walks up where it would cover him (G.cave.low, set in
// updateCave) it drops below the wares. Lines are a little closer than in the play
// dialog so four fit between the host and the wares.
function drawCaveTalk(c, s) {
  const d = caveTalkBox(s);
  if (!d.lines.length) return;
  d.lh = 16;
  const h = dialogBoxH(d.lines.length, d.lh);
  if (!s.low) d.y = RHUD + CAVE_BOX_BOTTOM * SC - h;
  else if (!s.items.length) d.y = RH - 8 - h;
  else {
    // below wares it keeps under their price row (text down to y 386): slimmer margins
    // and no name tab, so four lines end at the screen's foot and no price is covered
    d.h = h - 6; d.y = RH - 4 - d.h; d.who = null;
  }
  drawDialog2(c, d);
}
// A note across the top (a level's name, a first-use hint) on a small plaque; its clock
// runs in main.js step, drawing only reads it.
function drawBanner2(c) {
  if (!G.banner || G.banner.t <= 0) return;
  const w = textWidth2(G.banner.text) + 28;
  drawPanel(c, Math.round(RW / 2 - w / 2), RHUD + 6, w, 24);
  drawText2C(c, G.banner.text, RW / 2, RHUD + 14, STYLE.ramps.gold[3]);
}
// Lines of text centred in the room (NPC speech, cave hosts), in play-area logic units.
// (outlined, so they read on bright sand and pale plank floors too)
function drawSpeech(c, lines, y0) {
  for (let i = 0; i < lines.length; i++) drawText2C(c, lines[i], RW / 2, RHUD + y0 * SC + i * 20, STYLE.ramps.white[0], "outline");
}

// ---------- modes ----------
function renderWorld(c) {
  const scene = currentScene();
  const extra = [];
  // (a host or a ware with no picture shows the missing-art box: hud2.js drawMissing)
  const npcAt = (spr, lx, ly) => extra.push({ key: (ly + 15) * SC, draw: () => { if (!drawNPC2(c, spr, lx, ly)) drawMissingAt(c, lx, ly, spr); } });
  if (G.area === "dungeon" && G.roomNPC) {
    for (const bx of [72, 168]) {
      const b = { kind: "brazier", v: 0, x: (bx + 8) * SC, y: 54 * SC, key: 54 * SC };
      extra.push({ key: b.key, draw: () => { drawPropAt(c, b, 0, 0); c.drawImage(FLAMES[((G.frame >> 3) + (bx >> 4)) & 1], b.x - 5, b.y - 22 + RHUD); } });
    }
    npcAt(G.roomNPC.spr, 120, 40);
  }
  if (G.area === "cave" && G.cave) {
    npcAt(G.cave.def.npc, 120, 40);
    for (const item of G.cave.items) {
      extra.push({ key: (item.y + 14) * SC, draw: () => { if (!drawItem2(c, item.kind, item.x, item.y)) drawMissingAt(c, item.x, item.y, item.kind); } });
    }
  }
  // a blast shakes the play area (whole pixels, the HUD stays still)
  const sh = G.shake > 0 ? ((G.shake & 2) ? 2 : -2) : 0;
  if (sh) {
    c.save();
    c.fillStyle = STYLE.ramps.ink[0]; c.fillRect(0, RHUD, RW, 352);
    c.beginPath(); c.rect(0, RHUD, RW, 352); c.clip();
    c.translate(sh, sh / 2);
  }
  drawSceneFrame(c, scene, { actors: true, extra });
  if (G.area === "dungeon" && scene.dark && !G.roomLit) drawDarkness(c, (P.x + 8) * SC, (P.y + 10) * SC);
  if (sh) c.restore();
  // (the sage falls silent while the shards rise: the ending tells it)
  // (a level's hermit or the sage speaks in the same named box as the village and cave
  // hosts, under the speaker; the lines are all out at once)
  if (G.area === "dungeon" && G.roomNPC && G.mode !== "win") {
    const n = G.roomNPC, lh = 16, h = dialogBoxH(n.lines.length, lh);
    const who = n.sage ? (typeof MAREN_WHO !== "undefined" ? MAREN_WHO : "MAREN") : ((typeof CAVE_WHO !== "undefined" && CAVE_WHO[n.spr]) || "HERMIT");
    drawDialog2(c, { lines: n.lines, who, done: true, more: false, lh, y: RHUD + CAVE_BOX_BOTTOM * SC - h });
  }
  if (G.area === "cave" && G.cave) {
    const s = G.cave;
    // (a price the hero can't pay yet shows red)
    for (const item of s.items) if (item.price > 0) drawText2C(c, String(item.price), (item.x + 8) * SC, RHUD + (item.y + 20) * SC, G.gems < item.price ? STYLE.ramps.red[3] : STYLE.ramps.water[3]);
    // (a notice board on the back wall: down by the door it sat on the hero's head)
    if (s.msg) { const w = textWidth2(s.msg) + 28; drawPanel(c, Math.round(RW / 2 - w / 2), RHUD + 18, w, 24); drawText2C(c, s.msg, RW / 2, RHUD + 26, STYLE.ramps.gold[3]); }
  }
  drawHUD2(c, hudState());
  if (G.area === "cave" && G.cave) drawCaveTalk(c, G.cave);
  drawBanner2(c);
  drawDialog2(c);
}

function renderTrans2(c) {
  const tr = G.trans;
  const p = tr.t / tr.dur;
  const W = RW, H = 352;
  let oox = 0, ooy = 0, nox = 0, noy = 0;
  if (tr.dir === LEFT) { oox = Math.round(p * W); nox = oox - W; }
  else if (tr.dir === RIGHT) { oox = -Math.round(p * W); nox = oox + W; }
  else if (tr.dir === UP) { ooy = Math.round(p * H); noy = ooy - H; }
  else { ooy = -Math.round(p * H); noy = ooy + H; }
  c.save();
  c.beginPath(); c.rect(0, RHUD, W, H); c.clip();
  c.drawImage(sceneSnapshot(tr.oldScene), oox, RHUD + ooy);
  c.drawImage(sceneSnapshot(tr.newScene), nox, RHUD + noy);
  // the hero rides along at the seam instead of vanishing
  drawHero2(c, oox, ooy);
  c.restore();
  drawHUD2(c, hudState());
}

let _redChecker = null;
// The hero lying on his side, head to the west (the standing model tipped over).
function fallenHeroFrame(sword, shield) {
  const m = heroPrims({ dir: DOWN, walk: -1, attack: -1, sword, shield });
  const R = mRotY(-Math.PI / 2), lift = [2, 0, 7];
  const decals = (m.decals || []).map(d => Object.assign({}, d, { p: vAdd(mVec(R, d.p), lift), face: mVec(R, d.face) }));
  return renderFit({ prims: xformPrims(m.prims, R, lift), decals }, false, 64, 48, 32, 36);
}
function renderDeath2(c) {
  const scene = currentScene();
  drawSceneFrame(c, scene, { actors: false });
  if (G.deathT > 130) {
    if (!_redChecker) {
      const pr = new Pix(RW, 352), col = pc("red", 1);
      for (let y = 0; y < 352; y++) for (let x = 0; x < RW; x++) if (((x + y) & 1) === 0) pr.d[y * RW + x] = col;
      _redChecker = pr.toCanvas();
    }
    c.drawImage(_redChecker, 0, RHUD);
  }
  // he spins, falls on his side, then fades away in a puff of smoke
  const sword = Math.max(1, G.inv.sword || 1), shield = Math.max(1, Math.min(3, G.inv.shield || 1));
  if (G.deathT > 85) {
    const spin = [DOWN, LEFT, UP, RIGHT][Math.floor((150 - G.deathT) / 5) % 4];
    blitFrame(c, heroSprite({ dir: spin, walk: -1, attack: -1, sword, shield }), (P.x + 8) * SC, (P.y + 15) * SC + RHUD);
  } else if (G.deathT > 36) {
    blitFrame(c, charFrame("hero|fallen|" + sword + shield, () => fallenHeroFrame(sword, shield)), (P.x + 8) * SC, (P.y + 15) * SC + RHUD);
  } else if (G.deathT > 12) {
    const fr = FX.poof[Math.min(5, Math.floor((36 - G.deathT) / 24 * 6))];
    c.drawImage(fr, Math.round((P.x + 8) * SC - 16 - fr.width / 2), Math.round((P.y + 12) * SC + RHUD - fr.height / 2));
  }
  drawHUD2(c, hudState());
}
