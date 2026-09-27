/**
 * Constants — Shared configuration values used across all modules.
 * Centralizes magic numbers so they can be tuned in one place.
 */

// ── Player ──────────────────────────────────────────────
export const PLAYER_HEIGHT = 1.7;           // Camera Y position (meters)
export const PLAYER_RADIUS = 0.35;          // Collision cylinder radius
export const PLAYER_WALK_SPEED = 3.0;       // m/s
export const PLAYER_RUN_SPEED = 5.0;        // m/s
export const PLAYER_CROUCH_SPEED = 1.5;     // m/s
export const PLAYER_CROUCH_HEIGHT = 1.0;    // Camera Y when crouching

export const MOUSE_SENSITIVITY = 0.002;     // Radians per pixel of mouse delta
export const PITCH_LIMIT = Math.PI / 2 - 0.05; // Clamp vertical look (just under 90°)

export const GRAVITY = 20.0;               // m/s² downward acceleration
export const STEP_HEIGHT = 0.35;           // Max step-up for stairs

// ── Footsteps ───────────────────────────────────────────
export const FOOTSTEP_WALK_INTERVAL = 0.55; // Seconds between footstep events (walking)
export const FOOTSTEP_RUN_INTERVAL = 0.35;  // Seconds between footstep events (running)

// ── Flashlight ──────────────────────────────────────────
export const FLASHLIGHT_ANGLE = Math.PI / 6;       // SpotLight cone angle (30°)
export const FLASHLIGHT_RANGE = 20;                 // Light distance (meters)
export const FLASHLIGHT_INTENSITY = 2.0;            // Light brightness
export const FLASHLIGHT_BATTERY_MAX = 100;           // Full charge
export const FLASHLIGHT_DRAIN_RATE = 2.0;           // Units per second
export const FLASHLIGHT_FLICKER_THRESHOLD = 15;     // Battery level to start flickering

// ── Enemy ───────────────────────────────────────────────
export const ENEMY_PATROL_SPEED = 1.5;
export const ENEMY_INVESTIGATE_SPEED = 2.5;
export const ENEMY_CHASE_SPEED = 4.5;

export const HEAR_RANGE_WALK = 15;
export const HEAR_RANGE_RUN = 22;
export const HEAR_RANGE_CROUCH = 7;
export const HEAR_RANGE_WALL_FACTOR = 0.53;

export const SIGHT_RANGE = 20;
export const SIGHT_CONE = Math.PI / 2;     // 90° total

export const CHASE_LOSE_TIMER = 5;         // Seconds before switching to SEARCH
export const SEARCH_DURATION = 30;
export const SEARCH_SPOT_CHECK_TIME = 2;
export const SEARCH_BASE_DETECT = 0.30;
export const SEARCH_RUNNING_BONUS = 0.20;
export const SEARCH_FLASHLIGHT_OFF_BONUS = -0.10;

export const INVESTIGATE_DURATION = 8;
export const INVESTIGATE_LOOK_TIME = 3;

// ── Game States ─────────────────────────────────────────
export const GameState = Object.freeze({
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    HIDING: 'HIDING',
    ENDING: 'ENDING',
});

// ── Room / Surface ──────────────────────────────────────
export const SurfaceType = Object.freeze({
    WOOD: 'wood',
    TILE: 'tile',
    CONCRETE: 'concrete',
    METAL: 'metal',
});
