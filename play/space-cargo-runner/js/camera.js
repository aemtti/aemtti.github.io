// camera.js - 월드 좌표를 화면 좌표로 변환하는 카메라

class Camera {
    constructor() {
        this.x = 0; this.y = 0;
        this.zoom = 1;
        this.viewW = 0; this.viewH = 0;
        this.shake = 0;
    }

    resize(w, h) { this.viewW = w; this.viewH = h; }

    follow(target, dt) {
        const lookahead = 0.25;
        const tx = target.x + target.vx * lookahead;
        const ty = target.y + target.vy * lookahead;
        const k = 1 - Math.exp(-dt * 4);
        this.x += (tx - this.x) * k;
        this.y += (ty - this.y) * k;
        this.shake *= Math.exp(-dt * 6);
    }

    addShake(amount) {
        this.shake = Math.min(this.shake + amount, 24);
    }

    worldToScreen(wx, wy) {
        const sx = (wx - this.x) * this.zoom + this.viewW * 0.5;
        const sy = (wy - this.y) * this.zoom + this.viewH * 0.5;
        return [sx, sy];
    }
    screenToWorld(sx, sy) {
        const wx = (sx - this.viewW * 0.5) / this.zoom + this.x;
        const wy = (sy - this.viewH * 0.5) / this.zoom + this.y;
        return [wx, wy];
    }

    apply(ctx) {
        ctx.save();
        const sx = this.shake ? (Math.random() - 0.5) * this.shake : 0;
        const sy = this.shake ? (Math.random() - 0.5) * this.shake : 0;
        ctx.translate(this.viewW * 0.5 + sx, this.viewH * 0.5 + sy);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.x, -this.y);
    }
    restore(ctx) { ctx.restore(); }

    isVisible(wx, wy, pad = 64) {
        const [sx, sy] = this.worldToScreen(wx, wy);
        return sx >= -pad && sy >= -pad && sx <= this.viewW + pad && sy <= this.viewH + pad;
    }
}

window.Camera = Camera;
