// constants.js — every gameplay tunable. Source/CS:GO values, Source units (1u ~ 1.905cm).

// ---- simulation -------------------------------------------------------
export const TICKRATE = 64;
export const TICK_DT = 1 / TICKRATE;
export const MAX_TICKS_PER_FRAME = 8;      // avoid death-spiral after a stall

// ---- movement (sv_* cvars) -------------------------------------------
export const GRAVITY = 800;
export const SV_ACCELERATE = 5.5;
export const SV_AIRACCELERATE = 12;
export const SV_FRICTION = 5.2;
export const SV_STOPSPEED = 80;
export const AIR_SPEED_CAP = 30;           // classic air-strafe cap
export const JUMP_IMPULSE = 301.993;       // sqrt(2*800*57)
export const MAX_SPEED = 320;              // sv_maxspeed, weapons clamp below this
export const STEP_SIZE = 18;
export const MAX_CLIMB_SLOPE = 0.7;        // cos of max walkable slope

export const HULL_HW = 16;                 // half width (32x32 hull)
export const STAND_H = 72;
export const DUCK_H = 54;
export const EYE_STAND = 64.09;
export const EYE_DUCK = 46.04;
export const DUCK_TIME = 0.31;
export const UNDUCK_TIME = 0.31;
export const WALK_MOD = 0.52;              // +speed
export const DUCK_MOD = 0.34;
export const LADDER_SPEED = 200;

export const FALL_SAFE_SPEED = 580;        // no damage below this
export const FALL_FATAL_SPEED = 1024;      // 100 damage at this
export const FALL_PUNCH_THRESHOLD = 350;

// ---- combat -----------------------------------------------------------
export const HITGROUP = { HEAD: 0, CHEST: 1, STOMACH: 2, ARM: 3, LEG: 4 };
export const HITGROUP_MULT = [4.0, 1.0, 1.25, 1.0, 0.75];
export const HITGROUP_NAME = ['head', 'chest', 'stomach', 'arm', 'leg'];
export const ARMOR_BONUS = 0.5;
export const MAX_HEALTH = 100;
export const MAX_ARMOR = 100;
export const VIEW_PUNCH_DECAY = 18;        // per second

// ---- match / rounds ---------------------------------------------------
export const FREEZE_TIME = 8;
export const ROUND_TIME = 115;             // 1:55
export const BUY_TIME = 20;
export const BOMB_TIMER = 40;
export const PLANT_TIME = 3.2;
export const DEFUSE_TIME = 10;
export const DEFUSE_TIME_KIT = 5;
export const ROUND_END_TIME = 5;
export const BOMB_RADIUS = 500;            // damage radius of the C4
export const BOMB_DAMAGE = 500;
export const WARMUP_TIME = 0;
export const TEAM_SIZE = 5;

// ---- economy ----------------------------------------------------------
export const START_MONEY = 800;
export const MAX_MONEY = 16000;
export const LOSS_BONUS = [1400, 1900, 2400, 2900, 3400];
export const WIN_ELIM = 3250;
export const WIN_TIME = 3250;              // CT win by time
export const WIN_BOMB = 3500;              // T win by detonation
export const WIN_DEFUSE = 3500;
export const PLANT_REWARD = 300;           // to the planter
export const PLANT_TEAM_REWARD = 800;      // to all Ts, even on a loss
export const DEFUSE_REWARD = 300;

// ---- teams ------------------------------------------------------------
export const TEAM = { NONE: 0, T: 1, CT: 2 };
export const TEAM_NAME = { 1: 'TERRORIST', 2: 'COUNTER-TERRORIST' };
export const TEAM_SHORT = { 1: 'T', 2: 'CT' };
export const TEAM_COLOR = { 1: '#d4a04a', 2: '#6a9fd8' };

// ---- bots -------------------------------------------------------------
export const DIFFICULTY = [
  { name: 'EASY',   react: [0.42, 0.72], aimErr: 5.2, aimSpeed: 4.5,  spray: 0.25, burst: [2, 4], fovDeg: 90,  hearing: 900,  accBonus: 0.55, greedy: 0.2 },
  { name: 'NORMAL', react: [0.26, 0.45], aimErr: 3.0, aimSpeed: 8.0,  spray: 0.5,  burst: [3, 6], fovDeg: 100, hearing: 1300, accBonus: 0.78, greedy: 0.45 },
  { name: 'HARD',   react: [0.17, 0.28], aimErr: 1.7, aimSpeed: 13.0, spray: 0.72, burst: [4, 8], fovDeg: 110, hearing: 1700, accBonus: 0.92, greedy: 0.7 },
  { name: 'EXPERT', react: [0.10, 0.18], aimErr: 0.9, aimSpeed: 19.0, spray: 0.9,  burst: [5, 11], fovDeg: 120, hearing: 2100, accBonus: 1.0, greedy: 0.9 },
];

export const BOT_NAMES_T = [
  'Yusuf', 'Dragan', 'Osman', 'Rasmus', 'Kirill', 'Farid', 'Tomas', 'Marek', 'Zoran', 'Emin',
];
export const BOT_NAMES_CT = [
  'Cooper', 'Brandt', 'Delacroix', 'Aoki', 'Vargas', 'Novak', 'Sterling', 'Hoffman', 'Renard', 'Byrne',
];

// ---- surfaces ---------------------------------------------------------
export const SURF = { SAND: 0, CONCRETE: 1, WOOD: 2, METAL: 3, DIRT: 4, TILE: 5 };
