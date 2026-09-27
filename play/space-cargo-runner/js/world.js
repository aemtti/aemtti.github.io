// world.js - 청크 기반 무한 절차적 월드.

class World {
    constructor(seed = 1337) {
        this.seed = seed >>> 0;
        this.CHUNK = 1024;
        this.activeRadius = 2;
        this.cullRadius = 4;
        this.chunks = new Map();
        this.spawnedChunks = new Set();
        this.entities = [];     // bullet/cargo/fuel/enemy/rescue 등 동적
        // MerchantShip / PirateMerchant 는 청크의 statics 가 아닌 entities 로 다룸 (이동 가능)
        // (단, 초기 스폰 위치는 청크에서 결정)
        this.player = null;
        this.camera = null;
        this.rescueShip = null;

        const s = window.Settings;
        this.asteroidPreset    = s ? s.asteroidPreset()  : { min: 3, max: 7 };
        this.enemyPreset       = s ? s.enemyPreset()     : { beacon: [0,2], normal: [0,3], hotChance: 0.03 };
        this.merchantChanceVal = s ? s.beaconChance()    : 0.20;          // 정규 상선
        this.shipyardChanceVal = s ? s.shipyardChance()  : 0.10;
        this.pirateChanceVal   = this.merchantChanceVal * 0.6;            // 해적 상선 - 정규의 60%
    }

    spawn(e) { this.entities.push(e); }
    setPlayer(p) {
        this.player = p;
        if (!this.entities.includes(p)) this.entities.push(p);
    }
    setCamera(c) { this.camera = c; }

    callRescue() {
        if (!this.player || !this.player.alive) return false;
        if (!this.player.outOfFuel) return false;
        if (this.rescueShip && this.rescueShip.alive) return false;
        const ang = Math.random() * TAU;
        const dist = 1100;
        const sx = this.player.x + Math.cos(ang) * dist;
        const sy = this.player.y + Math.sin(ang) * dist;
        const ship = new RescueShip(sx, sy);
        this.rescueShip = ship;
        this.spawn(ship);
        return true;
    }

    chunkKey(cx, cy) { return cx + "," + cy; }
    chunkOf(wx, wy)  { return [Math.floor(wx / this.CHUNK), Math.floor(wy / this.CHUNK)]; }
    _randInt(rng, min, max) { return min + Math.floor(rng() * (max - min)); }

    // 청크 거리에 따른 적 함선 클래스 선택 (멀수록 강한 함선 확률 ↑)
    _pickEnemyClass(rng, cx, cy) {
        const d = Math.hypot(cx, cy);
        const r = rng();
        if (d < 3) {
            // 시작 구역: Frigate 위주
            if (r < 0.88) return Enemy;
            return Destroyer;
        } else if (d < 6) {
            if (r < 0.60) return Enemy;
            if (r < 0.88) return Destroyer;
            return Cruiser;
        } else if (d < 10) {
            if (r < 0.40) return Enemy;
            if (r < 0.68) return Destroyer;
            if (r < 0.90) return Cruiser;
            return Battleship;
        }
        // 깊은 우주: 강한 함선 위주
        if (r < 0.25) return Enemy;
        if (r < 0.55) return Destroyer;
        if (r < 0.85) return Cruiser;
        return Battleship;
    }
    _pushAsteroidsAway(statics, sx, sy, padding) {
        for (const a of statics) {
            if (a.type !== "asteroid") continue;
            const d = Util.dist(a.x, a.y, sx, sy);
            const need = padding + a.r;
            if (d < need) {
                const ang = Math.atan2(a.y - sy, a.x - sx) || 0;
                a.x = sx + Math.cos(ang) * need;
                a.y = sy + Math.sin(ang) * need;
            }
        }
    }

    ensureChunk(cx, cy) {
        const key = this.chunkKey(cx, cy);
        if (this.chunks.has(key)) return;

        const chunkSeed = Util.hash32(cx, cy, this.seed);
        const rng = Util.seededRng(chunkSeed);

        const isOrigin    = (cx === 0 && cy === 0);
        const hasMerchant = isOrigin || rng() < this.merchantChanceVal;
        const isSafe      = isOrigin || rng() < 0.06;
        const hasShipyard = !isOrigin && !isSafe && rng() < this.shipyardChanceVal;
        // 해적 상선: 정규 상선 없는 청크에만 (둘이 동시 출현 X)
        const hasPirate   = !isOrigin && !hasMerchant && !isSafe && rng() < this.pirateChanceVal;

        const aP = this.asteroidPreset;
        const eP = this.enemyPreset;

        const statics = [];

        // 소행성
        const asteroidCount = isSafe
            ? 1 + Math.floor(rng() * 3)
            : this._randInt(rng, aP.min, aP.max);
        for (let i = 0; i < asteroidCount; i++) {
            const x = cx * this.CHUNK + rng() * this.CHUNK;
            const y = cy * this.CHUNK + rng() * this.CHUNK;
            const r = 22 + rng() * 56;
            if (isOrigin) {
                if (Math.hypot(x, y) < 220) continue;
            }
            statics.push(new Asteroid(x, y, r, chunkSeed + i));
        }

        // 정규 상선 스폰 위치
        let merchantPos = null;
        if (hasMerchant) {
            const mx = cx * this.CHUNK + this.CHUNK * (0.3 + rng() * 0.4);
            const my = cy * this.CHUNK + this.CHUNK * (0.3 + rng() * 0.4);
            this._pushAsteroidsAway(statics, mx, my, 130);
            merchantPos = { x: mx, y: my };
        }

        // 해적 상선 스폰 위치
        let piratePos = null;
        if (hasPirate) {
            const px = cx * this.CHUNK + this.CHUNK * (0.25 + rng() * 0.5);
            const py = cy * this.CHUNK + this.CHUNK * (0.25 + rng() * 0.5);
            this._pushAsteroidsAway(statics, px, py, 100);
            piratePos = { x: px, y: py };
        }

        // 정비소
        if (hasShipyard) {
            let sx = 0, sy = 0;
            for (let t = 0; t < 8; t++) {
                sx = cx * this.CHUNK + this.CHUNK * (0.2 + rng() * 0.6);
                sy = cy * this.CHUNK + this.CHUNK * (0.2 + rng() * 0.6);
                if (merchantPos && Util.dist(sx, sy, merchantPos.x, merchantPos.y) < 250) continue;
                if (piratePos && Util.dist(sx, sy, piratePos.x, piratePos.y) < 200) continue;
                break;
            }
            this._pushAsteroidsAway(statics, sx, sy, 110);
            statics.push(new RepairStation(sx, sy, chunkSeed + 99));
        }

        this.chunks.set(key, {
            x: cx, y: cy, seed: chunkSeed, statics,
            hasMerchant, hasPirate, hasShipyard, isSafe,
        });

        // 청크 최초 활성화 시 한 번만 스폰
        if (!this.spawnedChunks.has(key)) {
            this.spawnedChunks.add(key);

            // 정규 상선 (이동 객체이므로 entities로)
            if (merchantPos) {
                this.spawn(new MerchantShip(merchantPos.x, merchantPos.y, chunkSeed + 13));
            }
            // 해적 상선
            if (piratePos) {
                this.spawn(new PirateMerchant(piratePos.x, piratePos.y, chunkSeed + 17));
            }

            // 적
            if (!isOrigin && !isSafe) {
                let enemyCount;
                if (hasMerchant) enemyCount = this._randInt(rng, eP.beacon[0], eP.beacon[1]);
                else             enemyCount = this._randInt(rng, eP.normal[0], eP.normal[1]);
                if (eP.hotChance > 0 && rng() < eP.hotChance) enemyCount += 2;
                for (let i = 0; i < enemyCount; i++) {
                    let ex = cx * this.CHUNK + rng() * this.CHUNK;
                    let ey = cy * this.CHUNK + rng() * this.CHUNK;
                    for (let t = 0; t < 6; t++) {
                        let ok = true;
                        for (const s of statics) {
                            if (s.type === "asteroid" && Util.dist(ex, ey, s.x, s.y) < s.r + 30) {
                                ok = false; break;
                            }
                        }
                        if (ok) break;
                        ex = cx * this.CHUNK + rng() * this.CHUNK;
                        ey = cy * this.CHUNK + rng() * this.CHUNK;
                    }
                    const EnemyClass = this._pickEnemyClass(rng, cx, cy);
                    this.entities.push(new EnemyClass(ex, ey, chunkSeed + 1000 + i));
                }
            }
        }
    }

    update(dt) {
        if (this.player && this.player.alive) {
            const [pcx, pcy] = this.chunkOf(this.player.x, this.player.y);
            const r = this.activeRadius;
            const wanted = new Set();
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    const cx = pcx + dx, cy = pcy + dy;
                    wanted.add(this.chunkKey(cx, cy));
                    this.ensureChunk(cx, cy);
                }
            }
            for (const key of [...this.chunks.keys()]) {
                if (!wanted.has(key)) this.chunks.delete(key);
            }
            // 너무 먼 동적 엔티티 컬링 (상선은 큰 거리로 - 그래도 컬링)
            const cull = this.cullRadius * this.CHUNK;
            const cull2 = cull * cull;
            for (const e of this.entities) {
                if (e === this.player) continue;
                const dx = e.x - this.player.x, dy = e.y - this.player.y;
                if (dx * dx + dy * dy > cull2) e.alive = false;
            }
        }

        const snap = this.entities.slice();
        for (const e of snap) {
            if (e.alive) e.update(dt, this);
        }
        for (const ch of this.chunks.values()) {
            for (const s of ch.statics) s.update(dt, this);
        }

        this.resolveCollisions();
        this.entities = this.entities.filter(e => e.alive);
    }

    resolveCollisions() {
        const ents = this.entities;
        const asteroids = [];
        for (const ch of this.chunks.values()) {
            for (const s of ch.statics) if (s.type === "asteroid") asteroids.push(s);
        }

        // 데미지 받을 수 있는 함선 종류 모음
        const damageables = ents.filter(e =>
            (e.type === "player" || e.type === "enemy" || e.type === "rescue" ||
             e.type === "merchant" || e.type === "pirate") && e.alive
        );

        // === 총알/미사일 충돌 ===
        for (const b of ents) {
            if ((b.type !== "bullet" && b.type !== "missile") || !b.alive) continue;
            // 웨이브 임펄서 — 진행할수록 확장되는 부채꼴이므로 segment 도 age 비례 확장
            const isWave = b.weapon && b.weapon.weaponType === "wave";
            let segX1, segY1, segX2, segY2, waveHalfLen = 0;
            if (isWave) {
                const ang = (b.waveAng != null) ? b.waveAng : Math.atan2(b.vy, b.vx);
                const lifeMax = b.weapon.bulletLife || 0.55;
                const progress = Math.max(0, Math.min(1, 1 - (b.life / lifeMax)));
                const baseLen = b.weapon.baseLen || 70;
                const maxLen  = b.weapon.maxLen  || 180;
                const curLen = baseLen + (maxLen - baseLen) * progress;
                waveHalfLen = curLen * 0.5;
                const c = Math.cos(ang), s = Math.sin(ang);
                // 부채꼴의 *선두* 호가 가장 멀리 있으므로 segment 도 그 끝까지 닿게
                segX1 = b.x - c * waveHalfLen * 0.6;
                segY1 = b.y - s * waveHalfLen * 0.6;
                segX2 = b.x + c * waveHalfLen * 1.2;
                segY2 = b.y + s * waveHalfLen * 1.2;
            }
            // 소행성에 막힘 - 미사일은 폭파, 웨이브는 360도 산란
            let blocked = false;
            for (const a of asteroids) {
                const hitA = isWave
                    ? Util.segmentCircleHit(segX1, segY1, segX2, segY2, a.x, a.y, a.r + (b.r || 3))
                    : Util.circleHit(b.x, b.y, b.r, a.x, a.y, a.r);
                if (hitA) {
                    b.alive = false;
                    blocked = true;
                    if (b.type === "missile") {
                        this._destroyAsteroid(a);
                        this.spawn(new Explosion(b.x, b.y, a.r));
                        if (this.camera) this.camera.addShake(8);
                    } else if (b.weapon && b.weapon.weaponType === "wave" && !b.isScattered) {
                        // 산란: 소행성 표면 밖에서 8 방향으로 약한/작은 자식 wave 발사
                        if (typeof console !== "undefined") {
                            console.log("[WAVE SCATTER] @", a.x.toFixed(0), a.y.toFixed(0), " ar=" + a.r);
                        }
                        // 자식용 축소 weapon descriptor (시각/충돌 segment 절반 크기)
                        // 부모 weapon 객체에 캐싱해서 반복 생성 방지
                        if (!b.weapon._scattered) {
                            b.weapon._scattered = Object.assign({}, b.weapon, {
                                id: b.weapon.id + "_child",
                                baseLen: (b.weapon.baseLen || 70) * 0.40,
                                maxLen:  (b.weapon.maxLen  || 180) * 0.45,
                                width:   (b.weapon.width   || 10) * 0.60,
                                glow:    Math.max(6, (b.weapon.glow || 16) * 0.55),
                                bulletLife: (b.weapon.bulletLife || 0.55) * 0.5,
                            });
                        }
                        const childW = b.weapon._scattered;
                        const N = 8;
                        const childDmg = Math.max(1, Math.round(b.damage * 0.5));
                        const childSp  = (b.weapon.bulletSpeed || 380) * 0.7;
                        const childLife = childW.bulletLife;
                        // 자식이 *부모 소행성*과 즉시 충돌하지 않도록 충분히 밖에서 스폰
                        // 자식의 maxLen × 0.7 (segment 뒤쪽 여유) + 5 buffer
                        const surfR = a.r + (childW.maxLen * 0.7) + 5;
                        for (let i = 0; i < N; i++) {
                            const ang = (i / N) * Math.PI * 2 + Math.random() * 0.06;
                            const cx = a.x + Math.cos(ang) * surfR;
                            const cy = a.y + Math.sin(ang) * surfR;
                            const child = new Bullet(
                                cx, cy,
                                Math.cos(ang) * childSp,
                                Math.sin(ang) * childSp,
                                b.owner, childDmg, childLife,
                            );
                            child.weapon = childW;
                            child.r = Math.max(3, (b.weapon.hitRadius || 10) * 0.55);
                            child.isScattered = true;
                            child.waveAng = ang;
                            this.spawn(child);
                        }
                        // 산란 위치에 보라 충격파 폭발 — Explosion(x, y, scale, startDelay, color)
                        if (typeof Explosion !== "undefined") {
                            this.spawn(new Explosion(a.x, a.y, a.r + 18, 0, "purple"));
                        }
                        if (this.camera) this.camera.addShake(4);
                    }
                    break;
                }
            }
            if (blocked) continue;
            // 자기 자신 외 타격 가능 대상 검사
            for (const t of damageables) {
                if (t === b.owner) continue;
                if (!t.alive) continue;
                const hitT = isWave
                    ? Util.segmentCircleHit(segX1, segY1, segX2, segY2, t.x, t.y, t.r + (b.r || 3))
                    : Util.circleHit(b.x, b.y, b.r, t.x, t.y, t.r);
                if (hitT) {
                    if (b.type === "missile" && b.armTimer > 0 && t === b.owner) continue;
                    t.takeDamage(b.damage, this, b.owner);
                    b.alive = false;
                    if (b.type === "missile") {
                        this.spawn(new Explosion(b.x, b.y, 16));
                        if (this.camera) this.camera.addShake(5);
                    }
                    break;
                }
            }
        }

        // === 함선 vs 소행성 (밀어내기 + 데미지) ===
        // 정규/해적 상선은 너무 커서 소행성 통과 안 함 - 동일 처리
        const ships = damageables;   // 같은 리스트 재활용
        for (const s of ships) {
            for (const a of asteroids) {
                const dx = s.x - a.x, dy = s.y - a.y;
                const r = s.r + a.r;
                if (dx * dx + dy * dy < r * r) {
                    const d = Math.hypot(dx, dy) || 0.001;
                    const nx = dx / d, ny = dy / d;
                    const overlap = r - d;
                    s.x += nx * overlap;
                    s.y += ny * overlap;
                    const vDotN = s.vx * nx + s.vy * ny;
                    if (vDotN < 0) {
                        s.vx -= (1 + 0.4) * vDotN * nx;
                        s.vy -= (1 + 0.4) * vDotN * ny;
                    }
                    if (s.type === "player") {
                        const sp = Math.hypot(s.vx, s.vy);
                        if (sp > 220) s.takeDamage(3, this);
                    }
                }
            }
        }

        // === 함선 끼리 가벼운 밀어내기 ===
        for (let i = 0; i < ships.length; i++) {
            for (let j = i + 1; j < ships.length; j++) {
                const a = ships[i], b = ships[j];
                const dx = b.x - a.x, dy = b.y - a.y;
                const r = a.r + b.r;
                if (dx * dx + dy * dy < r * r) {
                    const d = Math.hypot(dx, dy) || 0.001;
                    const nx = dx / d, ny = dy / d;
                    const overlap = (r - d) * 0.5;
                    a.x -= nx * overlap; a.y -= ny * overlap;
                    b.x += nx * overlap; b.y += ny * overlap;
                }
            }
        }
    }

    // 미사일 폭파 등으로 소행성을 청크 statics 에서 제거
    _destroyAsteroid(asteroid) {
        for (const ch of this.chunks.values()) {
            const idx = ch.statics.indexOf(asteroid);
            if (idx >= 0) {
                ch.statics.splice(idx, 1);
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        const cam = this.camera;
        for (const ch of this.chunks.values()) {
            for (const s of ch.statics) {
                if (cam.isVisible(s.x, s.y, s.r + 80)) s.draw(ctx);
            }
        }
        // z-order: 상선(가장 큰 거)이 가장 뒤, bullet/cargo, 적/구조선, 플레이어
        const order = {
            bullet: 0, missile: 0, cargo: 1, fuel: 1,
            merchant: 2, pirate: 2,
            enemy: 3, rescue: 3,
            player: 4,
            explosion: 5,
        };
        const sorted = this.entities.slice().sort(
            (a, b) => (order[a.type] ?? 0) - (order[b.type] ?? 0)
        );
        for (const e of sorted) {
            if (!e.alive) continue;
            if (cam.isVisible(e.x, e.y, e.r + 64)) e.draw(ctx);
        }
    }

    // 가장 가까운 정규 상선 (player 미니맵 화살표 용)
    nearestMerchant() {
        if (!this.player) return null;
        let best = null, bestD = Infinity;
        for (const e of this.entities) {
            if (e.type !== "merchant" || !e.alive) continue;
            const d = Util.dist2(e.x, e.y, this.player.x, this.player.y);
            if (d < bestD) { bestD = d; best = e; }
        }
        return best;
    }

    // 적 AI 용 — fromX,fromY 기준 가장 가까운 해적 상선
    nearestPirateMerchantFrom(fromX, fromY) {
        let best = null, bestD = Infinity;
        for (const e of this.entities) {
            if (e.type !== "pirate" || !e.alive) continue;
            const d = Util.dist2(e.x, e.y, fromX, fromY);
            if (d < bestD) { bestD = d; best = e; }
        }
        return best;
    }
    // 적 AI 용 — fromX,fromY 기준 가장 가까운 정비소
    nearestShipyardFrom(fromX, fromY) {
        let best = null, bestD = Infinity;
        for (const ch of this.chunks.values()) {
            for (const s of ch.statics) {
                if (s.type !== "shipyard") continue;
                const d = Util.dist2(s.x, s.y, fromX, fromY);
                if (d < bestD) { bestD = d; best = s; }
            }
        }
        return best;
    }

    // Player 입장에서 작용 범위에 있는 가장 가까운 정비소 (E 키 입장용)
    nearestShipyardInRange() {
        if (!this.player || !this.player.alive) return null;
        const p = this.player;
        let best = null, bestD = Infinity;
        for (const ch of this.chunks.values()) {
            for (const s of ch.statics) {
                if (s.type !== "shipyard") continue;
                const d = Util.dist(p.x, p.y, s.x, s.y);
                const range = s.repairRange || (s.r + 60);
                if (d < range && d < bestD) {
                    bestD = d;
                    best = s;
                }
            }
        }
        return best;
    }

    nearbyForMinimap(range) {
        const out = [];
        const r2 = range * range;
        if (!this.player) return out;
        for (const ch of this.chunks.values()) {
            for (const s of ch.statics) {
                if (s.type === "asteroid" || s.type === "shipyard") {
                    const d = Util.dist2(s.x, s.y, this.player.x, this.player.y);
                    if (d <= r2) out.push(s);
                }
            }
        }
        for (const e of this.entities) {
            if (e.type === "enemy" || e.type === "cargo" ||
                e.type === "rescue" || e.type === "fuel" ||
                e.type === "merchant" || e.type === "pirate") {
                const d = Util.dist2(e.x, e.y, this.player.x, this.player.y);
                if (d <= r2) out.push(e);
            }
        }
        return out;
    }
}

window.World = World;
