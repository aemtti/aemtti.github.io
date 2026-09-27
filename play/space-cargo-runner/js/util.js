// util.js - 공용 수학/유틸

const TAU = Math.PI * 2;

const Util = {
    clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); },
    lerp(a, b, t)    { return a + (b - a) * t; },
    rand(lo, hi)     { return lo + Math.random() * (hi - lo); },

    dist(ax, ay, bx, by) {
        const dx = ax - bx, dy = ay - by;
        return Math.hypot(dx, dy);
    },
    dist2(ax, ay, bx, by) {
        const dx = ax - bx, dy = ay - by;
        return dx*dx + dy*dy;
    },

    angleOf(dx, dy) { return Math.atan2(dy, dx); },

    angleDiff(a, b) {
        let d = (a - b) % TAU;
        if (d > Math.PI) d -= TAU;
        else if (d < -Math.PI) d += TAU;
        return d;
    },

    circleHit(ax, ay, ar, bx, by, br) {
        const dx = ax - bx, dy = ay - by;
        const r = ar + br;
        return dx*dx + dy*dy <= r*r;
    },

    // 선분 (x1,y1)-(x2,y2) 와 원 (cx,cy,cr) 교차 여부
    segmentCircleHit(x1, y1, x2, y2, cx, cy, cr) {
        const dx = x2 - x1, dy = y2 - y1;
        const len2 = dx * dx + dy * dy;
        if (len2 < 0.0001) {
            return Util.dist2(x1, y1, cx, cy) <= cr * cr;
        }
        let t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;
        const px = x1 + dx * t;
        const py = y1 + dy * t;
        const ddx = px - cx, ddy = py - cy;
        return ddx * ddx + ddy * ddy <= cr * cr;
    },

    hash32(x, y, seed = 1337) {
        let h = seed | 0;
        h = Math.imul(h ^ (x | 0), 2654435761);
        h = Math.imul(h ^ (y | 0), 1597334677);
        h ^= h >>> 16; h = Math.imul(h, 2246822507);
        h ^= h >>> 13; h = Math.imul(h, 3266489909);
        h ^= h >>> 16;
        return h >>> 0;
    },

    seededRng(seed) {
        let s = seed >>> 0;
        return function () {
            s = (s + 0x6D2B79F5) >>> 0;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    },
};

window.Util = Util;
window.TAU = TAU;
