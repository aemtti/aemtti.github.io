"use strict";
// ---------- Procedural pixel-art sprite factory ----------
// All art is original, defined as ASCII pixel maps and baked to canvases.

const PAL = {
  black: "#000000", white: "#FCFCFC", ltGray: "#BCBCBC", gray: "#7C7C7C", dkGray: "#404040",
  skin: "#F8B878", hair: "#88500C",
  blue: "#0058F8", ltBlue: "#3CBCFC", dkBlue: "#0000A8",
  green: "#00A844", ltGreen: "#B8F818", dkGreen: "#005024",
  brown: "#AC7C00", dkBrown: "#503000", tan: "#FCD8A8",
  red: "#F83800", dkRed: "#A81000", orange: "#FC9838", yellow: "#FCE05C",
  purple: "#9878F8", dkPurple: "#4428BC", pink: "#F878F8", cyan: "#00E8D8",
};

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

// rows: array of strings; map: char -> color. '.' (and space) = transparent.
function buildSprite(rows, map) {
  const h = rows.length, w = rows[0].length;
  const c = makeCanvas(w, h);
  const g = c.getContext("2d");
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === "." || ch === " " || ch === undefined) continue;
      const col = map[ch];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

function hflipCanvas(src) {
  const c = makeCanvas(src.width, src.height);
  const g = c.getContext("2d");
  g.translate(src.width, 0);
  g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  return c;
}
function vflipCanvas(src) {
  const c = makeCanvas(src.width, src.height);
  const g = c.getContext("2d");
  g.translate(0, src.height);
  g.scale(1, -1);
  g.drawImage(src, 0, 0);
  return c;
}

const SPR = {};    // name -> canvas
const SPRF = {};   // name -> white-flash variant (built lazily)

function flashOf(name) {
  if (SPRF[name]) return SPRF[name];
  const src = SPR[name];
  const c = makeCanvas(src.width, src.height);
  const g = c.getContext("2d");
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = "source-atop";
  g.fillStyle = "#FCFCFC";
  g.fillRect(0, 0, c.width, c.height);
  SPRF[name] = c;
  return c;
}

function drawSpr(ctx, name, x, y, flash) {
  const c = flash ? flashOf(name) : SPR[name];
  if (!c) return;
  ctx.drawImage(c, Math.round(x), Math.round(y));
}

// ============================================================
// Sprite definitions
// ============================================================
function buildAllSprites() {
  const P = PAL;
  const def = (name, rows, map) => { SPR[name] = buildSprite(rows, map); };
  const defFlip = (name, from) => { SPR[name] = hflipCanvas(SPR[from]); };

  // ---------- HERO (blue-cloaked wanderer "Rill") ----------
  const heroMap = { h: P.hair, s: P.skin, t: P.ltBlue, u: P.blue, d: P.dkBrown, k: P.black, w: P.white };
  def("hero_d0", [
    "................",
    ".....hhhhhh.....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    "....sssssss.....",
    "....sks.sks.....",
    "....sssssss.....",
    ".....sssss......",
    "....ttttttt.....",
    "...ttutttutt....",
    "...sttttttts....",
    "...s.ttttt.s....",
    ".....tt.tt......",
    ".....dd.dd......",
    "....ddd.ddd.....",
    "................",
  ], heroMap);
  def("hero_d1", [
    "................",
    ".....hhhhhh.....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    "....sssssss.....",
    "....sks.sks.....",
    "....sssssss.....",
    ".....sssss......",
    "....ttttttt.....",
    "...ttutttutt....",
    "...sttttttts....",
    "...s.ttttt.s....",
    ".....tt.tt......",
    ".....dd.dd......",
    "...ddd..........",
    "..........ddd...",
  ], heroMap);
  def("hero_u0", [
    "................",
    ".....hhhhhh.....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    ".....hhhhhh.....",
    ".....sssss......",
    "....ttttttt.....",
    "...ttttttttt....",
    "...sttttttts....",
    "...s.ttttt.s....",
    ".....tt.tt......",
    ".....dd.dd......",
    "....ddd.ddd.....",
    "................",
  ], heroMap);
  def("hero_u1", [
    "................",
    ".....hhhhhh.....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    ".....hhhhhh.....",
    ".....sssss......",
    "....ttttttt.....",
    "...ttttttttt....",
    "...sttttttts....",
    "...s.ttttt.s....",
    ".....tt.tt......",
    ".....dd.dd......",
    "..ddd...........",
    "..........ddd...",
  ], heroMap);
  def("hero_r0", [
    "................",
    ".....hhhhhh.....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    ".....ssssss.....",
    ".....ss.sks.....",
    ".....ssssss.....",
    "......ssss......",
    "....tttttt......",
    "....tttttttt....",
    "....ttttttss....",
    "....ttttttt.....",
    ".....tt.tt......",
    ".....dd.dd......",
    ".....ddd.ddd....",
    "................",
  ], heroMap);
  def("hero_r1", [
    "................",
    ".....hhhhhh.....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    ".....ssssss.....",
    ".....ss.sks.....",
    ".....ssssss.....",
    "......ssss......",
    "....tttttt......",
    "....tttttttt....",
    "....ttttttss....",
    "....ttttttt.....",
    "......ttt.......",
    "....dd..dd......",
    "...ddd...ddd....",
    "................",
  ], heroMap);
  defFlip("hero_l0", "hero_r0");
  defFlip("hero_l1", "hero_r1");

  // attack poses (arm thrust; the sword itself is a separate sprite)
  def("hero_atk_d", [
    "................",
    ".....hhhhhh.....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    "....sssssss.....",
    "....sks.sks.....",
    "....sssssss.....",
    ".....sssss......",
    "....ttttttt.....",
    "...ttutttutt....",
    "...sttttttss....",
    "...s.ttttt.s....",
    ".....tt.tt.s....",
    ".....dd.dd......",
    "....ddd.ddd.....",
    "................",
  ], heroMap);
  def("hero_atk_u", [
    "...........s....",
    ".....hhhhhhs....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    ".....hhhhhh.....",
    ".....sssss......",
    "....ttttttt.....",
    "...ttttttttt....",
    "...sttttttts....",
    "...s.ttttt......",
    ".....tt.tt......",
    ".....dd.dd......",
    "....ddd.ddd.....",
    "................",
  ], heroMap);
  def("hero_atk_r", [
    "................",
    ".....hhhhhh.....",
    "....hhhhhhhh....",
    "....hhhhhhhh....",
    ".....ssssss.....",
    ".....ss.sks.....",
    ".....ssssss.....",
    "......ssss......",
    "....tttttt......",
    "....tttttttss...",
    "....tttttttss...",
    "....ttttttt.....",
    ".....tt.tt......",
    ".....dd.dd......",
    ".....ddd.ddd....",
    "................",
  ], heroMap);
  defFlip("hero_atk_l", "hero_atk_r");

  // ---------- SWORDS (held blades, one per facing) ----------
  const swordMap = { g: P.ltGray, w: P.white, y: P.brown, k: P.black };
  def("sword_d", [
    "..y.",
    ".yyy",
    "..y.",
    ".ww.",
    ".ww.",
    ".ww.",
    ".ww.",
    ".gg.",
    "..g.",
  ], swordMap);
  def("sword_u", [
    "..g.",
    ".gg.",
    ".ww.",
    ".ww.",
    ".ww.",
    ".ww.",
    "..y.",
    ".yyy",
    "..y.",
  ], swordMap);
  def("sword_r", [
    ".........",
    "y........",
    "yywwwwgg.",
    "y........",
  ], swordMap);
  defFlip("sword_l", "sword_r");

  // sword beams (flicker pair)
  def("beam_v0", [".w.", "wcw", ".w.", "wcw", ".w.", "wcw", ".w.", "wcw"], { w: P.white, c: P.cyan });
  def("beam_v1", [".c.", "cwc", ".c.", "cwc", ".c.", "cwc", ".c.", "cwc"], { w: P.white, c: P.cyan });
  def("beam_h0", [".w.w.w.w", "wcwcwcwc", ".w.w.w.w"], { w: P.white, c: P.cyan });
  def("beam_h1", [".c.c.c.c", "cwcwcwcw", ".c.c.c.c"], { w: P.white, c: P.cyan });

  // ---------- NPCs ----------
  def("npc_hermit", [
    "................",
    ".....ggggg......",
    "....ggggggg.....",
    "....gsssssg.....",
    "....gsksksg.....",
    "....gssssgg.....",
    ".....wwww.......",
    "....gggggg..y...",
    "...gggggggg.y...",
    "...ggggggggyy...",
    "...g.gggg.g.y...",
    "...g.gggg...y...",
    "....gggggg..y...",
    "....gg..gg..y...",
    "...ggg..ggg.....",
    "................",
  ], { g: P.gray, s: P.skin, k: P.black, w: P.white, y: P.brown });
  def("npc_shop", [
    "................",
    ".....hhhhh......",
    "....hhhhhhh.....",
    "....sssssss.....",
    "....sks.sks.....",
    "....sssssss.....",
    ".....sssss......",
    "....rrrrrrr.....",
    "...rrrrrrrrr....",
    "...srwwwwwrs....",
    "...s.wwwww.s....",
    ".....wwwww......",
    ".....rr.rr......",
    ".....dd.dd......",
    "....ddd.ddd.....",
    "................",
  ], { h: P.dkBrown, s: P.skin, k: P.black, r: P.red, w: P.white, d: P.dkBrown });
  def("npc_sage", [
    "................",
    ".....yyyyy......",
    "....yyyyyyy.....",
    "....ysssssy.....",
    "....ysksksy.....",
    "....yssssyy.....",
    ".....sssss......",
    "....wwwwwww.....",
    "...wwwywywww....",
    "...swwwwwwws....",
    "...s.wwwww.s....",
    ".....wwwww......",
    ".....wwwww......",
    ".....ww.ww......",
    "....www.www.....",
    "................",
  ], { y: P.yellow, s: P.skin, k: P.black, w: P.white });

  // cave flames
  def("flame0", [
    "................",
    "......r.........",
    "......r..r......",
    ".....rr.rr......",
    ".....rrrrr......",
    "....rrorrrr.....",
    "....rooorrr.....",
    "...rroooorr.....",
    "...rooyooorr....",
    "...royyyoorr....",
    "...royyyyorr....",
    "....oyyyyo......",
    ".....yyyy.......",
    "....dddddd......",
    "...dddddddd.....",
    "................",
  ], { r: P.red, o: P.orange, y: P.yellow, d: P.dkBrown });
  def("flame1", [
    "................",
    ".........r......",
    "......r..r......",
    "......rr.rr.....",
    "......rrrrr.....",
    ".....rrrrorr....",
    ".....rrrooor....",
    ".....rroooorr...",
    "....rrooyooor...",
    "....rrooyyyor...",
    "....rroyyyyor...",
    "......oyyyyo....",
    ".......yyyy.....",
    "....dddddd......",
    "...dddddddd.....",
    "................",
  ], { r: P.red, o: P.orange, y: P.yellow, d: P.dkBrown });

  // ---------- OVERWORLD ENEMIES ----------
  // Grubkin: slow round wanderer (red / blue variants)
  const grubRows0 = [
    "................",
    "................",
    "....aaaaaa......",
    "...aaaaaaaa.....",
    "..aawaawaaaa....",
    "..akwakwaaaa....",
    "..aawaawaaaa....",
    "..aaaaaaaaaa....",
    "..abbbbbbbba....",
    "..babbbbbbab....",
    "..babbbbbbab....",
    "...abbbbbba.....",
    "....a.aa.a......",
    "...aa.aa.aa.....",
    "................",
    "................",
  ];
  const grubRows1 = [
    "................",
    "................",
    "....aaaaaa......",
    "...aaaaaaaa.....",
    "..aawaawaaaa....",
    "..akwakwaaaa....",
    "..aawaawaaaa....",
    "..aaaaaaaaaa....",
    "..abbbbbbbba....",
    "..babbbbbbab....",
    "..babbbbbbab....",
    "...abbbbbba.....",
    "....aa..aa......",
    "...a.a..a.a.....",
    "................",
    "................",
  ];
  def("grub_r0", grubRows0, { a: P.red, b: P.orange, w: P.white, k: P.black });
  def("grub_r1", grubRows1, { a: P.red, b: P.orange, w: P.white, k: P.black });
  def("grub_b0", grubRows0, { a: P.blue, b: P.ltBlue, w: P.white, k: P.black });
  def("grub_b1", grubRows1, { a: P.blue, b: P.ltBlue, w: P.white, k: P.black });

  // Snapbud: projectile-spitting plant
  def("snap0", [
    "................",
    "....rrrrrr......",
    "...rrkkkkrr.....",
    "..rrkwwwwkrr....",
    "..rkwwwwwwkr....",
    "..rkwwwwwwkr....",
    "..rrkwwwwkrr....",
    "...rrkkkkrr.....",
    "....rrrrrr......",
    "......gg........",
    "..g...gg...g....",
    "...g..gg..g.....",
    "....g.gg.g......",
    ".....gggg.......",
    "......gg........",
    "................",
  ], { r: P.red, k: P.black, w: P.white, g: P.green });
  def("snap1", [
    "................",
    "....rrrrrr......",
    "...rrrrrrrr.....",
    "..rrrrrrrrrr....",
    "..rrrkkkkrrr....",
    "..rrkkkkkkrr....",
    "..rrrkkkkrrr....",
    "...rrrrrrrr.....",
    "....rrrrrr......",
    "......gg........",
    "..g...gg...g....",
    "...g..gg..g.....",
    "....g.gg.g......",
    ".....gggg.......",
    "......gg........",
    "................",
  ], { r: P.red, k: P.black, g: P.green });

  // Stonecaster: mountain rock-thrower
  def("caster0", [
    "................",
    "....gggggg......",
    "...gggggggg.....",
    "...gwkggwkg.....",
    "...gggggggg.....",
    "...ggkkkkgg.....",
    "....gggggg......",
    "..ggbbbbbbgg....",
    ".gg.bbbbbb.gg...",
    ".g..bbbbbb..g...",
    "....bbbbbb......",
    "....bb..bb......",
    "....bb..bb......",
    "...bbb..bbb.....",
    "................",
    "................",
  ], { g: P.gray, b: P.brown, w: P.white, k: P.black });
  def("caster1", [
    "......c.........",
    "....gccc........",
    "....gggggg......",
    "...gggggggg.....",
    "...gwkggwkg.....",
    "...gggggggg.....",
    "...ggkkkkgg.....",
    "....gggggg......",
    "..ggbbbbbbgg....",
    ".g..bbbbbb.gg...",
    "....bbbbbb..g...",
    "....bb..bb......",
    "....bb..bb......",
    "...bbb..bbb.....",
    "................",
    "................",
  ], { g: P.gray, b: P.brown, w: P.white, k: P.black, c: P.ltGray });

  // Sandmaw: burrower (mound + emerged)
  def("maw_mound", [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "......ss........",
    ".....ssss.......",
    "....ssssss......",
    "...ssssssss.....",
    "..ssssssssss....",
    "................",
    "................",
    "................",
  ], { s: P.tan });
  def("maw_up0", [
    "................",
    "....w..w..w.....",
    "...ww..w..ww....",
    "...rwwwwwwwr....",
    "...rrwwwwrrr....",
    "...rrrrrrrrr....",
    "...rkkrrrkkr....",
    "...rrrrrrrrr....",
    "...rrrrrrrrr....",
    "....rrrrrrr.....",
    "....sssssss.....",
    "...sssssssss....",
    "..sssssssssss...",
    "................",
    "................",
    "................",
  ], { w: P.white, r: P.orange, k: P.black, s: P.tan });
  def("maw_up1", [
    "................",
    "....w..w..w.....",
    "...ww..w..ww....",
    "...rwwwwwwwr....",
    "...rrwwwwrrr....",
    "...rrrrrrrrr....",
    "...rrkkrkkrr....",
    "...rrrrrrrrr....",
    "...rrrrrrrrr....",
    "....rrrrrrr.....",
    "....sssssss.....",
    "..sssssssssss...",
    "...sssssssss....",
    "................",
    "................",
    "................",
  ], { w: P.white, r: P.orange, k: P.black, s: P.tan });

  // Flitterwing: bat
  def("bat0", [
    "................",
    "................",
    "................",
    "..pp........pp..",
    ".pppp......pppp.",
    ".pppppppppppppp.",
    "..pppppppppppp..",
    "....pppppppp....",
    ".....pwppwp.....",
    ".....pkppkp.....",
    "......pppp......",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { p: P.dkPurple, w: P.white, k: P.black });
  def("bat1", [
    "................",
    "................",
    "................",
    "................",
    "................",
    "....pp....pp....",
    "...pppppppppp...",
    "....pppppppp....",
    ".....pwppwp.....",
    ".....pkppkp.....",
    "......pppp......",
    "....pp....pp....",
    "................",
    "................",
    "................",
    "................",
  ], { p: P.dkPurple, w: P.white, k: P.black });

  // Wisp: healing fairy
  def("wisp0", [
    "................",
    "................",
    "................",
    "......ww........",
    ".....wyyw.......",
    "..w..wyyw..w....",
    ".www.wyyw.www...",
    "..w.wyyyyw.w....",
    "....wyyyyw......",
    ".....wyyw.......",
    "......ww........",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { w: P.white, y: P.yellow });
  def("wisp1", [
    "................",
    "................",
    "................",
    "......ww........",
    ".....wyyw.......",
    ".....wyyw.......",
    "..wwwyyyywww....",
    "....wyyyyw......",
    "....wyyyyw......",
    ".....wyyw.......",
    "......ww........",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { w: P.white, y: P.yellow });

  // ---------- DUNGEON ENEMIES ----------
  // Oozelet (small blob) and Ooze (large splitter)
  def("oozelet0", [
    "................",
    "................",
    "................",
    "................",
    "................",
    "......gggg......",
    ".....gggggg.....",
    "....gggggggg....",
    "....gwg..gwg....",
    "....gggggggg....",
    ".....gggggg.....",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { g: P.dkGreen, w: P.white });
  def("oozelet1", [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    ".....gggggg.....",
    "....gggggggg....",
    "...ggwg..gwgg...",
    "...gggggggggg...",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { g: P.dkGreen, w: P.white });
  def("ooze0", [
    "................",
    "................",
    "....gggggggg....",
    "...gggggggggg...",
    "..gggggggggggg..",
    "..ggwwgggwwggg..",
    "..ggwkgggwkggg..",
    "..gggggggggggg..",
    "..gggggggggggg..",
    "..ggggkkkkgggg..",
    "..gggggggggggg..",
    "...gggggggggg...",
    "....gggggggg....",
    "................",
    "................",
    "................",
  ], { g: P.green, w: P.white, k: P.black });
  def("ooze1", [
    "................",
    "................",
    "................",
    "....gggggggg....",
    "...gggggggggg...",
    "..ggwwgggwwggg..",
    "..ggwkgggwkggg..",
    "..gggggggggggg..",
    "..gggggggggggg..",
    "..ggggkkkkgggg..",
    "..gggggggggggg..",
    ".gggggggggggggg.",
    ".gggggggggggggg.",
    "................",
    "................",
    "................",
  ], { g: P.green, w: P.white, k: P.black });

  // Ironshell: knight, immune from the front
  const ironMap = { a: P.ltGray, b: P.gray, k: P.black, r: P.red, s: P.skin, w: P.white };
  def("iron_d0", [
    "................",
    ".....aaaaa......",
    "....aaaaaaa.....",
    "....akkkkka.....",
    "....akwkwka.....",
    "....aakkkaa.....",
    ".....aaaaa......",
    "...bbbbbbbbb....",
    "..bbrbbbbbrbb...",
    "..bbbbbbbbbbb...",
    "..b.bbbbbbb.b...",
    "....bbbbbbb.....",
    "....bb...bb.....",
    "....bb...bb.....",
    "...bbb...bbb....",
    "................",
  ], ironMap);
  def("iron_d1", [
    "................",
    ".....aaaaa......",
    "....aaaaaaa.....",
    "....akkkkka.....",
    "....akwkwka.....",
    "....aakkkaa.....",
    ".....aaaaa......",
    "...bbbbbbbbb....",
    "..bbrbbbbbrbb...",
    "..bbbbbbbbbbb...",
    "..b.bbbbbbb.b...",
    "....bbbbbbb.....",
    "....bb...bb.....",
    "...bbb...bb.....",
    "..........bbb...",
    "................",
  ], ironMap);
  def("iron_u0", [
    "................",
    ".....aaaaa......",
    "....aaaaaaa.....",
    "....aaaaaaa.....",
    "....aaaaaaa.....",
    "....aaaaaaa.....",
    ".....aaaaa......",
    "...bbbbbbbbb....",
    "..bbbbbbbbbbb...",
    "..bbbrrrrrbbb...",
    "..b.bbbbbbb.b...",
    "....bbbbbbb.....",
    "....bb...bb.....",
    "....bb...bb.....",
    "...bbb...bbb....",
    "................",
  ], ironMap);
  def("iron_u1", [
    "................",
    ".....aaaaa......",
    "....aaaaaaa.....",
    "....aaaaaaa.....",
    "....aaaaaaa.....",
    "....aaaaaaa.....",
    ".....aaaaa......",
    "...bbbbbbbbb....",
    "..bbbbbbbbbbb...",
    "..bbbrrrrrbbb...",
    "..b.bbbbbbb.b...",
    "....bbbbbbb.....",
    "....bb...bb.....",
    "...bb....bbb....",
    "..bbb...........",
    "................",
  ], ironMap);
  def("iron_r0", [
    "................",
    ".....aaaaa......",
    "....aaaaaaa.....",
    "....aaakkka.....",
    "....aaakwka.....",
    "....aaaakka.....",
    ".....aaaaa......",
    "....bbbbbbb.....",
    "...bbbbbbbbb....",
    "...bbbbbbrbb....",
    "...bbbbbbbbb....",
    "....bbbbbbb.....",
    "....bb...bb.....",
    "....bb...bb.....",
    "...bbb...bbb....",
    "................",
  ], ironMap);
  def("iron_r1", [
    "................",
    ".....aaaaa......",
    "....aaaaaaa.....",
    "....aaakkka.....",
    "....aaakwka.....",
    "....aaaakka.....",
    ".....aaaaa......",
    "....bbbbbbb.....",
    "...bbbbbbbbb....",
    "...bbbbbbrbb....",
    "...bbbbbbbbb....",
    "....bbbbbbb.....",
    ".....bbbbb......",
    "....bb..bb......",
    "...bbb...bbb....",
    "................",
  ], ironMap);
  defFlip("iron_l0", "iron_r0");
  defFlip("iron_l1", "iron_r1");

  // Hexer: teleporting wizard
  def("hexer0", [
    "................",
    ".....ppppp......",
    "....ppppppp.....",
    "....pkkkkkp.....",
    "....pkwkwkp.....",
    "....pkkkkkp.....",
    ".....ppppp......",
    "....ppppppp.....",
    "...ppppppppp....",
    "...puppppppup...",
    "...puppppppup...",
    "....ppppppp.....",
    "....ppppppp.....",
    "....pp...pp.....",
    "...ppp...ppp....",
    "................",
  ], { p: P.purple, u: P.dkPurple, k: P.black, w: P.white });
  def("hexer1", [
    "..u..........u..",
    "..u..ppppp...u..",
    "..u.ppppppp..u..",
    "..uupkkkkkpuuu..",
    "....pkwkwkp.....",
    "....pkkkkkp.....",
    ".....ppppp......",
    "....ppppppp.....",
    "...ppppppppp....",
    "...ppppppppp....",
    "...ppppppppp....",
    "....ppppppp.....",
    "....ppppppp.....",
    "....pp...pp.....",
    "...ppp...ppp....",
    "................",
  ], { p: P.purple, u: P.dkPurple, k: P.black, w: P.white });

  // Clutcher: crawling hand that drags you to the entrance
  def("clutch0", [
    "................",
    "................",
    "...s..s..s......",
    "...ss.ss.ss.....",
    "...ss.ss.ss.s...",
    "...ssssssssss...",
    "..ssssssssss....",
    "..sssssssss.....",
    "..sssssssss.....",
    "..ssssssss......",
    "...ssssss.......",
    "....ssss........",
    "................",
    "................",
    "................",
    "................",
  ], { s: P.tan });
  def("clutch1", [
    "................",
    "................",
    "................",
    "...s..s..s......",
    "...ss.ss.ss.s...",
    "...ssssssssss...",
    "..ssssssssss....",
    "..sssssssss.....",
    "..sssssssss.....",
    "..ssssssss......",
    "...ssssss.......",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { s: P.tan });

  // Spiketrap
  def("spiketrap", [
    "................",
    "......kk........",
    "...k..kk..k.....",
    "...kk.kk.kk.....",
    "....kkkkkk......",
    ".kkkkggggkkkk...",
    "...kggggggk.....",
    "...kggwgggk.....",
    "...kggggggk.....",
    ".kkkkggggkkkk...",
    "....kkkkkk......",
    "...kk.kk.kk.....",
    "...k..kk..k.....",
    "......kk........",
    "................",
    "................",
  ], { k: P.dkGray, g: P.gray, w: P.white });

  // ---------- PROJECTILES ----------
  def("proj_rock", ["..gg..", ".gggg.", "gggggg", ".gggg.", "..gg.."], { g: P.gray });
  def("proj_seed", [".gg.", "gggg", "gggg", ".gg."], { g: P.dkGreen });
  def("proj_magic0", [".p.", "ppp", ".p.", "ppp", ".p."], { p: P.pink });
  def("proj_magic1", [".w.", "www", ".w.", "www", ".w."], { w: P.white });
  def("arrow_v", ["..w..", ".www.", "..y..", "..y..", "..y..", "..y..", "..y..", ".yyy."], { w: P.white, y: P.brown });
  def("arrow_h", [
    "........",
    ".y....w.",
    "yyyyyyww",
    ".y....w.",
    "........",
  ], { y: P.brown, w: P.white });
  def("boom0", [
    "www.....",
    "wbww....",
    "wwbw....",
    ".wwbw...",
    "..wbbw..",
    "...wbbw.",
    "....www.",
    "........",
  ], { w: P.brown, b: P.dkBrown });
  def("boom1", [
    "....www.",
    "...wbbw.",
    "..wbbw..",
    ".wwbw...",
    "wwbw....",
    "wbww....",
    "www.....",
    "........",
  ], { w: P.brown, b: P.dkBrown });
  def("bomb", [
    "....ww..",
    "...w....",
    "..kkk...",
    ".kkkkk..",
    "kkwkkkk.",
    "kkkkkkk.",
    ".kkkkk..",
    "..kkk...",
  ], { k: P.dkBlue, w: P.white });
  def("boomexp0", [
    "................",
    "....w.....w.....",
    ".....w.o.w......",
    "..w...ooo...w...",
    "...w.ooooo.w....",
    "....oooyooo.....",
    "..w.ooyyyoo.w...",
    "....oooyooo.....",
    "...w.ooooo.w....",
    "..w...ooo...w...",
    ".....w.o.w......",
    "....w.....w.....",
    "................",
    "................",
    "................",
    "................",
  ], { w: P.white, o: P.orange, y: P.yellow });
  def("boomexp1", [
    "................",
    "..o.........o...",
    "....o.....o.....",
    "......o.o.......",
    "...o...o...o....",
    ".....o...o......",
    "..o....o....o...",
    ".....o...o......",
    "...o...o...o....",
    "......o.o.......",
    "....o.....o.....",
    "..o.........o...",
    "................",
    "................",
    "................",
    "................",
  ], { o: P.orange });

  // ---------- EFFECTS ----------
  def("poof0", [
    "................",
    "................",
    "....ww..ww......",
    "...wwwwwwww.....",
    "..wwwwwwwwww....",
    "..wwwwwwwwww....",
    "...wwwwwwww.....",
    "....ww..ww......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { w: P.ltGray });
  def("poof1", [
    "................",
    "..w...ww...w....",
    "...w.wwww.w.....",
    "..w.ww..ww.w....",
    "....w....w......",
    "..w.ww..ww.w....",
    "...w.wwww.w.....",
    "..w...ww...w....",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { w: P.ltGray });
  def("sparkle", [
    "....w....",
    "....w....",
    "..w.w.w..",
    "...www...",
    "wwwwywwww",
    "...www...",
    "..w.w.w..",
    "....w....",
    "....w....",
  ], { w: P.white, y: P.yellow });

  // ---------- ITEMS / PICKUPS ----------
  def("it_sword1", ["...y....", "..yyy...", "...y....", "..www...", "..www...", "..www...", "..www...", "..www...", "..www...", "...w...."].map(r => r.padEnd(8, ".")), { y: P.brown, w: P.ltGray });
  def("it_sword2", ["...y....", "..yyy...", "...y....", "..www...", "..www...", "..www...", "..www...", "..www...", "..www...", "...w...."].map(r => r.padEnd(8, ".")), { y: P.blue, w: P.white });
  def("it_sword3", ["...y....", "..yyy...", "...y....", "..www...", "..www...", "..www...", "..www...", "..www...", "..www...", "...w...."].map(r => r.padEnd(8, ".")), { y: P.red, w: P.yellow });
  def("it_shield", [
    ".bbbbbb.",
    "bbwwwwbb",
    "bwbbbbwb",
    "bwbwwbwb",
    "bwbwwbwb",
    "bwbbbbwb",
    ".bwwwwb.",
    "..bbbb..",
  ], { b: P.blue, w: P.white });
  def("it_boomer", ["ww......", "wbw.....", "wwbw....", ".wwbw...", "..wbbw..", "...wbbw.", "....www.", "........"], { w: P.brown, b: P.dkBrown });
  def("it_bomb", ["....ww..", "...w....", "..kkk...", ".kkkkk..", "kkwkkkk.", "kkkkkkk.", ".kkkkk..", "..kkk..."], { k: P.dkBlue, w: P.white });
  def("it_bow", [
    ".y......",
    "y.y.....",
    "y..y....",
    "y...y...",
    "w....y..",
    "y...y...",
    "y..y....",
    "y.y.....",
    ".y......",
  ], { y: P.brown, w: P.white });
  def("it_candle", ["...y....", "..yyy...", "..yoy...", "...w....", "..rrr...", "..rrr...", "..rrr...", "..rrr...", "..rrr..."], { y: P.yellow, o: P.orange, w: P.white, r: P.red });
  def("it_ladder", ["y....y", "yyyyyy", "y....y", "y....y", "yyyyyy", "y....y", "y....y", "yyyyyy", "y....y"], { y: P.tan });
  def("it_raft", ["yyyyyyyy", "ybybybyb", "yyyyyyyy", "ybybybyb", "yyyyyyyy"], { y: P.brown, b: P.dkBrown });
  def("it_ring", ["..rrrr..", ".r....r.", "r..yy..r", "r..yy..r", ".r....r.", "..rrrr.."], { r: P.red, y: P.yellow });
  def("it_potion", ["..www...", "...w....", "..rrr...", ".rrrrr..", ".rrrrr..", ".rrrrr..", "..rrr..."], { w: P.white, r: P.red });
  def("it_key", ["..yy....", ".y..y...", ".y..y...", "..yy....", "...y....", "...yy...", "...y....", "...yy..."], { y: P.yellow });
  def("it_map", ["wwwwww..", "wggggw..", "wgwwgw..", "wggggw..", "wgggww..", "wwwwww.."], { w: P.tan, g: P.dkGreen });
  def("it_compass", ["..yy....", ".yyyy...", "yyryyy..", "yyryyy..", ".yyyy...", "..yy...."], { y: P.yellow, r: P.red });
  def("it_shard", [
    ".......y........",
    "......yyy.......",
    "......yyy.......",
    ".....yyoyy......",
    ".....yyoyy......",
    "....yyooyyy.....",
    "....yyyyyyy.....",
    "...yyyyyyyyy....",
    "..yyyyyyyyyyy...",
    "................",
  ], { y: P.yellow, o: P.orange });
  def("it_heartcont", [
    ".rr..rr.",
    "rrrrrrrr",
    "rwrrrrrr",
    "rrrrrrrr",
    ".rrrrrr.",
    "..rrrr..",
    "...rr...",
    "........",
  ], { r: P.red, w: P.white });
  def("pick_heart", [".rr.rr.", "rrrrrrr", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."], { r: P.red });
  def("pick_gem1", ["..cc..", ".cccc.", "cccccc", ".cccc.", "..cc.."], { c: P.cyan });
  def("pick_gem5", ["..cc..", ".cccc.", "cccccc", ".cccc.", "..cc.."], { c: P.yellow });
  def("pick_bomb", ["..kk..", ".kkkk.", "kkwkkk", "kkkkkk", ".kkkk.", "..kk.."], { k: P.dkBlue, w: P.white });
  def("fairy_heart8", [".rr.rr.", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."], { r: P.red });

  // HUD mini icons
  def("hud_heart_full", [".rr.rr..", "rrrrrrr.", "rrrrrrr.", ".rrrrr..", "..rrr...", "...r....", "........", "........"], { r: P.red });
  def("hud_heart_half", [".rr.dd..", "rrrrddd.", "rrrrddd.", ".rrrdd..", "..rrd...", "...r....", "........", "........"], { r: P.red, d: P.dkGray });
  def("hud_heart_empty", [".dd.dd..", "ddddddd.", "ddddddd.", ".ddddd..", "..ddd...", "...d....", "........", "........"], { d: P.dkGray });
  def("hud_gem", ["...c....", "..ccc...", ".ccccc..", ".ccccc..", "..ccc...", "...c....", "........", "........"], { c: P.cyan });
  def("hud_key", [".yy.....", "y..y....", ".yy.....", ".y......", ".yy.....", ".y......", ".yy.....", "........"], { y: P.yellow });
  def("hud_bomb", ["...w....", "..k.....", ".kkk....", "kkkkk...", "kwkkk...", "kkkkk...", ".kkk....", "........"], { k: P.dkBlue, w: P.white });

  // ---------- BOSSES ----------
  // Cinderwyrm (32x32 dragon)
  const wyrmMap = { g: P.green, d: P.dkGreen, y: P.yellow, o: P.orange, w: P.white, k: P.black, r: P.red };
  def("wyrm0", [
    "................................",
    "..........gggg..................",
    ".........gggggg.....gg..........",
    "........gggggggg...gggg.........",
    "........gwkggggg..gggggg........",
    "........ggggggggggggggggg.......",
    "....ooggggggggggggggggggg.......",
    "...oyooggggddggggggggggggg......",
    "....ooggggggddggggggggggggg.....",
    "........ggggggddgggggggggggg....",
    ".........ggggggddggggggggggg....",
    "..........ggggggddgggggggggg....",
    "...........ggggggggggggggggg....",
    "...........gggggggggggggggg.....",
    "..........ggggggggggggggg.......",
    ".........ggggdddddddggg.........",
    ".........gggggggggggggg.........",
    "..........gggggggggggggg........",
    "...........ggggggggggggg........",
    "............gggggggggggg........",
    "............ggg....ggg..........",
    "...........ggg.....ggg..........",
    "..........ggg......ggg..........",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ], wyrmMap);
  def("wyrm1", [
    "................................",
    "..........gggg..................",
    ".........gggggg.....gg..........",
    "........gggggggg...gggg.........",
    "........gwkggggg..gggggg........",
    "........ggggggggggggggggg.......",
    "..rrggggggggggggggggggggg.......",
    ".rryrrggggddgggggggggggggg......",
    "..rrggggggggddgggggggggggga.....",
    "........ggggggddgggggggggggg....",
    ".........ggggggddggggggggggg....",
    "..........ggggggddgggggggggg....",
    "...........ggggggggggggggggg....",
    "...........gggggggggggggggg.....",
    "..........ggggggggggggggg.......",
    ".........ggggdddddddggg.........",
    ".........gggggggggggggg.........",
    "..........gggggggggggggg........",
    "...........ggggggggggggg........",
    "............gggggggggggg........",
    "............ggg....ggg..........",
    "...........ggg.....ggg..........",
    "..........ggg......ggg..........",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ], wyrmMap);

  // Marrowworm segments
  def("worm_head0", [
    "................",
    "....pppppp......",
    "...pppppppp.....",
    "..ppwwppwwpp....",
    "..ppwkppwkpp....",
    "..pppppppppp....",
    "..pppppppppp....",
    "..ppkkkkkkpp....",
    "...pppppppp.....",
    "....pppppp......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { p: P.orange, w: P.white, k: P.black });
  def("worm_head1", [
    "................",
    "....pppppp......",
    "...pppppppp.....",
    "..ppwwppwwpp....",
    "..ppwkppwkpp....",
    "..pppppppppp....",
    "..ppkkkkkkpp....",
    "..pkkkkkkkkp....",
    "...pppppppp.....",
    "....pppppp......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { p: P.orange, w: P.white, k: P.black });
  def("worm_seg", [
    "................",
    "................",
    "....pppppp......",
    "...pppppppp.....",
    "...pyypppyp.....",
    "...pppppppp.....",
    "...pppppppp.....",
    "...pyppppyp.....",
    "...pppppppp.....",
    "....pppppp......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ], { p: P.red, y: P.orange });

  // Gazer (32x32 eye beast)
  def("gazer_closed", [
    "................................",
    "..........pppppppppp............",
    ".......ppppppppppppppppp........",
    ".....ppppppppppppppppppppp......",
    "....ppppppppppppppppppppppp.....",
    "...ppp..ppppppppppppppp..ppp....",
    "..ppp....ppppppppppppp....ppp...",
    "..pppppppppppppppppppppppppp....",
    ".ppppppppppppppppppppppppppppp..",
    ".pppppppppkkkkkkkkkkpppppppppp..",
    ".ppppppkkkkkkkkkkkkkkkkpppppp...",
    ".pppppppppkkkkkkkkkkppppppppp...",
    ".ppppppppppppppppppppppppppppp..",
    "..pppppppppppppppppppppppppp....",
    "..ppp....ppppppppppppp....ppp...",
    "...ppp..ppppppppppppppp..ppp....",
    "....ppppppppppppppppppppppp.....",
    ".....ppppppppppppppppppppp......",
    ".......ppppppppppppppppp........",
    "..........pppppppppp............",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ], { p: P.dkPurple, k: P.black });
  def("gazer_open", [
    "................................",
    "..........pppppppppp............",
    ".......ppppppppppppppppp........",
    ".....ppppppppppppppppppppp......",
    "....ppppppppppppppppppppppp.....",
    "...ppp..ppppppppppppppp..ppp....",
    "..ppp....pppwwwwwwppp.....ppp...",
    "..ppppppppwwwwwwwwwwpppppppp....",
    ".pppppppwwwwwwwwwwwwwwpppppppp..",
    ".ppppppwwwwwrrrrrrwwwwwwpppppp..",
    ".ppppppwwwwrrrkkrrrwwwwwppppp...",
    ".ppppppwwwwrrrkkrrrwwwwwppppp...",
    ".ppppppwwwwwrrrrrrwwwwwwpppppp..",
    "..ppppppwwwwwwwwwwwwwwpppppp....",
    "..ppp....wwwwwwwwwww......ppp...",
    "...ppp..ppppwwwwppppppp..ppp....",
    "....ppppppppppppppppppppppp.....",
    ".....ppppppppppppppppppppp......",
    ".......ppppppppppppppppp........",
    "..........pppppppppp............",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ], { p: P.dkPurple, k: P.black, w: P.white, r: P.red });

  // Vex, the Shadow Tyrant (32x32)
  const vexMap = { k: P.dkGray, d: P.black, r: P.red, w: P.white, p: P.dkPurple };
  def("vex0", [
    "................................",
    "...........kkkkkkkk.............",
    "..........kkkkkkkkkk............",
    ".........kkkkkkkkkkkk...........",
    ".........kkrrkkkkrrkk...........",
    ".........kkrwkkkkrwkk...........",
    ".........kkkkkkkkkkkk...........",
    "..........kkkkkkkkkk............",
    ".......ppppkkkkkkkkpppp.........",
    "......pppppppkkkkppppppp........",
    ".....ppppppppppppppppppppp......",
    "....pppp.pppppppppppp.pppp......",
    "....ppp..pppppppppppp..ppp......",
    "....pp...pppppppppppp...pp......",
    "....pp...pppppppppppp...pp......",
    "....p....pppppppppppp....p......",
    ".........pppppppppppp...........",
    ".........pppppppppppp...........",
    "..........pppppppppp............",
    "..........pppppppppp............",
    "...........pppppppp.............",
    "...........pppppppp.............",
    "............pppppp..............",
    "............pppppp..............",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ], vexMap);
  def("vex1", [
    "................................",
    "...........kkkkkkkk.............",
    "..........kkkkkkkkkk............",
    ".........kkkkkkkkkkkk...........",
    ".........kkrrkkkkrrkk...........",
    ".........kkrwkkkkrwkk...........",
    ".........kkkkkkkkkkkk...........",
    "..........kkkkkkkkkk............",
    ".....pp.ppppkkkkkkkkpppp.pp.....",
    "....pppppppppkkkkppppppppppp....",
    "...pppppppppppppppppppppppppp...",
    "...pppp.pppppppppppppppp.pppp...",
    "...ppp..pppppppppppppppp..ppp...",
    "...pp...pppppppppppppppp...pp...",
    "........pppppppppppppppp........",
    ".........pppppppppppppp.........",
    ".........pppppppppppppp.........",
    "..........pppppppppppp..........",
    "..........pppppppppppp..........",
    "...........pppppppppp...........",
    "...........pppppppppp...........",
    "............pppppppp............",
    "............pppppppp............",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ], vexMap);

  // Vex shadow bolt
  def("vexbolt0", ["..k..", ".kpk.", "kpwpk", ".kpk.", "..k.."], { k: P.black, p: P.dkPurple, w: P.white });
  def("vexbolt1", ["..p..", ".pkp.", "pkwkp", ".pkp.", "..p.."], { k: P.black, p: P.dkPurple, w: P.white });

  // Boss fireball
  def("fireball0", ["..oo..", ".oyyo.", "oyyyyo", "oyyyyo", ".oyyo.", "..oo.."], { o: P.red, y: P.orange });
  def("fireball1", ["..oo..", ".oyyo.", "oyyyyo", "oyyyyo", ".oyyo.", "..oo.."], { o: P.orange, y: P.yellow });

  // directional arrow variants
  SPR.arrow_d = vflipCanvas(SPR.arrow_v);
  SPR.arrow_l = hflipCanvas(SPR.arrow_h);
}
