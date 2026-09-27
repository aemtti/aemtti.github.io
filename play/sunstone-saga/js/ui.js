"use strict";
// ---------- Dialogs, title, inventory, game over, win (the pictures are in gfx/) ----------

// ---------- Dialog (used for the gate, Maren's voice & odd messages) ----------
// (`who` names the speaker on the box's tab; a box opens with a soft sound, the next box
// of the same talk turns like a page, and the last one closes)
let dlgChain = false;
function startDialog(lines, cb, who) {
  G.dialog = { lines, li: 0, ci: 0, t: 0, done: false, cb, who: who || null };
  if (!dlgChain) Sound.sfx("dlg_open");
}
// One text blip per three letters typed (and on a '?' or '!'), in the speaker's own voice
// (sfx.js: text_maren, text_elder, text_kid, text_shop, text_vex, or the plain text): a
// line that asks lifts 3 semitones, a line that exclaims is 2 dB louder.
function textBlip(voice, line, ci) {
  const ch = line.charAt(ci - 1);
  if (ci % 3 !== 0 && ch !== "?" && ch !== "!") return;
  Sound.sfx(voice || "text", { pitch: line.indexOf("?") >= 0 ? 3 : 0, gain: line.indexOf("!") >= 0 ? 2 : 0 });
}
// Several boxes one after another (each at most four lines), then `done`.
function sayBoxes(boxes, done, who) {
  const next = (i) => { if (i < boxes.length) startDialog(boxes[i], () => next(i + 1), who); else if (done) done(); };
  next(0);
}

// ---------- Maren's voice: a scene after each shard is won ----------
// (the box's name tab says who speaks: MAREN_WHO)
const MAREN_WHO = "MAREN";
const SHARD_VOICE = {
  1: [["A VOICE FROM AFAR...", "RILL, CAN YOU HEAR ME?", "I AM MAREN, SAGE OF", "THE FLAME."],
      ["THE SHARDS REMEMBER", "THE LIGHT THEY HELD.", "EACH ONE YOU CARRY", "BRINGS DAWN NEARER."]],
  2: [["VEX WAS MY PUPIL ONCE,", "THE BRIGHTEST I EVER", "TAUGHT."],
      ["HE WANTED THE DAWN FOR", "HIMSELF ALONE. WHEN I", "REFUSED HIM, HE BROKE", "THE SUNSTONE."]],
  3: [["THREE SHARDS! WARMTH", "STIRS IN THE VALE", "AGAIN."],
      ["ENOUGH TO WAKE A COLD", "FORGE, I THINK. THE", "SMITH OF BRAMBLEFORD", "SHOULD HEAR OF IT."]],
  4: [["FOUR SHARDS. THE SEAL", "ON THE SHADOW KEEP", "TREMBLES!"],
      ["ITS STONES GLOW AT THE", "SHARDS' CALL. VEX", "KNOWS YOU ARE COMING.", "BE WARY, RILL."]],
  5: [["FIVE SHARDS! ONLY ONE", "IS LEFT IN THE DARK."]],
  6: [["ALL SIX SHARDS! I HEAR", "YOU CLEAR AS A BELL.", "THE SEAL CAN BE", "BROKEN NOW."],
      ["CLIMB THE MOUNTAIN", "PASS TO THE SHADOW", "KEEP, AND BRING THE", "DAWN HOME."]],
};
// Where each level's shard lies, as Maren tells of the last one.
const SHARD_PLACES = {
  1: ["UNDER THE ISLE IN", "THE GREAT LAKE."], 2: ["IN A WARREN UNDER", "THE WESTERN WOODS."],
  3: ["BELOW THE BONEYARD", "IN THE NORTHWEST."], 4: ["IN A VAULT UNDER", "THE SOUTHERN DUNES."],
  5: ["IN A WELL OF ICE", "AMONG THE WEST PEAKS."], 6: ["IN A BURNING DEEP", "AMONG THE EAST PEAKS."],
};
// The boxes of Maren's voice for the n-th shard. After the fifth she names the place
// of the one still missing (usually the burning deep).
function shardVoice(n) {
  const boxes = (SHARD_VOICE[n] || []).slice();
  if (n === SHARDS_NEEDED - 1) {
    let left = 6;
    for (let d = 1; d <= 6; d++) {
      const k = Object.keys(DUNGEONS[d].rooms).find(key => DUNGEONS[d].rooms[key].item === "shard");
      if (k && !G.flags["d" + d + ":item:" + k]) left = d;
    }
    boxes.push(["THE LAST SHARD LIES"].concat(SHARD_PLACES[left], ["FIND IT, RILL!"]));
  }
  return boxes;
}
function updateDialog() {
  const d = G.dialog;
  if (!d) return;
  d.t++;
  if (!d.done) {
    if (d.t % 2 === 0) {
      d.ci++;
      textBlip(d.who === MAREN_WHO ? "text_maren" : "text", d.lines[d.li], d.ci);
      if (d.ci >= d.lines[d.li].length) {
        if (d.li < d.lines.length - 1) { d.li++; d.ci = 0; }
        else d.done = true;
      }
    }
    if (Input.pressed("a") || Input.pressed("start")) { d.done = true; }
  } else if (Input.pressed("a") || Input.pressed("b") || Input.pressed("start")) {
    G.dialog = null;
    dlgChain = true;
    try { if (d.cb) d.cb(); } finally { dlgChain = false; }
    Sound.sfx(G.dialog ? "dlg_next" : "dlg_close");
  }
}

// ---------- Title / story ----------
// (the pages themselves are drawn by gfx/screens2.js)
function updateTitle() {
  G.titleT++;
  if (G.titleT > 600 && !G.titleMenu) { G.mode = "story"; G.storyY = 0; G.storyThenPlay = false; return; }
  if (!G.titleMenu) {
    if (Input.pressed("start")) { G.titleMenu = true; G.menuIdx = 0; Sound.sfx("title_start"); }
    return;
  }
  if (Input.pressed("up") || Input.pressed("down")) {
    G.menuIdx = 1 - G.menuIdx;
    Sound.sfx("cursor");
  }
  if (Input.pressed("start") || Input.pressed("a")) {
    // a new quest opens with the telling of the tale (Enter skips it)
    if (G.menuIdx === 0) { G.mode = "story"; G.storyY = 0; G.storyThenPlay = true; Sound.sfx("ui_confirm"); }
    else { Sound.sfx("ui_confirm"); loadViaFile(); }
  }
}
function updateStory() {
  G.storyY += 0.5;
  const done = G.storyY > storyEnd();
  if (Input.pressed("start") || Input.pressed("a") || done) {
    if (G.storyThenPlay) { G.storyThenPlay = false; newGame(); }
    else { G.mode = "title"; G.titleT = 0; G.titleMenu = false; }
  }
}

// ---------- Inventory / pause ----------
// The X items in the pause page's order (their pictures: screens2.js B_ITEM_MODEL).
const B_ITEMS = ["boomerang", "bomb", "bow", "candle", "hook", "hammer", "potion"];
function bItemOwned(kind) {
  switch (kind) {
    case "boomerang": return !!G.inv.boomerang;
    case "bomb": return G.bombs > 0;
    case "bow": return !!G.inv.bow;
    case "candle": return !!G.inv.candle;
    case "hook": return !!G.inv.hook;
    case "hammer": return !!G.inv.hammer;
    case "potion": return !!G.inv.potion;
  }
  return false;
}
function updateInventory() {
  if (Input.pressed("start")) { G.mode = G.invReturn || "play"; Sound.sfx("menu_close"); return; }
  if (Input.pressed("left")) { G.invCursor = (G.invCursor + B_ITEMS.length - 1) % B_ITEMS.length; Sound.sfx("cursor"); }
  if (Input.pressed("right")) { G.invCursor = (G.invCursor + 1) % B_ITEMS.length; Sound.sfx("cursor"); }
  if (Input.pressed("a") || Input.pressed("b")) {
    const kind = B_ITEMS[G.invCursor];
    if (bItemOwned(kind)) { G.bItem = kind; Sound.sfx("ui_confirm"); }
    else Sound.sfx("denied");
  }
  if (Input.pressed("save")) {
    // (a refusal is told on this page, by the save line: see drawInventory2)
    if (canSaveNow()) saveGame();
    else { Sound.sfx("denied"); G.saveNote = 150; }
  }
}
// ---------- Game over / win ----------
function updateGameOver() {
  if (Input.pressed("up") || Input.pressed("down")) { G.menuIdx = (G.menuIdx + 1) % 3; Sound.sfx("cursor"); }
  if (Input.pressed("start") || Input.pressed("a")) {
    if (G.menuIdx === 0) { Sound.sfx("ui_confirm"); continueGame(); }
    else if (G.menuIdx === 1) { saveGame(); }
    else { Sound.sfx("ui_back"); G.mode = "title"; G.titleT = 0; G.titleMenu = false; Sound.music("title"); }
  }
}
// (the game-over page and the ending live in gfx/screens2.js; the doors are drawn by
// gfx/room.js and gfx/doors.js)
