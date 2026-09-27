"use strict";
// ---------- Keyboard input ----------
// arrows = move, Z = sword (A button), X = item (B button), Enter = start/pause
const Input = {
  down: {},          // currently held, by logical name
  hit: {},           // pressed this frame (edge), cleared at end of step
  _map: {
    "ArrowUp": "up", "ArrowDown": "down", "ArrowLeft": "left", "ArrowRight": "right",
    "KeyZ": "a", "KeyX": "b", "Enter": "start",
    "KeyM": "mute", "KeyS": "save", "F2": "debug",
  },
  init() {
    window.addEventListener("keydown", (e) => {
      const name = this._map[e.code];
      if (!name) return;
      e.preventDefault();
      if (!this.down[name]) this.hit[name] = true;
      this.down[name] = true;
      // Audio requires a user gesture; unlock on any mapped key.
      if (typeof Sound !== "undefined") Sound.unlock();
    });
    window.addEventListener("keyup", (e) => {
      const name = this._map[e.code];
      if (!name) return;
      e.preventDefault();
      this.down[name] = false;
    });
    window.addEventListener("blur", () => { this.down = {}; });
  },
  held(n) { return !!this.down[n]; },
  pressed(n) { return !!this.hit[n]; },
  // a press something else has answered (talk, a purchase) is not seen again this frame
  consume(n) { this.hit[n] = false; },
  endFrame() { this.hit = {}; },
};
