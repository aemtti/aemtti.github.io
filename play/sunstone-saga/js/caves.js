"use strict";
// ---------- Caves: hermits, shops, gambling, donations; the homes of Brambleford ----------
// A cave is a single room with an NPC, text, and touchable items. The host's words type
// out in a talk box, a page at a time; Z finishes a page and turns to the next (see
// caveTalkPress). Gifts are taken by walking in; a ware with a price is bought with Z.

// Words for small counts in what people say.
const COUNT_WORDS = ["NO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX"];

// What people say as the shards come home: [fewest shards, lines], read by byShards.
const NEWS = {
  hermit: [
    [0, ["MAY THE ROAD BE KIND", "TO YOU, WANDERER."]],
    [2, ["THE SHARDS HUM IN", "YOUR PACK. MY OLD", "BLADE CHOSE WELL."]],
    [4, ["I HEAR THE KEEP'S", "SEAL GROANING EVEN", "FROM HERE. NOT LONG", "NOW."]],
    [6, ["GO NOW. THE DAWN IS", "IN YOUR HANDS."]],
  ],
  steel: [
    [0, ["STRIKE TRUE, WANDERER."]],
    [3, ["VEX ONCE STUDIED AT", "THE SAGE'S SIDE. HE", "KNOWS EVERY TRICK", "OF THE LIGHT."]],
    [6, ["NO SHADOW CAN STAND", "BEFORE SIX SHARDS."]],
  ],
  elder: [
    [0, ["SINCE THE SUNSTONE", "BROKE, OUR DAWNS COME", "GREY AND COLD. BE", "CAREFUL OUT THERE."]],
    [1, ["A SHARD OF THE", "SUNSTONE! OUR FIELDS", "FELT ITS WARMTH, EVEN", "FROM AFAR."]],
    [3, ["THE SKY GROWS BRIGHTER", "EACH DAY. THE CHILDREN", "PLAY OUTSIDE AGAIN."]],
    [5, ["ONE SHARD MORE AND", "THE KEEP'S SEAL WILL", "BREAK. BE BRAVE,", "CHILD."]],
    [6, ["ALL SIX! GO NORTH", "THROUGH THE PASS TO", "THE SHADOW KEEP AND", "BRING MAREN HOME."]],
  ],
  widow: [
    [0, ["MY HUSBAND CHARTED", "THE LAKE ISLES. ONE", "DAY HE SAILED NORTH", "AND DIDN'T COME HOME."]],
    [2, ["THE LAKE FEELS WARMER.", "THE FISH HAVE COME", "BACK TO THE SHALLOWS."]],
    [4, ["LAST NIGHT THE NORTH", "SKY GLOWED OVER THE", "PEAKS. IS THAT YOUR", "DOING?"]],
    [6, ["HE WOULD HAVE SAILED", "OUT JUST TO WATCH THE", "DAWN YOU'LL BRING."]],
  ],
  // (once the sunforged shield is made)
  smith: [
    [0, ["THAT SHIELD WILL", "OUTLAST US BOTH.", "SUNFIRE NEVER FADES."]],
    [6, ["GO ON, THEN. MY FORGE", "AND I WILL BE HERE", "WHEN YOU COME HOME."]],
  ],
  kids: [
    [0, ["MOM SAYS THE DAWN", "USED TO BE GOLDEN.", "I'VE NEVER SEEN IT!"]],
    [3, ["IT'S WARM OUT AGAIN!", "WE CAN PLAY OUTSIDE", "ALL DAY NOW."]],
    [4, ["WE SAW THE NORTH SKY", "GLOW FROM THE WELL!", "IS IT THE KEEP?"]],
    [6, ["WHEN THE DAWN COMES", "BACK, WILL YOU PLAY", "HIDE AND SEEK AGAIN?"]],
  ],
};
// The lines of the last entry the hero's shards reach.
function byShards(table) {
  let out = table[0][1];
  for (const [n, lines] of table) if (G.shards >= n) out = lines;
  return out;
}

// Hide and seek: three children of Brambleford hide around the vale.
const KIDS = [
  { id: "pip", cave: "kid_pip",
    found: ["AW, YOU FOUND ME!", "I'M PIP. NOBODY EVER", "LOOKS THIS FAR INTO", "THE WOODS!"],
    hint: ["PIP LOVES THE DEEP", "WOODS. HE HIDES IN A", "ROCKY HOLE FAR TO", "THE WEST."] },
  { id: "wren", cave: "kid_wren",
    found: ["NO FAIR! I'M WREN.", "I WAS SURE THE WAVES", "WOULD HIDE MY", "GIGGLING."],
    hint: ["WREN WENT TO THE", "LAKE. SHE KNOWS A", "CAVE ON THE SHORE", "NORTH OF THE DUNES."] },
  { id: "tam", cave: "kid_tam",
    found: ["OW, HOT! OKAY, OKAY,", "YOU GOT ME. I'M TAM.", "THAT BUSH WAS MY BEST", "SPOT EVER."],
    hint: ["TAM CRAWLED UNDER A", "THORN BUSH JUST EAST", "OF TOWN. BURN IT AND", "HE HAS TO COME OUT!"] },
];

// Flags set when a side quest hands over its heart piece (the record screen counts
// them). The donation spirit's piece is listed too, as nothing else counts it.
const QUEST_HEARTS = ["qh:chart", "qh:kids", "qh:bell", "cave:donate_hc"];

const LADDER_HINT = ["MY STEPLADDER WENT TO", "A HERMIT WHO HIDES IN", "A CRACKED CLIFF EAST", "OF THE NORTH FALLS."];

const CAVES = {
  hermit_sword: {
    npc: "npc_hermit",
    text: ["SINCE THE SUNSTONE", "BROKE, SHADOWS PROWL", "THE VALE. MY OLD", "BLADE GOES WITH YOU."],
    gift: "sword1", once: "g_sword1", news: "hermit",
    doneText: ["MAY THE ROAD BE KIND", "TO YOU, WANDERER."],
  },
  steel_sword: {
    npc: "npc_hermit",
    text: ["THE STEEL EDGE ANSWERS", "ONLY A STOUT HEART."],
    gift: "sword2", once: "g_sword2", reqHearts: 5, news: "steel",
    reqText: ["COME BACK WITH FIVE", "HEARTS OF COURAGE,", "AND THE STEEL EDGE", "IS YOURS."],
    doneText: ["STRIKE TRUE, WANDERER."],
  },
  dawn_blade: {
    npc: "npc_hermit",
    text: ["THE DAWNBLADE WAKES", "ONLY FOR A SPIRIT", "THAT BURNS BRIGHT."],
    gift: "sword3", once: "g_sword3", reqHearts: 12,
    reqText: ["YOUR SPIRIT IS STILL", "TOO DIM. TWELVE", "HEARTS MUST BURN", "WITHIN YOU."],
    doneText: ["LET THE DAWN CUT", "THE SHADOW DOWN."],
  },
  shop_a: {
    npc: "npc_shop", shop: true,
    text: ["WARES FOR GEMS. STEP", "UP TO ONE, AND I'LL", "TELL YOU ABOUT IT."],
    wares: [{ kind: "shield2", price: 90 }, { kind: "candle", price: 60 }, { kind: "bombs4", price: 20 }],
  },
  shop_b: {
    npc: "npc_shop", shop: true,
    text: ["A TRADER'S HOARD.", "SPEND FREELY."],
    wares: [{ kind: "bombs4", price: 20 }, { kind: "potion", price: 40 }, { kind: "key", price: 80 }],
  },
  shop_c: {
    npc: "npc_shop", shop: true,
    text: ["RARE GOODS FROM", "THE DUNE ROADS."],
    wares: [{ kind: "heartcont", price: 90, once: "shopc_hc" }, { kind: "potion", price: 40 }, { kind: "ring", price: 120, once: "shopc_ring" }],
  },
  // a guess costs ten gems; the three pouches hold 0, 5 and 15 (now and then 40), so
  // the house keeps about two gems a guess on average
  gamble: {
    npc: "npc_shop", gamble: true,
    text: ["FEELING LUCKY?", "TEN GEMS A GUESS."],
  },
  donate: {
    npc: "npc_hermit", donate: true,
    text: ["SPARE SOME GEMS FOR", "AN OLD SPIRIT?"],
  },
  gift30: { npc: "npc_hermit", text: ["I PANNED THESE GEMS", "FROM THE BROOK. THEY", "DO MORE GOOD IN YOUR", "PACK THAN IN MY JAR."], gift: "gems30", once: "g_gift30", doneText: ["THE BROOK STILL", "SHINES. SPEND WELL."] },
  gift10: { npc: "npc_hermit", text: ["A LITTLE KINDNESS", "FOR THE ROAD."], gift: "gems10", once: "g_gift10", doneText: ["WALK SAFELY."] },
  hint1: { npc: "npc_hermit", text: ["BURN THE LONE BUSH ON", "THE SOUTHERN MEADOWS.", "FLAME FINDS WHAT", "EYES CANNOT."] },
  hc_grave: { npc: "npc_hermit", text: ["A PIECE OF A HEART,", "FOR THE BOLD. FOUR", "MAKE ONE WHOLE."], gift: "heartpiece", once: "g_hc_grave", doneText: ["LIVE LONG, WANDERER."] },
  hc_forest: { npc: "npc_hermit", text: ["A PIECE OF A HEART,", "KEPT FROM THE CROWS."], gift: "heartpiece", once: "g_hc_forest", doneText: ["LIVE LONG, WANDERER."] },
  hc_desert: { npc: "npc_hermit", text: ["THE DUNES GUARD", "THEIR TREASURES."], gift: "heartpiece", once: "g_hc_desert", doneText: ["LIVE LONG, WANDERER."] },
  hc_mtn: { npc: "npc_hermit", text: ["THE PEAKS REWARD", "THE PERSISTENT."], gift: "heartpiece", once: "g_hc_mtn", doneText: ["LIVE LONG, WANDERER."] },
  // the far isle also keeps the widow's lost chart
  hc_isle: { npc: "npc_hermit", text: ["FEW SAIL THIS FAR.", "TAKE YOUR PRIZE."], gift: "heartpiece", once: "g_hc_isle", doneText: ["LIVE LONG, WANDERER."], talk: talkIsle },
  hc_islet: { npc: "npc_hermit", text: ["OVER ONE STRIDE OF", "WATER, A TREASURE."], gift: "heartpiece", once: "g_hc_islet", doneText: ["LIVE LONG, WANDERER."] },
  ladder_cave: { npc: "npc_hermit", text: ["THIS OLD STEPLADDER", "CROSSES NARROW WATERS."], gift: "ladder", once: "g_ladder", doneText: ["ONE STRIDE AT A TIME."] },
  // under a leaning stone in the boneyard: the elder's lost bell
  bell_crypt: { npc: "npc_hermit", text: ["A STORM BLEW A BELL", "DOWN MY STAIRS. IT", "RINGS ALL NIGHT. TAKE", "IT, PLEASE!"], gift: "bell", once: "g_bell", doneText: ["AH, QUIET AT LAST.", "REST WELL, WANDERER."] },
  // the hiding places of the children
  kid_pip: { npc: "npc_kid", text: KIDS[0].found, talk: talkKid },
  kid_wren: { npc: "npc_kid", text: KIDS[1].found, talk: talkKid },
  kid_tam: { npc: "npc_kid", text: KIDS[2].found, talk: talkKid },
  // Brambleford homes
  // the elder's fire mends every heart (heal), each visit
  house_elder: { room: "house", layout: 0, npc: "npc_elder", heal: true, text: NEWS.elder[0][1], talk: talkElder },
  // (forge: a candle flame can wake the forge in this house's furniture)
  house_smith: { room: "house", layout: 3, npc: "npc_smith", forge: true, text: ["HAMMER AND TONGS, AND", "NO FIRE TO USE THEM", "SINCE THE SUNSTONE", "BROKE."], talk: talkSmith },
  house_widow: { room: "house", layout: 1, npc: "npc_widow", text: NEWS.widow[0][1], talk: talkWidow },
  house_kids: { room: "house", layout: 2, npc: "npc_kid", text: NEWS.kids[0][1], talk: talkKids },
};

const DONATE_HINTS = [
  ["BOMB THE CRACKED CLIFF", "EAST OF THE FALLS: A", "STEPLADDER WAITS."],
  ["A LEANING STONE IN", "THE BONEYARD HIDES A", "BLADE."],
  ["THE NORTH PEAKS CRACK", "WHERE THE WIND SINGS."],
  ["AN ISLE IN THE LAKE", "KEEPS A PIECE OF LIFE."],
  ["THE DUNES SOUND", "HOLLOW SOUTH OF THE", "TRADE ROAD."],
  ["A BOULDER IN THE EAST", "PEAKS SITS ON A HEART.", "ONLY STRONG HANDS", "CAN SHIFT IT."],
];

// Who talks in each cave, on the talk box's name tab (by the host, unless the cave says).
const CAVE_WHO = { npc_hermit: "HERMIT", npc_shop: "TRADER", npc_elder: "ELDER", npc_smith: "SMITH", npc_widow: "WIDOW", npc_kid: "CHILDREN" };
const CAVE_WHO_BY_ID = { donate: "SPIRIT", kid_pip: "PIP", kid_wren: "WREN", kid_tam: "TAM" };
function caveWho(s) { return CAVE_WHO_BY_ID[s.id] || CAVE_WHO[s.def.npc] || null; }

// What a ware is for, told when the hero stands at it (at most two lines), and its short
// name in "BUY THE ... FOR n?".
const WARE_INFO = {
  shield2: ["SHIELD", "A MIRROR SHIELD. IT", "TURNS SPELLS ASIDE."],
  candle: ["CANDLE", "ITS FLAME BURNS BUSHES", "AND LIGHTS DARK ROOMS."],
  bombs4: ["BOMBS", "FOUR BOMBS, TO BLAST", "CRACKED WALLS OPEN."],
  potion: ["POTION", "DRINK IT AND EVERY", "HEART IS WHOLE AGAIN."],
  key: ["KEY", "A SMALL KEY. IT OPENS", "ONE LOCKED DOOR."],
  heartcont: ["HEART", "A WHOLE HEART, TO", "ADD TO YOUR OWN."],
  ring: ["RING", "A WARD RING. IT HALVES", "THE HURT OF EACH BLOW."],
};
// The prompt shown while the hero stands at a ware with a price: what it is, the price
// and how to say yes (Z buys it through caveItemTouched; walking off says no).
function warePrompt(s, item) {
  const def = s.def, yes = keyWord("a") + " - YES  WALK OFF - NO";
  if (def.gamble) return ["ONE POUCH HOLDS MORE", "THAN THE OTHERS.", "GUESS THIS ONE FOR 10?", yes];
  if (def.donate) {
    return item.kind === "donate20" ? ["GIVE THE SPIRIT 20", "GEMS FOR A WHISPER?", yes]
      : ["GIVE THE SPIRIT 60", "GEMS FOR ITS GIFT?", yes];
  }
  const info = WARE_INFO[item.kind] || [item.kind.toUpperCase(), ""];
  const lines = info.slice(1).filter(Boolean);
  const no = wareRefusal(item.kind);
  if (no) return lines.concat([no]);
  lines.push("BUY THE " + info[0] + " FOR " + item.price + "?");
  lines.push(G.gems < item.price ? "YOU NEED MORE GEMS." : yes);
  return lines;
}

// Wares, gifts and quest treasures stand one tile up from the floor's south edge, so each
// ware and its price sit on the floor, clear of the doorway where the hero comes in.
const CAVE_ITEM_Y = 104;
// The talk box under the host ends at this play-area y (logic), just over the tallest
// ware (gfx/worldview.js drawCaveTalk); while the hero walks above it, it drops lower.
const CAVE_BOX_BOTTOM = 104;

// Build a live cave session for entering `id`.
function setupCave(id) {
  const def = CAVES[id];
  const s = { id, def, items: [], lines: def.text.slice(), msg: null, done: false };
  const taken = def.once && G.flags["cave:" + def.once];
  const hearts = Math.floor(G.maxhp / 2);
  if (def.heal) {
    s.healed = G.hp < G.maxhp;
    // one harp tick per half heart mended, each a semitone higher (at most twelve)
    if (s.healed) for (let i = 0, n = Math.min(12, G.maxhp - G.hp); i < n; i++) Sound.sfx("heal_tick", { pitch: i, delay: 0.25 + i * 0.07 });
    G.hp = G.maxhp;
  }
  if (def.gift) {
    if (taken) {
      s.lines = (def.news ? byShards(NEWS[def.news]) : (def.doneText || ["..."])).slice();
    } else if (def.reqHearts && hearts < def.reqHearts) {
      s.lines = def.reqText.slice();
    } else {
      s.items.push({ kind: def.gift, x: 120, y: CAVE_ITEM_Y, price: 0 });
    }
  } else if (def.shop) {
    let xs = [72, 120, 168];
    let i = 0;
    for (const w of def.wares) {
      // sold out, or something the hero already has (or has no room for)
      if ((w.once && G.flags["cave:" + w.once]) || wareRefusal(w.kind)) { i++; continue; }
      s.items.push({ kind: w.kind, x: xs[i], y: CAVE_ITEM_Y, price: w.price, once: w.once });
      i++;
    }
  } else if (def.gamble) {
    // what each pouch pays back (the guess itself costs its price)
    const outcomes = [0, 5, Math.random() < 0.125 ? 40 : 15];
    // shuffle with unseeded Math.random — pure presentation
    for (let i = outcomes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [outcomes[i], outcomes[j]] = [outcomes[j], outcomes[i]];
    }
    const xs = [72, 120, 168];
    for (let i = 0; i < 3; i++) s.items.push({ kind: "gamble", x: xs[i], y: CAVE_ITEM_Y, price: 10, outcome: outcomes[i] });
  } else if (def.donate) {
    s.items.push({ kind: "donate20", x: 88, y: CAVE_ITEM_Y, price: 20 });
    if (!G.flags["cave:donate_hc"]) s.items.push({ kind: "donate60", x: 152, y: CAVE_ITEM_Y, price: 60 });
  }
  s.base = s.lines;
  setPages(s, [s.lines]);
  if (def.talk) def.talk(s);
  return s;
}

// What a host says, as one or more pages of lines (each types out afresh).
function setPages(s, pages) {
  s.pages = pages.filter(Boolean).map(p => p.slice());
  s.page = 0;
  showPage(s);
}
function showPage(s) {
  s.lines = s.pages[s.page] || [];
  s.talk = { li: 0, ci: 0, t: 0, done: !s.lines.length };
}
// Who speaks in a cave, by voice (sfx.js text blips): hermits and the elder low and dark,
// the traders plucked, the children bright; the smith and the widow the plain voice.
const CAVE_VOICE = { npc_hermit: "text_elder", npc_elder: "text_elder", npc_shop: "text_shop", npc_kid: "text_kid" };
// One tick of the talk box: the page types out two frames a letter, line by line, with
// a blip in the host's voice (ui.js textBlip).
function caveTalkStep(s) {
  const t = s.talk;
  if (!t || t.done) return;
  if (++t.t % 2) return;
  t.ci++;
  textBlip(CAVE_VOICE[s.def.npc], s.lines[t.li], t.ci);
  if (t.ci >= s.lines[t.li].length) {
    if (t.li < s.lines.length - 1) { t.li++; t.ci = 0; }
    else t.done = true;
  }
}
// Z in a cave: at a ware with a price it says yes (the purchase itself is
// caveItemTouched); else it finishes the page being typed, or turns to the next page
// (after the last, back to the first). True when the press was used.
function caveTalkPress(s) {
  if (s.focus && s.items.includes(s.focus)) { caveItemTouched(s, s.focus); return true; }
  if (!s.talk.done) { s.talk.done = true; return true; }
  if (s.pages.length < 2) return false;
  s.page = (s.page + 1) % s.pages.length;
  showPage(s);
  Sound.sfx("dlg_next");
  return true;
}
// The talk box as the screen shows it: the host's page, or while the hero stands at a
// ware with a price, what it is and the question (shown whole at once).
function caveTalkBox(s) {
  const who = caveWho(s);
  if (s.focus && s.items.includes(s.focus)) return { lines: warePrompt(s, s.focus), li: 0, ci: 0, done: true, who, more: false };
  const t = s.talk || { li: 0, ci: 0, done: true };
  return { lines: s.lines, li: t.li, ci: t.ci, done: t.done, who, more: s.pages.length > 1 };
}
// Say it again from the start after something changed (a quest step), with the
// quest's own items laid out afresh.
function refreshTalk(s) {
  s.items = s.items.filter(i => !i.flag);
  setPages(s, [s.base]);
  if (s.def.talk) s.def.talk(s);
}
// A quest reward or treasure lying before the host; taking it sets `flag`.
function questItem(s, kind, flag, x) {
  s.items.push({ kind, x: x || 120, y: CAVE_ITEM_Y, price: 0, flag });
}

// ---------- side quests ----------
// The elder's bell: a storm rolled it into the boneyard (bell_crypt); it earns a heart piece.
function talkElder(s) {
  const pages = [];
  if (G.flags["q:bell"] && !G.flags["qh:bell"]) {
    pages.push(["OUR BELL! YOU FOUND", "IT! IT WILL RING IN", "THE DAWN AGAIN. TAKE", "THIS, WITH OUR THANKS."]);
    questItem(s, "heartpiece", "qh:bell");
  }
  if (s.healed) pages.push(["REST BY MY FIRE,", "WANDERER. YOUR HEARTS", "ARE WHOLE AGAIN."]);
  pages.push(byShards(NEWS.elder));
  if (!G.flags["q:bell"]) pages.push(["A STORM ROLLED OUR", "HALL BELL INTO THE", "BONEYARD. A LEANING", "STONE HIDES IT NOW."]);
  setPages(s, pages);
}

// The widow's chart: her husband's last chart lies on the far isle (hc_isle, by raft).
function talkWidow(s) {
  const pages = [];
  if (G.flags["q:chart"] && !G.flags["qh:chart"]) {
    pages.push(["HIS CHART! EVERY ISLE", "IN HIS OWN HAND...", "THANK YOU. PLEASE,", "TAKE THIS."]);
    questItem(s, "heartpiece", "qh:chart");
  }
  pages.push(byShards(NEWS.widow));
  if (!G.flags["q:chart"]) pages.push(["HE LOST HIS LAST CHART", "ON THE FAR NORTH ISLE.", "A RAFT RUNS THERE FROM", "THE ISLAND DOCK."]);
  setPages(s, pages);
}
function talkIsle(s) {
  if (G.flags["q:chart"]) return;
  questItem(s, "chart", "q:chart", 168);
  setPages(s, [s.lines, ["A SAILOR'S CHART", "WASHED UP HERE.", "SOMEONE IN TOWN MUST", "MISS IT."]]);
}

// The smith's fire: once three shards bring warmth back, a candle flame wakes his
// forge and he beats the sunforged shield (it turns fire as well as spells).
function talkSmith(s) {
  const pages = [];
  if (G.inv.shield >= 3) pages.push(byShards(NEWS.smith));
  else if (G.flags["q:forge"]) {
    pages.push(["THE FORGE LIVES! I'VE", "BEATEN SUNFIRE INTO A", "SHIELD FOR YOU. IT", "TURNS EVEN FLAME."]);
    questItem(s, "shield3", "q:shield");
  } else if (G.shards >= 3) {
    pages.push(["FEEL THAT? THE AIR IS", "WARM AGAIN. PUT A", "FLAME TO MY FORGE AND", "IT MAY YET CATCH!"]);
    if (!G.inv.candle) pages.push(["NO CANDLE? THE TRADER", "TWO FIELDS WEST OF", "TOWN SELLS THEM."]);
  } else pages.push(s.def.text);
  if (!G.inv.ladder) pages.push(LADDER_HINT);
  setPages(s, pages);
}
// A candle flame indoors: the smith's cold forge takes it once three shards are home.
function caveFlame(px, py) {
  const s = G.cave;
  if (!s || !s.def.forge || G.flags["q:forge"]) return;
  const f = houseFurniture(s.def.layout).find(i => i.kind === "forge");
  if (!f) return;
  const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
  if (Math.abs(tx - f.tx) > 1 || ty < f.ty - 1 || ty > f.ty + 2) return;
  if (G.shards < 3) {
    Sound.sfx("denied");
    setPages(s, [["THE COALS HISS AND", "GO DARK. THE COLD OF", "THE BROKEN SUNSTONE", "RUNS TOO DEEP YET."]]);
    return;
  }
  G.flags["q:forge"] = 1;
  Sound.sfx("secret");
  addEffect("spark", "spark", f.tx * TS, f.ty * TS, 20);
  refreshTalk(s);
}

// Hide and seek: the kids' house counts who is still hidden and hints where; finding
// all three earns a heart piece there.
function talkKids(s) {
  const left = KIDS.filter(k => !G.flags["q:kid:" + k.id]);
  const pages = [];
  if (G.flags["qh:kids"]) pages.push(["YOU'RE THE BEST AT", "HIDE AND SEEK EVER!"]);
  else if (!left.length) {
    pages.push(["YOU FOUND ALL THREE!", "NOBODY EVER FINDS", "EVERYONE. HERE, THIS", "IS YOUR PRIZE!"]);
    questItem(s, "heartpiece", "qh:kids");
  } else {
    pages.push(["HIDE AND SEEK! " + COUNT_WORDS[left.length], "OF OUR FRIENDS " + (left.length === 1 ? "IS" : "ARE"), "STILL HIDING. CAN", "YOU FIND THEM?"]);
    for (const k of left) pages.push(k.hint);
  }
  pages.push(byShards(NEWS.kids));
  setPages(s, pages);
}
// A hiding child, found the first time the hero steps in.
function talkKid(s) {
  const k = KIDS.find(o => o.cave === s.id), flag = "q:kid:" + k.id;
  if (G.flags["qh:kids"]) { setPages(s, [["THAT WAS FUN! NEXT", "TIME I'LL HIDE EVEN", "BETTER."]]); return; }
  if (G.flags[flag]) { setPages(s, [["SHH! I'M STILL", "HIDING... FROM THE", "OTHERS, ANYWAY."]]); return; }
  G.flags[flag] = 1;
  Sound.sfx("secret");
  const left = KIDS.filter(o => !G.flags["q:kid:" + o.id]).length;
  s.msg = "FOUND " + (KIDS.length - left) + " OF " + KIDS.length;
  setPages(s, [k.found, left ? ["THERE " + (left === 1 ? "IS" : "ARE") + " " + COUNT_WORDS[left] + " MORE OF", "US STILL HIDING.", "GOOD LUCK!"] : ["THAT'S ALL OF US!", "GO TELL THEM AT HOME", "THAT YOU WON!"]]);
}

// Why the hero can't use a ware (he has it already, or no room for more); null if he can.
function wareRefusal(kind) {
  switch (kind) {
    case "shield2": return G.inv.shield >= 2 ? "YOU HAVE ONE ALREADY" : null;
    case "shield3": return G.inv.shield >= 3 ? "YOU HAVE ONE ALREADY" : null;
    case "potion": return G.inv.potion ? "YOU CARRY ONE ALREADY" : null;
    case "bombs4": return G.bombs >= G.bombMax ? "NO ROOM FOR MORE" : null;
    case "key": return G.keys >= 9 ? "NO ROOM FOR MORE" : null;
  }
  return G.inv[kind] ? "YOU HAVE ONE ALREADY" : null;
}

// Called when the player touches a cave item. Returns true if consumed.
function caveItemTouched(s, item) {
  if (item.takenNow) return false;
  const def = s.def;
  // a quest's treasure or reward: it is the hero's, and the host has more to say
  if (item.flag) {
    grantItem(item.kind);
    G.flags[item.flag] = 1;
    item.takenNow = true;
    s.items = s.items.filter(i => i !== item);
    refreshTalk(s);
    return true;
  }
  if (def.gift) {
    grantItem(item.kind);
    if (def.once) G.flags["cave:" + def.once] = 1;
    item.takenNow = true;
    s.items = s.items.filter(i => i !== item);
    return true;
  }
  if (def.shop) {
    const no = wareRefusal(item.kind);
    if (no) { Sound.sfx("denied"); s.msg = no; return false; }
    if (G.gems < item.price) { Sound.sfx("denied"); s.msg = "NOT ENOUGH GEMS"; return false; }
    G.gems -= item.price;
    grantItem(item.kind);
    Sound.sfx("buy");
    if (item.once) G.flags["cave:" + item.once] = 1;
    // (sold out, or now refused as setupCave would refuse it: it leaves the counter, not
    // stays there saying "YOU HAVE ONE ALREADY")
    if (item.once || wareRefusal(item.kind)) s.items = s.items.filter(i => i !== item);
    s.msg = "A FINE CHOICE";
    return true;
  }
  if (def.gamble) {
    if (s.done) return false;
    if (G.gems < item.price) { Sound.sfx("denied"); s.msg = "TEN GEMS TO PLAY"; return false; }
    const net = item.outcome - item.price;
    G.gems = clamp(G.gems + net, 0, 255);
    s.done = true;
    s.items = [];
    if (net > 0) { Sound.sfx("gamble_win"); s.msg = "FORTUNE SMILES! +" + net; }
    else { Sound.sfx("gamble_lose"); s.msg = "CRUEL LUCK! " + net; }
    return true;
  }
  if (def.donate) {
    if (G.gems < item.price) { Sound.sfx("denied"); s.msg = "TOO FEW GEMS"; return false; }
    G.gems -= item.price;
    if (item.kind === "donate20") {
      const idx = (G.hintIdx || 0) % DONATE_HINTS.length;
      G.hintIdx = idx + 1;
      setPages(s, [DONATE_HINTS[idx]]);
      Sound.sfx("donate");
      s.msg = "THE SPIRIT WHISPERS...";
      s.items = s.items.filter(i => i !== item);
    } else {
      G.flags["cave:donate_hc"] = 1;
      // (the heart piece's own banner tells of it; an older whisper note would sit under it)
      s.msg = null;
      grantItem("heartpiece");
      setPages(s, [["GENEROUS SOUL! TAKE", "THIS PIECE OF A HEART."]]);
      s.items = s.items.filter(i => i !== item);
    }
    return true;
  }
  return false;
}
