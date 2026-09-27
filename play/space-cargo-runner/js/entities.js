// entities.js - Player, Bullet, Asteroid, Enemy(현상금 사냥꾼), Cargo,
//               FuelCanister, RescueShip, MerchantShip(정규 상선), PirateMerchant(해적 상선)

class Entity {
    constructor(x, y, r) {
        this.x = x; this.y = y;
        this.vx = 0; this.vy = 0;
        this.r = r;
        this.alive = true;
        this.type = "entity";
    }
}

// ============================================================
// === 무기 카탈로그 (Weapons) =================================
// 플레이어가 장착할 수 있는 모든 포탑 무기를 정의.
// 무기 사용 주체: Player 전용 (적/상선 등은 owner.type 기반 fallback 으로 표시됨)
// 적용 위치: Player.turrets[i].weapon (= WEAPONS 키 문자열)
// 업그레이드 (정비소): damage 는 +5/단계 가산, bulletSpeed 는 +15%/단계.
//
// - base_laser : 베이스 레이저. 플레이어 기본 무기, 대부분 적 함선의 기본 무기와 동일 사양.
//                노란 단발 빔, 표준 데미지/탄속.
// - heavy_laser: 헤비 레이저. 정규 상선이 운용하는 중형 네온 레이저.
//                시안그린 굵은 빔, 데미지·탄속 대폭 강화. 정비소 구매 전용.
// ============================================================
const WEAPONS = {
    base_laser: {
        id: "base_laser",
        name: "베이스 레이저",
        weaponType: "laser",
        damage: 8,
        bulletSpeed: 500,
        bulletLife: 1.2,
        energyCost: 4,        // 1 발당 에너지 소모
        fireRateMult: 1,      // 발사 속도 배수 (1=베이스, 3=베이스의 1/3 속도)
        color: "#ffe066", glow: 0, len: 12, width: 2.5,
        cost: 0,              // 시작 무기 — 정비소 카탈로그엔 노출 안 됨
        description: "함선 표준 단발 레이저. 신뢰성 있고 가벼움.",
    },
    heavy_laser: {
        id: "heavy_laser",
        name: "헤비 레이저",
        weaponType: "laser",
        damage: 35,           // 베이스 8 대비 약 4.4배
        bulletSpeed: 1100,
        bulletLife: 1.4,
        energyCost: 12,       // 베이스 4의 3배
        fireRateMult: 3,      // 베이스의 1/3 속도 — 알파 스트라이크 무기
        color: "#5fffe0", glow: 10, len: 32, width: 3.4,
        cost: 800,
        refundRatio: 0.5,
        description: "상선 출신 중형 네온 레이저. 단발 데미지 강력, 발사속도 1/3.",
    },
    wave_impulser: {
        id: "wave_impulser",
        name: "웨이브 임펄서",
        weaponType: "wave",
        damage: 6,            // 베이스 8 보다 25% 낮음
        bulletSpeed: 380,
        bulletLife: 0.55,     // 사거리 = 380 × 0.55 ≈ 209px (베이스 600의 35%)
        energyCost: 7,
        fireRateMult: 1,
        hitRadius: 10,        // 베이스 hitbox (실제 확장은 age 비례)
        baseLen: 70,          // 신생 wave 의 packet 길이 (시각/충돌)
        maxLen: 180,          // 노화된 wave 의 packet 최대 길이
        baseSpread: 0.35,     // 시각 부채 펼침 (라디안 ±)
        maxSpread: 0.75,
        color: "#b070ff", glow: 16, len: 70, width: 10,
        cost: 700,
        refundRatio: 0.5,
        description: "초고출력 마이크로웨이브. 진행하며 부채꼴로 확장, 소행성 충돌 시 360도 산란.",
    },
};

// === Player 함선 계층 ===
// turrets 위치는 함선 좌표계 (앞=+x, 좌=-y, 우=+y)
const PLAYER_TIERS = [
    {
        name: "Frigate",
        r: 14, hpBonus: 0,
        turrets: [{ x: 18, y: 0 }],
        hasMissile: false,
        energyBonus: 0,    energyRegenBonus: 0,
        cost: 0,
    },
    {
        name: "Destroyer",
        r: 18, hpBonus: 50,
        turrets: [{ x: 18, y: -12 }, { x: 18, y: 12 }],
        hasMissile: false,
        energyBonus: 60,   energyRegenBonus: 20,
        cost: 2000,
    },
    {
        name: "Cruiser",
        r: 22, hpBonus: 120,
        turrets: [{ x: 24, y: 0 }, { x: 6, y: -16 }, { x: 6, y: 16 }],
        hasMissile: false,
        energyBonus: 120,  energyRegenBonus: 40,
        cost: 5000,
    },
    {
        name: "Battleship",
        r: 28, hpBonus: 220,
        turrets: [
            { x: 24, y: -12 }, { x: 24, y: 12 },
            { x: 8, y: -20 }, { x: 8, y: 20 },
        ],
        hasMissile: true,
        energyBonus: 200,  energyRegenBonus: 70,
        cost: 12000,
    },
    {
        name: "Carrier",
        r: 32, hpBonus: 320,
        turrets: [
            { x: 26, y: -14 }, { x: 26, y: 14 },
            { x: 8, y: -22 }, { x: 8, y: 22 },
        ],
        hasMissile: true,
        energyBonus: 280,  energyRegenBonus: 90,
        cost: -1,
        locked: true,
    },
];

// === 카고 체인 페널티 / 끈 절단 상수 ===
const CARGO_SPEED_PENALTY = 0.04;
const CARGO_FACTOR_MIN    = 0.30;
const TETHER_LENGTH       = 30;
const TETHER_STIFFNESS    = 14;
const STRESS_THRESHOLD        = 0.2;   // baseline; 실제 = 0.2 / excess (한도 초과량)
const STRESS_RECOVERY         = 3;     // 회복 시정수 ≈ 0.33초

// -------------------------------------------------------------------
// ChainMixin: cargoChain 동작 (Player/Enemy 공유)
// 사용 객체에는 다음이 있어야 함: x, y, vx, vy, r, angle, cargoChain
// -------------------------------------------------------------------
const ChainMixin = {
    _tetherPoint() {
        const ang = this.angle + Math.PI;
        return {
            x:  this.x + Math.cos(ang) * this.r * 0.6,
            y:  this.y + Math.sin(ang) * this.r * 0.6,
            vx: this.vx, vy: this.vy,
        };
    },

    attachCargo() {
        if (window.SFX) window.SFX.pickupCargo();
        const anchor = this.cargoChain.length === 0
            ? this._tetherPoint()
            : this.cargoChain[this.cargoChain.length - 1];
        // 새 카고는 anchor 뒤쪽 TETHER_LENGTH 위치에서 시작
        const ang = this.angle + Math.PI;
        const c = {
            x: anchor.x + Math.cos(ang) * TETHER_LENGTH,
            y: anchor.y + Math.sin(ang) * TETHER_LENGTH,
            r: 8,
            rot: Math.random() * TAU,
            spin: (Math.random() - 0.5) * 0.6,
            stress: 0,
        };
        this.cargoChain.push(c);
        if (this.applyUpgrades) this.applyUpgrades();
    },

    // === 새 모델: 단순 lerp 추적 ===
    // 각 카고는 자기 앞 anchor 뒤쪽 TETHER_LENGTH 거리에 있는 "목표 위치" 로
    // 매 프레임 부드럽게 보간 (lerp) 된다. 관성/속도 없음 → 채찍 효과 0.
    // 끈이 늘어날수록 lerp 강도가 비례 증가해서 안정 거리가 길어지지 않음.
    updateCargoChain(dt, world) {
        if (this.cargoChain.length === 0) return;

        const baseK = 1 - Math.exp(-dt * 25);   // 기본 시정수 ~0.04초

        let anchor = this._tetherPoint();
        for (const c of this.cargoChain) {
            const dx = c.x - anchor.x;
            const dy = c.y - anchor.y;
            const d = Math.hypot(dx, dy);

            if (d > 0.001) {
                const nx = dx / d, ny = dy / d;
                // 목표 위치: anchor 뒤 TETHER_LENGTH
                const tx = anchor.x + nx * TETHER_LENGTH;
                const ty = anchor.y + ny * TETHER_LENGTH;
                // 늘어남에 비례한 가속 lerp (1배 정상, 2배 늘어나면 강한 끌림)
                const stretchRatio = d / TETHER_LENGTH;
                const k = Math.min(1, baseK * (1 + Math.max(0, stretchRatio - 1) * 4));
                c.x += (tx - c.x) * k;
                c.y += (ty - c.y) * k;
            } else {
                // anchor 와 완전히 겹쳤을 때만 임의 방향으로 살짝 떨어트림
                const a = Math.random() * TAU;
                c.x += Math.cos(a) * 0.5;
                c.y += Math.sin(a) * 0.5;
            }

            c.rot += c.spin * dt;
            anchor = c;
        }

        // 소행성 본체 충돌 — 위치만 표면 밖으로 밀어냄 (속도/관성 없음, lerp 가 다음 프레임에 다시 끌어감)
        const asteroids = [];
        if (world && world.chunks) {
            for (const ch of world.chunks.values()) {
                for (const s of ch.statics) if (s.type === "asteroid") asteroids.push(s);
            }
        }
        for (const c of this.cargoChain) {
            for (const a of asteroids) {
                const ax = c.x - a.x, ay = c.y - a.y;
                const minD = c.r + a.r;
                const dd2 = ax * ax + ay * ay;
                if (dd2 < minD * minD) {
                    const dd = Math.sqrt(dd2) || 0.001;
                    c.x = a.x + ax / dd * minD;
                    c.y = a.y + ay / dd * minD;
                }
            }
        }
    },

    drawCargoChain(ctx) {
        if (this.cargoChain.length === 0) return;
        let prev = this._tetherPoint();
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        for (const c of this.cargoChain) {
            const stressFrac = Math.min(1, (c.stress || 0) / STRESS_THRESHOLD);
            if (stressFrac > 0.1) {
                const t = stressFrac;
                const rr = Math.round(180 + 75 * t);
                const gb = Math.round(180 * (1 - t));
                ctx.strokeStyle = `rgba(${rr}, ${gb}, ${gb}, 0.9)`;
                ctx.lineWidth = 1.6 + t * 0.8;
            } else {
                ctx.strokeStyle = "rgba(180, 180, 180, 0.7)";
                ctx.lineWidth = 1.6;
            }
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(c.x, c.y);
            ctx.stroke();
            prev = c;
        }
        for (const c of this.cargoChain) {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rot);
            ctx.fillStyle = "#7be39a";
            ctx.strokeStyle = "#cffce0";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.rect(-c.r, -c.r, c.r * 2, c.r * 2);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = "#0a2a14";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-c.r * 0.6, 0); ctx.lineTo(c.r * 0.6, 0);
            ctx.moveTo(0, -c.r * 0.6); ctx.lineTo(0, c.r * 0.6);
            ctx.stroke();
            ctx.restore();
        }
    },
};

// -------------------------------------------------------------------
// Player
// -------------------------------------------------------------------
class Player extends Entity {
    constructor(x, y) {
        super(x, y, 14);
        this.type = "player";
        this.angle = -Math.PI / 2;

        this.baseThrust       = 380;
        this.baseMaxSpeed     = 360;
        this.baseBulletSpeed  = 720;
        this.baseFireRate     = 0.16;
        this.baseDamage       = 10;
        this.baseMaxHp        = 100;

        this.upgrades = { speed: 0, bulletSpeed: 0, fireRate: 0, damage: 0, hull: 0, cargoCapacity: 0, powerplant: 0 };
        // === 에너지 시스템 ===
        // 에너지 무기 (base/heavy laser) 발사 시 소모. 발사 안 하면 빠르게 회복.
        // 발전소 업그레이드로 maxEnergy / energyRegen 향상.
        // Tier 향상 시에도 에너지 보너스 적용.
        this.baseMaxEnergy   = 50;     // 기본 capacity (Frigate 초반 — 빡빡함)
        this.baseEnergyRegen = 12.75;  // 기본 초당 회복 (이전 15에서 -15% 추가 하향)
        this.maxEnergy   = 50;         // applyUpgrades 에서 갱신
        this.energyRegen = 12.75;
        this.energy      = 50;
        this._noEnergyBlinkTimer = 0; // 에너지 부족 시 깜빡임 시각
        this._noEnergySoundTimer = 0; // uiError 사운드 스팸 방지
        this.baseCargoSoftCap = 6;   // 기본 운반 한도 (이 이상은 속도 90% 감소 + 끈 약함)
        this.cargoSoftCap = 6;        // applyUpgrades 에서 갱신

        // 함선 계층 시스템 (정비소에서 향상 가능)
        this.tier = 0;
        this.tierName = "Frigate";
        this.turrets = [{ x: 18, y: 0 }];   // applyTier 에서 갱신
        this.hasMissile = false;
        this.missileCooldown = 0;
        this.missileRate = 2.5;
        this.missileDamage = 45;
        this.thrust = 0; this.maxSpeed = 0; this.bulletSpeed = 0;
        this.fireRate = 0; this.damage = 0; this.maxHp = 0;
        this.boostMult = 1.9;
        this.fireCooldown = 0;
        this.hp = this.baseMaxHp;
        this.gold = 0;
        this.invuln = 0;

        this.cargoChain = [];

        this.currentMaxSpeed = 0;
        this.maxSpeedSmooth = 2;

        this.fuel = 200; this.maxFuel = 200;
        this.fuelDrainNormal = 1.5; this.fuelDrainBoost = 7.5;
        this.outOfFuel = false;

        // 갓모드 (디버그) - Settings에서 캐시
        this.godMode = !!(window.Settings && window.Settings.godMode === "on");

        this.applyUpgrades();
        this.applyTier(0);   // Frigate 기본
        this.currentMaxSpeed = this.maxSpeed;
    }
    cargoSpeedFactor() {
        // 갓모드 - 카고 한도 무시 (항상 정상 속도)
        if (this.godMode) return 1.0;
        const n = this.cargoChain.length;
        if (n <= this.cargoSoftCap) return 1.0;
        return 0.10;
    }

    // 함선 계층 적용 (외부에서 tierIndex 0~3 지정 / 4=Carrier 잠금)
    applyTier(tierIndex) {
        if (tierIndex < 0) tierIndex = 0;
        if (tierIndex > 3) tierIndex = 3;
        this.tier = tierIndex;
        const def = PLAYER_TIERS[tierIndex];
        this.tierName = def.name;
        this.r = def.r;
        this.baseMaxHp = 100 + def.hpBonus;
        // Tier 보너스 — 베이스 위에 누적 (applyUpgrades 에서 그 위에 발전소 보너스 추가)
        this.tierEnergyBonus      = def.energyBonus || 0;
        this.tierEnergyRegenBonus = def.energyRegenBonus || 0;
        // 기존 무기 보존 (tier 변경 시에도 장착했던 무기 유지)
        const prevWeapons = (this.turrets || []).map(tt => tt.weapon || "base_laser");
        // cooldown 은 새 슬롯마다 0 으로 초기화 (per-turret 개별 사이클)
        this.turrets = def.turrets.map((t, i) => ({ ...t, weapon: prevWeapons[i] || "base_laser", cooldown: 0 }));
        this.hasMissile = def.hasMissile;
        this.applyUpgrades();
        // tier 향상 시 약간의 HP 회복 보너스
        this.hp = Math.min(this.maxHp, this.hp + 50);
    }

    // 정비소 - 한 단계 향상
    upgradeTier() {
        if (this.tier >= 3) return false;
        this.applyTier(this.tier + 1);
        return true;
    }
    applyUpgrades() {
        const u = this.upgrades;
        const cf = this.cargoChain ? this.cargoSpeedFactor() : 1;
        const godMult = this.godMode ? 2 : 1;
        this.thrust       = this.baseThrust       * (1 + 0.12 * u.speed) * cf * godMult;
        this.maxSpeed     = this.baseMaxSpeed     * (1 + 0.12 * u.speed) * cf * godMult;
        this.bulletSpeed  = this.baseBulletSpeed  * (1 + 0.15 * u.bulletSpeed);
        this.fireRate     = this.baseFireRate     * Math.pow(0.85, u.fireRate);
        this.damage       = this.baseDamage       + 5  * u.damage;
        this.maxHp        = this.baseMaxHp        + 30 * u.hull;
        this.cargoSoftCap = this.baseCargoSoftCap + (u.cargoCapacity || 0);
        // 에너지: base + tier 보너스 + 발전소 (단계당 cap +30, regen +6)
        const pp = u.powerplant || 0;
        const tierE  = this.tierEnergyBonus      || 0;
        const tierER = this.tierEnergyRegenBonus || 0;
        const oldMax = this.maxEnergy || this.baseMaxEnergy;
        this.maxEnergy   = this.baseMaxEnergy   + tierE  + 30 * pp;
        this.energyRegen = this.baseEnergyRegen + tierER + 6  * pp;
        // 업그레이드 직후 — 현재 에너지가 이전 최대보다 작았으면 비례 유지
        if (this.energy == null) this.energy = this.maxEnergy;
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }
    canUpgrade(stat) { return this.upgrades[stat] !== undefined && this.upgrades[stat] < 5; }
    upgradeStat(stat) {
        if (!this.canUpgrade(stat)) return false;
        this.upgrades[stat]++;
        this.applyUpgrades();
        return true;
    }
    repairHull(amount) { this.hp = Math.min(this.maxHp, this.hp + amount); }
    refuel() { this.fuel = this.maxFuel; this.outOfFuel = false; }
    addFuel(amount) {
        this.fuel = Math.min(this.maxFuel, this.fuel + amount);
        if (this.fuel > 0.5) this.outOfFuel = false;
    }

    sellCargoAt(merchant) {
        const n = this.cargoChain.length;
        if (n <= 0) return 0;
        // 카고 1개 기본 판매가 50G. 정규 상선 ×1.0 (50G), 해적 상선 ×0.5 (25G).
        const earned = Math.round(n * (merchant.priceMultiplier || 1) * 50);
        this.gold += earned;
        this.cargoChain = [];
        this.applyUpgrades();
        if (window.SFX) window.SFX.pickupGold();
        return earned;
    }

    checkChainCollisions(world, dt) {
        if (this.cargoChain.length === 0) return;

        const fragile = this.cargoChain.length > this.cargoSoftCap;
        // 한도 이하 -> 끈 절단 불가 + stress 도 리셋
        if (!fragile) {
            for (const c of this.cargoChain) c.stress = 0;
            return;
        }

        const asteroids = [];
        for (const ch of world.chunks.values()) {
            for (const s of ch.statics) if (s.type === "asteroid") asteroids.push(s);
        }
        if (asteroids.length === 0) {
            for (const c of this.cargoChain) {
                c.stress *= Math.exp(-dt * STRESS_RECOVERY);
                if (c.stress < 0.001) c.stress = 0;
            }
            return;
        }

        // 한도 초과량에 비례한 stress 누적 — 많이 초과할수록 빨리 끊어짐
        const excess = this.cargoChain.length - this.cargoSoftCap;   // 1 ~ N
        const stressGainPerSec = excess;     // 1초당 excess 만큼 누적

        let prev = this._tetherPoint();
        let severIndex = -1;
        for (let i = 0; i < this.cargoChain.length; i++) {
            const c = this.cargoChain[i];
            let inCollision = false;
            for (const a of asteroids) {
                if (Util.segmentCircleHit(prev.x, prev.y, c.x, c.y, a.x, a.y, a.r)) {
                    inCollision = true; break;
                }
            }
            if (inCollision) {
                c.stress += dt * stressGainPerSec;
                if (c.stress >= STRESS_THRESHOLD) { severIndex = i; break; }
            } else {
                c.stress *= Math.exp(-dt * STRESS_RECOVERY);
                if (c.stress < 0.001) c.stress = 0;
            }
            prev = c;
        }
        if (severIndex >= 0) {
            this._severChain(severIndex, world);
            this.applyUpgrades();
        }
    }
    _severChain(fromIndex, world) {
        const detached = this.cargoChain.splice(fromIndex);
        if (world.camera) world.camera.addShake(3);
        for (const c of detached) {
            const ang = Math.random() * TAU;
            const sp = 50 + Math.random() * 70;
            // 분리된 카고에 player 속도의 절반 + 랜덤 방향 흩어짐
            const cargo = new Cargo(
                c.x, c.y,
                this.vx * 0.5 + Math.cos(ang) * sp,
                this.vy * 0.5 + Math.sin(ang) * sp,
            );
            cargo.pickupCooldown = 2.0;
            world.spawn(cargo);
        }
    }

    // X 키: 체인 말단 카고 하나 분리 (속도 페널티 빠르게 줄이기)
    detachLastCargo(world) {
        if (this.cargoChain.length === 0) return false;
        const c = this.cargoChain.pop();
        // 함체 뒤쪽으로 약간 튕기듯 떨굼
        const ang = this.angle + Math.PI + (Math.random() - 0.5) * 0.4;
        const sp = 40 + Math.random() * 40;
        const cargo = new Cargo(
            c.x, c.y,
            this.vx * 0.5 + Math.cos(ang) * sp,
            this.vy * 0.5 + Math.sin(ang) * sp,
        );
        cargo.pickupCooldown = 1.5;   // 자석 픽업 무시 (실수 방지)
        world.spawn(cargo);
        this.applyUpgrades();
        if (world.camera) world.camera.addShake(1);
        return true;
    }

    update(dt, world) {
        // 갓모드 - 연료/에너지 만땅 강제 유지
        if (this.godMode) {
            this.fuel = this.maxFuel;
            this.outOfFuel = false;
            this.energy = this.maxEnergy;
        } else {
            // 에너지 회복 (매 프레임)
            if (this.energy < this.maxEnergy) {
                this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegen * dt);
            }
        }
        // 부족 깜빡임 / 사운드 쿨다운 감쇠
        if (this._noEnergyBlinkTimer > 0) this._noEnergyBlinkTimer -= dt;
        if (this._noEnergySoundTimer > 0) this._noEnergySoundTimer -= dt;
        let ax = 0, ay = 0;
        if (Input.isDown("KeyW")) ay -= 1;
        if (Input.isDown("KeyS")) ay += 1;
        if (Input.isDown("KeyA")) ax -= 1;
        if (Input.isDown("KeyD")) ax += 1;
        const len = Math.hypot(ax, ay);
        if (len > 0) { ax /= len; ay /= len; }

        const wantBoost = Input.isDown("ShiftLeft") || Input.isDown("ShiftRight");
        const thrusting = len > 0;
        const canThrust = this.fuel > 0;
        const boosting  = wantBoost && thrusting && canThrust;

        if (canThrust && thrusting && !this.godMode) {
            const drain = boosting ? this.fuelDrainBoost : this.fuelDrainNormal;
            this.fuel -= drain * dt;
            if (this.fuel <= 0) {
                this.fuel = 0;
                if (!this.outOfFuel) {
                    this.outOfFuel = true;
                    this.vx *= 0.01; this.vy *= 0.01;
                }
            }
        }

        const thrustNow = this.thrust * (boosting ? this.boostMult : 1);
        if (canThrust) {
            this.vx += ax * thrustNow * dt;
            this.vy += ay * thrustNow * dt;
        }

        const targetMaxV = this.maxSpeed * (boosting ? this.boostMult : 1);
        const k = 1 - Math.exp(-dt * this.maxSpeedSmooth);
        this.currentMaxSpeed += (targetMaxV - this.currentMaxSpeed) * k;
        const sp = Math.hypot(this.vx, this.vy);
        if (sp > this.currentMaxSpeed) {
            this.vx *= this.currentMaxSpeed / sp;
            this.vy *= this.currentMaxSpeed / sp;
        }

        const fric = (thrusting && canThrust ? 0.05 : 0.6) * dt;
        this.vx -= this.vx * fric;
        this.vy -= this.vy * fric;

        this.angle = Util.angleOf(Input.worldX - this.x, Input.worldY - this.y);

        // 갓모드 V키: 유도 미사일 (쿨타임 없음, pressed 마다 1발)
        if (this.godMode && Input.pressed["KeyV"]) {
            this._fireGodMissile(world);
        }
        // 갓모드 3/4/5/6 키: 함선 즉시 변신 (godMode 권능 유지 - 격침불가, 무한연료/카고, 2배속도, V미사일, +/- 등)
        // Frigate(6) + godMode 일 때만 4 포탑 godLaser 사격, 그 외 tier 에선 함선 일반 사격
        if (this.godMode) {
            let demoTier = -1;
            if (Input.pressed["Digit3"]) demoTier = 1;        // Destroyer
            else if (Input.pressed["Digit4"]) demoTier = 2;   // Cruiser
            else if (Input.pressed["Digit5"]) demoTier = 3;   // Battleship
            else if (Input.pressed["Digit6"]) demoTier = 0;   // Frigate (godLaser 복귀)
            if (demoTier >= 0 && demoTier !== this.tier) {
                this.applyTier(demoTier);
                this.hp = this.maxHp;
                this.fuel = this.maxFuel;
                if (world.camera) world.camera.addShake(3);
            }
            // +/- 키: 모든 업그레이드 1씩 ± (Equal/NumpadAdd, Minus/NumpadSubtract)
            const STATS = ["speed", "bulletSpeed", "fireRate", "damage", "hull", "cargoCapacity"];
            if (Input.pressed["Equal"] || Input.pressed["NumpadAdd"]) {
                let any = false;
                for (const k of STATS) {
                    if (this.upgrades[k] < 5) { this.upgrades[k]++; any = true; }
                }
                if (any) {
                    this.applyUpgrades();
                    if (world.camera) world.camera.addShake(1);
                    this._goldFloater = { amount: 999, life: 0.8, maxLife: 0.8 };   // 시각 피드백 (+표시는 amount > 0)
                }
            }
            if (Input.pressed["Minus"] || Input.pressed["NumpadSubtract"]) {
                let any = false;
                for (const k of STATS) {
                    if (this.upgrades[k] > 0) { this.upgrades[k]--; any = true; }
                }
                if (any) {
                    this.applyUpgrades();
                    if (world.camera) world.camera.addShake(1);
                }
            }
        }

        // === per-turret 발사 시스템 ===
        // godMode + Frigate 는 별도 (4 포탑 OP godLaser 시연용)
        if (this.godMode && this.tier === 0) {
            this.fireCooldown -= dt;
            if (Input.mouseDown && this.fireCooldown <= 0) {
                this.fireCooldown = 0.04;
                this._fireGodLasers(world);
            }
        } else {
            this._updateTurrets(world, dt, Input.mouseDown);
        }
        // Battleship+ 자동 유도 미사일 (godMode 무관, 좌클릭 시 쿨다운 주기로)
        if (this.hasMissile) {
            this.missileCooldown -= dt;
            if (Input.mouseDown && this.missileCooldown <= 0) {
                this.missileCooldown = this.missileRate;
                this._firePlayerMissile(world);
            }
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.invuln = Math.max(0, this.invuln - dt);

        // 골드 플로터 감소
        if (this._goldFloater) {
            this._goldFloater.life -= dt;
            if (this._goldFloater.life <= 0) this._goldFloater = null;
        }

        this.updateCargoChain(dt, world);
        this.checkChainCollisions(world, dt);
    }

    // === per-turret 발사 시스템 ===
    // 각 포탑이 자기 cooldown 으로 독립 발사. weapon.fireRateMult 가 Player.fireRate 에 곱해짐.
    // weapon.weaponType 으로 발사 로직 분기 ("laser" 외 type 은 다음 Phase 에서 추가됨).
    _updateTurrets(world, dt, mouseDown) {
        // 모든 포탑 cooldown 감쇠 (마우스 안 눌러도 진행)
        for (const t of this.turrets) {
            if (t.cooldown == null) t.cooldown = 0;
            if (t.cooldown > 0) t.cooldown -= dt;
        }
        if (!mouseDown) return;

        let blockedByEnergy = false;
        let firstFiredSoundPlayed = false;
        for (const t of this.turrets) {
            if (t.cooldown > 0) continue;
            const wpn = WEAPONS[t.weapon] || WEAPONS.base_laser;
            const cost = wpn.energyCost || 0;
            if (!this.godMode && this.energy < cost) {
                blockedByEnergy = true;
                continue;
            }
            if (!this.godMode) this.energy -= cost;
            const fireRateMult = wpn.fireRateMult || 1;
            t.cooldown = this.fireRate * fireRateMult;
            this._fireSingleTurret(t, wpn, world, !firstFiredSoundPlayed);
            firstFiredSoundPlayed = true;
        }

        if (blockedByEnergy) {
            this._noEnergyBlinkTimer = 0.4;
            if (this._noEnergySoundTimer <= 0) {
                if (window.SFX) window.SFX.uiError();
                this._noEnergySoundTimer = 0.6;
            }
        }
    }

    // 단일 포탑 발사 — weaponType 으로 분기.
    // playSound: 이 프레임에 SFX 첫 발사면 true (다중 포탑 동시 발사 시 소리 중첩 방지)
    _fireSingleTurret(t, wpn, world, playSound) {
        const cosA = Math.cos(this.angle), sinA = Math.sin(this.angle);
        const u = this.upgrades;
        const dmgBonus = 5 * (u.damage || 0);
        const spdMult  = 1 + 0.15 * (u.bulletSpeed || 0);
        const wx = this.x + cosA * t.x - sinA * t.y;
        const wy = this.y + sinA * t.x + cosA * t.y;

        const wpnType = wpn.weaponType || "laser";
        switch (wpnType) {
            case "wave": {
                // 웨이브 임펄서 — 굵은 보라색 막대, 소행성 맞으면 360도 분기
                const dx = Input.worldX - wx, dy = Input.worldY - wy;
                const ang = Math.atan2(dy, dx);
                const bulletSp = (wpn.bulletSpeed || 380) * spdMult;
                const bulletDmg = (wpn.damage || 6) + dmgBonus;
                const b = new Bullet(
                    wx + Math.cos(ang) * 4,
                    wy + Math.sin(ang) * 4,
                    Math.cos(ang) * bulletSp + this.vx,
                    Math.sin(ang) * bulletSp + this.vy,
                    this, bulletDmg, wpn.bulletLife,
                );
                b.weapon = wpn;
                b.r = wpn.hitRadius || 8;
                b.waveAng = ang;            // 막대 방향 (시각 + 산란 시 부모각)
                b.isScattered = false;      // 분기 자식 여부 — 자식은 더 분기 X
                world.spawn(b);
                // 반동 약함 (광역 무기)
                this.vx -= Math.cos(this.angle) * 2;
                this.vy -= Math.sin(this.angle) * 2;
                if (playSound && window.SFX) window.SFX.laser("god");   // 임시 — 추후 전용 SFX
                break;
            }
            case "laser":
            default: {
                const dx = Input.worldX - wx, dy = Input.worldY - wy;
                const ang = Math.atan2(dy, dx);
                const bulletSp = (wpn.bulletSpeed || 500) * spdMult;
                const bulletDmg = (wpn.damage || 8) + dmgBonus;
                const b = new Bullet(
                    wx + Math.cos(ang) * 4,
                    wy + Math.sin(ang) * 4,
                    Math.cos(ang) * bulletSp + this.vx,
                    Math.sin(ang) * bulletSp + this.vy,
                    this, bulletDmg, wpn.bulletLife,
                );
                b.weapon = wpn;
                world.spawn(b);
                // 반동 (포탑 1대당 작게 — 동시 발사면 합산되어 자연스러움)
                this.vx -= Math.cos(this.angle) * 3;
                this.vy -= Math.sin(this.angle) * 3;
                if (playSound && window.SFX) {
                    if (wpn.id === "heavy_laser") window.SFX.laser("heavy");
                    else window.SFX.laser("base");
                }
                break;
            }
            // 다음 phase 에서 추가: "scatter", "melee"
        }
    }

    // (Legacy) — 외부에서 _fireTurrets 호출되는 곳이 있다면 한 번 전체 발사
    _fireTurrets(world) {
        // 단발 mode: cooldown 무시하고 한 번 전부 발사 (godMode/디버그 호환용)
        for (const t of this.turrets) {
            const wpn = WEAPONS[t.weapon] || WEAPONS.base_laser;
            this._fireSingleTurret(t, wpn, world, t === this.turrets[0]);
        }
    }

    // Battleship 유도 미사일 (가까운 적 자동 추격, 없으면 마우스 방향)
    _firePlayerMissile(world) {
        let target = null, bd = 900 * 900;
        for (const e of world.entities) {
            if (!e.alive || e === this) continue;
            if (e.type !== "enemy" && e.type !== "rescue") continue;
            const dx = e.x - this.x, dy = e.y - this.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < bd) { bd = d2; target = e; }
        }
        if (!target) {
            target = { x: Input.worldX, y: Input.worldY, alive: true };
        }
        const ang = Math.atan2(target.y - this.y, target.x - this.x);
        const launchSp = 220;
        const m = new Missile(
            this.x + Math.cos(ang) * (this.r + 8),
            this.y + Math.sin(ang) * (this.r + 8),
            Math.cos(ang) * launchSp + this.vx * 0.5,
            Math.sin(ang) * launchSp + this.vy * 0.5,
            target, this, this.missileDamage,
        );
        m.armTimer = 0.15;
        world.spawn(m);
        if (window.SFX) window.SFX.missile();
    }

    // 갓모드 - 4개 네온 레이저 포탑 동시 발사 (대미지 200/발 × 4)
    _fireGodLasers(world) {
        const cosA = Math.cos(this.angle), sinA = Math.sin(this.angle);
        const turrets = [
            { x: this.r * 0.9, y: -this.r * 0.6 },
            { x: this.r * 0.9, y:  this.r * 0.6 },
            { x: this.r * 0.2, y: -this.r * 1.0 },
            { x: this.r * 0.2, y:  this.r * 1.0 },
        ];
        const aimX = Input.worldX, aimY = Input.worldY;
        const bsp = 1700;
        const dmg = 200;
        for (const t of turrets) {
            const wx = this.x + cosA * t.x - sinA * t.y;
            const wy = this.y + sinA * t.x + cosA * t.y;
            const dx = aimX - wx, dy = aimY - wy;
            const ang = Math.atan2(dy, dx);
            const b = new Bullet(
                wx + Math.cos(ang) * 6,
                wy + Math.sin(ang) * 6,
                Math.cos(ang) * bsp + this.vx * 0.5,
                Math.sin(ang) * bsp + this.vy * 0.5,
                this, dmg, 1.0,
            );
            b.isGodLaser = true;
            world.spawn(b);
        }
    }

    // 갓모드 V키 - 유도 미사일 (가까운 적 자동 추격, 없으면 마우스 방향 waypoint)
    _fireGodMissile(world) {
        let target = null, bd = 2000 * 2000;
        for (const e of world.entities) {
            if (!e.alive || e === this) continue;
            if (e.type !== "enemy" && e.type !== "merchant" &&
                e.type !== "pirate" && e.type !== "rescue") continue;
            const dx = e.x - this.x, dy = e.y - this.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < bd) { bd = d2; target = e; }
        }
        if (!target) {
            // 가상 타겟 (마우스 방향 waypoint)
            target = { x: Input.worldX, y: Input.worldY, alive: true };
        }
        const ang = Math.atan2(target.y - this.y, target.x - this.x);
        const launchSp = 280;
        const m = new Missile(
            this.x + Math.cos(ang) * (this.r + 8),
            this.y + Math.sin(ang) * (this.r + 8),
            Math.cos(ang) * launchSp + this.vx * 0.5,
            Math.sin(ang) * launchSp + this.vy * 0.5,
            target, this, 500,   // 무지막지 데미지
        );
        m.armTimer = 0;
        m.maxSpeed = 900;
        m.thrust = 1200;
        world.spawn(m);
    }

    takeDamage(dmg, world, attacker) {
        if (this.godMode) return;   // 갓모드 - 데미지 무시
        if (this.invuln > 0) return;
        this.hp -= dmg;
        this.invuln = 0.4;
        world.camera.addShake(6);
        if (this.hp <= 0) { this.hp = 0; this.alive = false; }
    }

    draw(ctx) {
        this.drawCargoChain(ctx);

        // 갓모드 - 함선 외곽 네온 글로우
        if (this.godMode) {
            const t = (performance.now() / 200) % TAU;
            const pulse = 0.5 + Math.sin(t) * 0.5;
            ctx.strokeStyle = `rgba(160, 255, 255, ${0.5 + pulse * 0.4})`;
            ctx.lineWidth = 2;
            ctx.shadowColor = "#5fffe0";
            ctx.shadowBlur = 14 + pulse * 6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r + 6 + pulse * 2, 0, TAU);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        const accelLen = Math.hypot(this.vx, this.vy);
        if (accelLen > 8 && this.fuel > 0) {
            const flick = 0.6 + Math.random() * 0.8;
            ctx.fillStyle = "rgba(255, 170, 60, 0.9)";
            ctx.beginPath();
            ctx.moveTo(-this.r * 0.6, -4);
            ctx.lineTo(-this.r * (1.4 + flick), 0);
            ctx.lineTo(-this.r * 0.6, 4);
            ctx.closePath();
            ctx.fill();
        }
        const blink = this.invuln > 0 && Math.floor(this.invuln * 30) % 2 === 0;
        ctx.fillStyle = blink ? "#ffffff" : "#3aa7ff";
        ctx.strokeStyle = "#cfe7ff";
        ctx.lineWidth = 2;

        if (this.tier === 0) {
            // Frigate - 화살촉
            ctx.beginPath();
            ctx.moveTo(this.r + 4, 0);
            ctx.lineTo(-this.r, -this.r * 0.8);
            ctx.lineTo(-this.r * 0.5, 0);
            ctx.lineTo(-this.r, this.r * 0.8);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = "#0e1e36";
            ctx.beginPath();
            ctx.arc(2, 0, 3.5, 0, TAU);
            ctx.fill();
        } else if (this.tier === 1) {
            // Destroyer - 가로로 길쭉
            const rx = this.r * 1.4, ry = this.r * 0.9;
            ctx.beginPath();
            ctx.moveTo(rx, 0);
            ctx.lineTo(rx * 0.7, -ry * 0.7);
            ctx.lineTo(-rx * 0.55, -ry * 0.95);
            ctx.lineTo(-rx * 0.9, -ry * 0.4);
            ctx.lineTo(-rx * 0.9,  ry * 0.4);
            ctx.lineTo(-rx * 0.55,  ry * 0.95);
            ctx.lineTo(rx * 0.7,  ry * 0.7);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = "#5fd0ff";
            ctx.fillRect(-this.r * 0.3, -this.r * 0.28, this.r * 0.7, this.r * 0.56);
            ctx.fillStyle = "#0e1e36";
            ctx.fillRect(-this.r * 0.2, -this.r * 0.18, this.r * 0.5, this.r * 0.36);
        } else if (this.tier === 2) {
            // Cruiser - 화살촉 + 양쪽 날개
            ctx.beginPath();
            ctx.moveTo(this.r * 1.15, 0);
            ctx.lineTo(this.r * 0.3, -this.r * 0.8);
            ctx.lineTo(-this.r * 0.4, -this.r * 1.0);
            ctx.lineTo(-this.r * 0.85, -this.r * 0.4);
            ctx.lineTo(-this.r * 0.85,  this.r * 0.4);
            ctx.lineTo(-this.r * 0.4,  this.r * 1.0);
            ctx.lineTo(this.r * 0.3,  this.r * 0.8);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = "#5fd0ff";
            ctx.fillRect(-this.r * 0.3, -this.r * 0.35, this.r * 0.65, this.r * 0.7);
            ctx.fillStyle = "#0e1e36";
            ctx.fillRect(-this.r * 0.2, -this.r * 0.25, this.r * 0.45, this.r * 0.5);
        } else {
            // Battleship - 거대 8각형 + 함교
            ctx.beginPath();
            ctx.moveTo(this.r, 0);
            ctx.lineTo(this.r * 0.6, -this.r * 0.85);
            ctx.lineTo(-this.r * 0.5, -this.r * 0.95);
            ctx.lineTo(-this.r, -this.r * 0.4);
            ctx.lineTo(-this.r, this.r * 0.4);
            ctx.lineTo(-this.r * 0.5, this.r * 0.95);
            ctx.lineTo(this.r * 0.6, this.r * 0.85);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = "#5fd0ff";
            ctx.fillRect(-this.r * 0.2, -this.r * 0.4, this.r * 0.55, this.r * 0.8);
            ctx.fillStyle = "#0e1e36";
            ctx.fillRect(-this.r * 0.1, -this.r * 0.3, this.r * 0.35, this.r * 0.6);
        }

        // 포탑 점들 (네온 청록 / godMode 시 청백 + glow)
        const turretColor = this.godMode ? "#a0ffff" : "#5fd0ff";
        if (this.godMode) { ctx.shadowColor = turretColor; ctx.shadowBlur = 6; }
        ctx.fillStyle = turretColor;
        for (const t of (this.turrets || [])) {
            ctx.beginPath();
            ctx.arc(t.x, t.y, 3.5, 0, TAU);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // 미사일 포드 (Battleship+)
        if (this.hasMissile) {
            ctx.fillStyle = "#7a4030";
            ctx.fillRect(this.r * 0.25, -this.r * 0.72, this.r * 0.3, this.r * 0.18);
            ctx.fillRect(this.r * 0.25,  this.r * 0.54, this.r * 0.3, this.r * 0.18);
            ctx.fillStyle = "#ff8244";
            ctx.fillRect(this.r * 0.48, -this.r * 0.66, this.r * 0.06, this.r * 0.06);
            ctx.fillRect(this.r * 0.48,  this.r * 0.60, this.r * 0.06, this.r * 0.06);
        }
        ctx.restore();

        // 골드 플로터 (위로 떠오르며 fade)
        if (this._goldFloater && this._goldFloater.life > 0) {
            const f = this._goldFloater;
            const t = 1 - f.life / f.maxLife;
            const alpha = f.life / f.maxLife;
            const yOff = -this.r - 18 - t * 36;
            ctx.fillStyle = f.amount < 0
                ? `rgba(255, 130, 144, ${alpha})`
                : `rgba(255, 216, 107, ${alpha})`;
            ctx.font = "bold 18px Consolas, monospace";
            ctx.textAlign = "center";
            ctx.fillText(`${f.amount > 0 ? "+" : ""}${f.amount} G`, this.x, this.y + yOff);
        }
    }
}
Object.assign(Player.prototype, ChainMixin);

// -------------------------------------------------------------------
class Bullet extends Entity {
    constructor(x, y, vx, vy, owner, damage, life) {
        super(x, y, 3);
        this.type = "bullet";
        this.vx = vx; this.vy = vy;
        this.owner = owner;            // 발사한 함선 (자기 자신 제외 모두 타격)
        this.damage = damage;
        this.life = life;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }
    draw(ctx) {
        const ang = Math.atan2(this.vy, this.vx);
        let len = 12, width = 2.5, color = "#ffe066", glow = 0;
        // bullet.weapon 우선 (플레이어 무기 슬롯 시각화). 없으면 owner.type fallback.
        if (this.weapon) {
            color = this.weapon.color;
            len   = this.weapon.len;
            width = this.weapon.width;
            glow  = this.weapon.glow;
            // 갓모드만 별도 — 모든 무기 위에 godLaser 시각 오버라이드
            if (this.isGodLaser || (this.owner && this.owner.godMode && this.owner.tier === 0)) {
                color = "#a0ffff"; len = 38; width = 4.4; glow = 14;
            }
            // 웨이브 무기 — 진행할수록 확장되는 부채꼴 (concentric arcs)
            if (this.weapon.weaponType === "wave") {
                const w = this.weapon;
                // age 진행률 0(갓 발사) → 1(소멸 직전)
                const lifeMax = w.bulletLife || 0.55;
                const progress = Math.max(0, Math.min(1, 1 - (this.life / lifeMax)));
                const baseLen = w.baseLen || 70;
                const maxLen  = w.maxLen  || 180;
                const curLen = baseLen + (maxLen - baseLen) * progress;
                const halfLen = curLen / 2;
                const baseSpread = w.baseSpread || 0.35;
                const maxSpread  = w.maxSpread  || 0.75;
                const spread = baseSpread + (maxSpread - baseSpread) * progress;
                const c = Math.cos(ang), s = Math.sin(ang);
                // arc origin: bullet 뒤 (반대방향). progress 따라 더 뒤로 이동 (호가 멀리 보이게)
                const ox = this.x - c * halfLen * 0.7;
                const oy = this.y - s * halfLen * 0.7;
                const N = 6;
                ctx.shadowColor = color;
                ctx.shadowBlur = glow + progress * 6;
                ctx.lineCap = "round";
                for (let i = 0; i < N; i++) {
                    const t = (i + 1) / N;             // 0.16 ~ 1.0
                    const pulse = 1 + Math.sin((this.life || 0) * 16 + i * 0.7) * 0.05;
                    const radius = halfLen * (0.50 + 1.10 * t) * pulse;
                    const alpha = (1 - t * 0.50) * (1 - progress * 0.25);
                    const lineW = Math.max(1.6, (w.width || 10) * (1.05 - t * 0.45));
                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = lineW;
                    ctx.beginPath();
                    ctx.arc(ox, oy, radius, ang - spread, ang + spread);
                    ctx.stroke();
                }
                // 선두 강조 호 — 더 밝게
                ctx.globalAlpha = 0.8 * (1 - progress * 0.3);
                ctx.strokeStyle = "rgba(240, 210, 255, 0.95)";
                ctx.lineWidth = Math.max(1, (w.width || 10) * 0.30);
                ctx.beginPath();
                ctx.arc(ox, oy, halfLen * 1.65, ang - spread * 0.85, ang + spread * 0.85);
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
                return;
            }
        } else if (this.owner) {
            switch (this.owner.type) {
                case "player":
                    if (this.isGodLaser || (this.owner && this.owner.godMode)) {
                        color = "#a0ffff"; len = 38; width = 4.4; glow = 14;
                    } else {
                        color = "#ffe066";
                    }
                    break;
                case "enemy":    color = "#ff6b78"; break;
                case "merchant": color = "#5fffe0"; len = 32; width = 3.4; glow = 10; break;
                case "pirate":   color = "#d68aff"; len = 26; width = 3.0; glow = 8;  break;
                case "rescue":
                    if (this.owner && this.owner.state === "hostile") {
                        color = "#a0e0ff"; len = 28; width = 3.2; glow = 9;
                    } else { color = "#ff6b78"; }
                    break;
            }
        }
        const x2 = this.x - Math.cos(ang) * len;
        const y2 = this.y - Math.sin(ang) * len;
        if (glow > 0) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        if (glow > 0) ctx.shadowBlur = 0;
    }
}


// -------------------------------------------------------------------
// Missile - 미사일 (target 추격, 소행성에 맞으면 둘 다 폭파)
// -------------------------------------------------------------------
class Missile extends Entity {
    constructor(x, y, vx, vy, target, owner, damage = 35) {
        super(x, y, 5);
        this.type = "missile";
        // 자체 angle/speed 추적 (vx/vy 가 angle 따라 매 프레임 재계산)
        this.angle = Math.atan2(vy, vx);
        this.speed = Math.hypot(vx, vy);
        this.vx = vx; this.vy = vy;
        this.target = target;
        this.owner = owner;
        this.damage = damage;
        this.life = 6.0;
        this.thrust = 700;        // 가속 속도
        this.maxSpeed = 620;
        this.turnRate = Math.PI * 2;   // 한바퀴 1초 - 공격적 추격
        this.trail = [];
        this.armTimer = 0.15;     // 발사 후 0.15초간은 발사자 무시 (관통)
    }
    update(dt /*, world */) {
        if (this.armTimer > 0) this.armTimer -= dt;

        // 추격: angle을 target 방향으로 turnRate*dt 만큼 회전
        if (this.target && this.target.alive) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const desiredAng = Math.atan2(dy, dx);
            let diff = desiredAng - this.angle;
            while (diff > Math.PI)  diff -= TAU;
            while (diff < -Math.PI) diff += TAU;
            const maxTurn = this.turnRate * dt;
            if (diff >  maxTurn) diff =  maxTurn;
            else if (diff < -maxTurn) diff = -maxTurn;
            this.angle += diff;
        }

        // 자체 추진력으로 speed 증가 (maxSpeed 한도까지)
        this.speed = Math.min(this.maxSpeed, this.speed + this.thrust * dt);

        // 속도 벡터를 angle 따라 갱신 (관성을 추격에 종속시킴 - 곧장 따라가도록)
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;

        // 트레일
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 14) this.trail.shift();

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }
    draw(ctx) {
        // 트레일
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (i / this.trail.length) * 0.6;
            ctx.fillStyle = `rgba(255, 180, 60, ${alpha})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2 + i * 0.25, 0, TAU);
            ctx.fill();
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = "#c5c5d0";
        ctx.strokeStyle = "#ff8244";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(9, 0);
        ctx.lineTo(-2, -3);
        ctx.lineTo(-5, -2);
        ctx.lineTo(-5, 2);
        ctx.lineTo(-2, 3);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // 화염
        ctx.fillStyle = "rgba(255, 220, 80, 0.85)";
        ctx.beginPath();
        ctx.moveTo(-5, -2);
        ctx.lineTo(-9 - Math.random() * 4, 0);
        ctx.lineTo(-5, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// -------------------------------------------------------------------
// Explosion - 시각 전용 (충돌/데미지 없음). 미사일/소행성 폭파 시 스폰.
// -------------------------------------------------------------------
class Explosion extends Entity {
    constructor(x, y, scale = 1, startDelay = 0, color = "yellow") {
        super(x, y, 0);
        this.type = "explosion";
        this.scale = Math.max(8, scale);
        this.life = 0.55;
        this.maxLife = 0.55;
        this.startDelay = startDelay;
        this.color = color;   // "yellow" | "cyan" | "purple"
        this.particles = [];
        const count = 14 + Math.floor(scale / 8);
        for (let i = 0; i < count; i++) {
            const a = Math.random() * TAU;
            const sp = 100 + Math.random() * 240;
            this.particles.push({
                x: 0, y: 0,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                size: 2 + Math.random() * 3.5,
            });
        }
    }
    update(dt) {
        if (this.startDelay > 0) {
            this.startDelay -= dt;
            if (this.startDelay > 0) return;
        }
        for (const p of this.particles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= Math.exp(-dt * 2.5);
            p.vy *= Math.exp(-dt * 2.5);
        }
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }
    draw(ctx) {
        if (this.startDelay > 0) return;
        const t = this.life / this.maxLife;
        // 색상 팔레트 (color 옵션 기준)
        let flashRGB, particleRGB, ringRGB;
        if (this.color === "cyan") {
            flashRGB    = "180, 230, 255";
            particleRGB = "95, 208, 255";
            ringRGB     = "120, 220, 255";
        } else if (this.color === "purple") {
            flashRGB    = "230, 190, 255";
            particleRGB = "200, 122, 255";
            ringRGB     = "215, 150, 255";
        } else {
            // yellow (default)
            flashRGB    = "255, 240, 160";
            particleRGB = `255, ${Math.floor(180 * t + 40)}, ${Math.floor(40 * t)}`;
            ringRGB     = "255, 180, 90";
        }
        // 중앙 플래시
        ctx.fillStyle = `rgba(${flashRGB}, ${t * 0.35})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.scale * (1.4 - t * 0.8), 0, TAU);
        ctx.fill();
        // 파티클
        for (const p of this.particles) {
            ctx.fillStyle = `rgba(${particleRGB}, ${t})`;
            ctx.beginPath();
            ctx.arc(this.x + p.x, this.y + p.y, p.size * (1.2 - 0.5 * (1 - t)), 0, TAU);
            ctx.fill();
        }
        // 외부 충격파
        ctx.strokeStyle = `rgba(${ringRGB}, ${t * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.scale * (1 - t) * 2.2, 0, TAU);
        ctx.stroke();
    }
}

// -------------------------------------------------------------------
class Asteroid extends Entity {
    constructor(x, y, r, seed) {
        super(x, y, r);
        this.type = "asteroid";
        const rng = Util.seededRng(seed);
        this.vx = (rng() - 0.5) * 6;
        this.vy = (rng() - 0.5) * 6;
        this.spin = (rng() - 0.5) * 0.4;
        this.rot  = rng() * TAU;
        const verts = 12;
        this.shape = [];
        for (let i = 0; i < verts; i++) {
            const a = (i / verts) * TAU;
            const rr = r * (0.78 + rng() * 0.34);
            this.shape.push([Math.cos(a) * rr, Math.sin(a) * rr]);
        }
        this.color = "#3a3530";
        this.edge  = "#6b6258";
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rot += this.spin * dt;
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.edge;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.shape.length; i++) {
            const [vx, vy] = this.shape[i];
            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// -------------------------------------------------------------------
// Enemy - 현상금 사냥꾼 AI (상태 머신)
//   state: idle / hunting / collecting / selling / repairing / fleeing_merchant
// -------------------------------------------------------------------
class Enemy extends Entity {
    constructor(x, y, seed = 0) {
        super(x, y, 13);
        this.type = "enemy";
        this.angle = 0;
        this.maxSpeed = 180 + ((seed >>> 4) & 31) * 2;
        this.thrust   = 260;
        this.maxHp = 30;
        this.hp = 30;
        this.fireCooldown = Math.random() * 1.2;
        this.fireRate = 1.1;
        this.detectRange = 900;
        this.engageRange = 520;
        this.fleeRange   = 180;   // Frigate 는 근접 브롤러 (덜 후퇴)

        // 함선 종류 / 포탑 정의 (자식 클래스에서 override 가능)
        this.shipClassName = "Frigate";
        this.turrets = [{ x: this.r + 2, y: 0 }];   // 1 포탑 (함체 앞쪽)
        this.bulletSpeed = 480;
        this.bulletDamage = 8;
        this.bulletLife = 1.4;

        // 미사일 (Battleship 만 사용)
        this.hasMissile = false;
        this.missileCooldown = 2.0;
        this.missileRate = 2.5;
        this.missileDamage = 30;

        this.cargoChain = [];
        this.gold = 0;

        // AI 상태
        this.state = "idle";
        this.stateTimer = 0;       // 다음 재평가까지의 시간
        this.target = null;
        this.repairTimer = 0;

        this.MERCHANT_AVOID_DIST = 500;
        this.SELL_TRIGGER = 5;        // cargo 5개 이상이면 sell 모드

        // === 함선 종류별 AI 성격 파라미터 (1.1) ===
        // aggressiveness  : 0(소심) ~ 1(공격적) — 추적시 추력/접근욕구에 곱해짐
        // optimalRange    : 선호하는 교전 거리 (1.4 카이팅 알고리즘에서 사용 예정)
        // kitingEnabled   : 카이팅(거리 유지하며 사격) 사용 여부 (1.4 에서 사용 예정)
        // HP_REPAIR_RATIO : 이 HP 비율 아래면 정비소로 후퇴
        this.aggressiveness  = 0.95;  // Frigate: 매우 공격적
        this.optimalRange    = 300;   // Frigate: 근거리 선호
        this.kitingEnabled   = false; // Frigate: 카이팅 안함 (저돌적)
        this.HP_REPAIR_RATIO = 0.25;  // Frigate: HP 25% 까지 버팀

        // === 사격 정밀도 (1.2) ===
        // aimAccuracy : 0=직접 조준, 1=완벽한 lead aiming (탄속/거리 기반 예측)
        // aimSpread   : 탄착 산포 (라디안, 양쪽으로 ± 절반)
        this.aimAccuracy = 0.5;   // Frigate: 미숙한 양산형 — lead 절반만 적용
        this.aimSpread   = 0.09;  // Frigate: 산포 큼 (~5도)

        // === Grudge memory (1.3) ===
        // 자기를 공격한 entity 를 5초간 기억하고 우선 타깃으로 전환
        this.attackedBy = new Map();    // entity -> { lastHitAt, totalDamage }
        this.lifeTime = 0;              // grudge 타임스탬프용 누적 시간
        this.GRUDGE_DURATION = 5.0;     // 5초

        // === Kiting (1.4) ===
        // strafeDir: +1 시계방향, -1 반시계방향 — 카이팅시 측면 이동 방향
        this.strafeDir   = (Math.random() < 0.5 ? 1 : -1);
        this.strafeTimer = 2 + Math.random() * 3;
    }

    cargoSpeedFactor() {
        return Math.max(CARGO_FACTOR_MIN, 1 - CARGO_SPEED_PENALTY * this.cargoChain.length);
    }

    // === 1.5 Utility AI — 점수 기반 state 선택 ===
    // 각 후보 state 에 0~2 범위 점수를 계산하고 최대값 선택. 현재 state 가 후보에 있으면
    // hysteresis 보너스를 줘서 진동(매 0.3초마다 state 바뀜) 방지.
    // 점수 설계 원칙:
    //  - 자기보존 (상선 회피, HP 낮음) → 0.8 ~ 2.0  (절대 우위)
    //  - 거점 활동 (sell)              → 0.6 ~ 1.2
    //  - Grudge                        → 0.65 (개인적 원한, 컨텍스트 중립)
    //  - 기회주의 (collect/hunt)       → 0.15 ~ 0.6 (거리/HP/aggressiveness 가중)
    //  - idle                          → 0 (fallback)
    pickState(world) {
        const cands = [];   // { state, score, target }

        // [1] 정규 상선 회피 — 매우 높음. 가까울수록 강해짐.
        let merchantThreat = null, mtD = Infinity;
        for (const e of world.entities) {
            if (e.type !== "merchant" || !e.alive) continue;
            const d = Util.dist(this.x, this.y, e.x, e.y);
            if (d < this.MERCHANT_AVOID_DIST && d < mtD) { mtD = d; merchantThreat = e; }
        }
        if (merchantThreat) {
            const closeness = 1 - mtD / this.MERCHANT_AVOID_DIST;
            cands.push({ state: "fleeing_merchant", score: 1.5 + closeness * 0.5, target: merchantThreat });
        }

        // [2] HP 위급 — HP_REPAIR_RATIO 임계점에서 0.8, HP 0% 면 1.5
        const hpRatio = this.hp / this.maxHp;
        if (hpRatio < this.HP_REPAIR_RATIO) {
            const station = world.nearestShipyardFrom(this.x, this.y);
            if (station) {
                const urgency = 1 - hpRatio / this.HP_REPAIR_RATIO;
                cands.push({ state: "repairing", score: 0.8 + urgency * 0.7, target: station });
            }
        }

        // [3] Sell — 카고 SELL_TRIGGER 초과량에 비례
        if (this.cargoChain.length >= this.SELL_TRIGGER) {
            const pirate = world.nearestPirateMerchantFrom(this.x, this.y);
            if (pirate) {
                const cargoExcess = Math.min(1, (this.cargoChain.length - this.SELL_TRIGGER) / 10);
                cands.push({ state: "selling", score: 0.6 + cargoExcess * 0.6, target: pirate });
            }
        }

        // [4] Grudge — 최근 공격자
        const grudge = this._pickGrudgeTarget(world);
        if (grudge) {
            cands.push({ state: "hunting", score: 0.65, target: grudge });
        }

        // [5] Collect — 자유 카고 줍기 (거리 기반)
        let nearestCargo = null, ncD = 400 * 400;
        for (const e of world.entities) {
            if (e.type !== "cargo" || !e.alive || e.pickupCooldown > 0) continue;
            const d2 = Util.dist2(this.x, this.y, e.x, e.y);
            if (d2 < ncD) { ncD = d2; nearestCargo = e; }
        }
        if (nearestCargo) {
            const d = Math.sqrt(ncD);
            const score = 0.20 + (1 - d / 400) * 0.30;
            cands.push({ state: "collecting", score, target: nearestCargo });
        }

        // [6] Hunt enemy — 거리 + 적 HP 약함 + aggressiveness
        let nearestEnemy = null, neD = 700 * 700;
        for (const e of world.entities) {
            if (e.type !== "enemy" || !e.alive || e === this) continue;
            const d2 = Util.dist2(this.x, this.y, e.x, e.y);
            if (d2 < neD) { neD = d2; nearestEnemy = e; }
        }
        if (nearestEnemy) {
            const d = Math.sqrt(neD);
            const weakBonus = 1 - (nearestEnemy.hp / Math.max(1, nearestEnemy.maxHp));
            const base = 0.15 + (1 - d / 700) * 0.25 + weakBonus * 0.10;
            const score = base * (0.6 + this.aggressiveness * 0.4);
            cands.push({ state: "hunting", score, target: nearestEnemy });
        }

        // [7] Hunt player — 거리 + aggressiveness
        const p = world.player;
        if (p && p.alive) {
            const d = Util.dist(this.x, this.y, p.x, p.y);
            if (d < this.detectRange) {
                const base = 0.15 + (1 - d / this.detectRange) * 0.30;
                const score = base * (0.6 + this.aggressiveness * 0.4);
                cands.push({ state: "hunting", score, target: p });
            }
        }

        // [8] Idle 폴백
        cands.push({ state: "idle", score: 0, target: null });

        // Hysteresis — 현재 state+target 일치하면 +0.10 (진동 방지)
        for (const c of cands) {
            if (c.state === this.state && c.target === this.target) {
                c.score += 0.10;
            }
        }

        // Pick max
        let best = cands[0];
        for (const c of cands) {
            if (c.score > best.score) best = c;
        }
        this.state  = best.state;
        this.target = best.target;
    }

    // === 1.3 grudge target picker ===
    // 최근 GRUDGE_DURATION 초 이내 자기를 공격한 살아있는 entity 중
    // (최근일수록 + 더 맞을수록 + 가까울수록) 점수 높은 놈 반환.
    // 감지 범위는 detectRange * 1.3 (한 번 어그로 끌리면 좀 더 멀어도 추적).
    _pickGrudgeTarget(world) {
        let best = null, bestScore = -1;
        const maxRange = this.detectRange * 1.3;
        for (const [entity, info] of this.attackedBy) {
            if (!entity || !entity.alive) continue;
            const age = this.lifeTime - info.lastHitAt;
            if (age > this.GRUDGE_DURATION) continue;
            const d = Util.dist(this.x, this.y, entity.x, entity.y);
            if (d > maxRange) continue;
            // 점수: 최근(2) + 누적피해(1) + 거리(1)
            const recencyScore = (1 - age / this.GRUDGE_DURATION) * 2;
            const damageScore  = Math.min(1, info.totalDamage / 30) * 1;
            const distScore    = Math.max(0, 1 - d / maxRange) * 1;
            const score = recencyScore + damageScore + distScore;
            if (score > bestScore) { bestScore = score; best = entity; }
        }
        return best;
    }

    _seek(tx, ty, dt, thrustMult = 1) {
        const dx = tx - this.x, dy = ty - this.y;
        const ang = Math.atan2(dy, dx);
        this.vx += Math.cos(ang) * this.thrust * thrustMult * dt;
        this.vy += Math.sin(ang) * this.thrust * thrustMult * dt;
        this.angle = ang;
    }
    _flee(fx, fy, dt) {
        const dx = this.x - fx, dy = this.y - fy;
        const ang = Math.atan2(dy, dx);
        this.vx += Math.cos(ang) * this.thrust * 1.2 * dt;
        this.vy += Math.sin(ang) * this.thrust * 1.2 * dt;
        this.angle = ang;
    }
    // === 1.4 strafe: 적 향한 채 측면 이동 (카이팅 코어) ===
    _strafe(tx, ty, dt) {
        const dx = tx - this.x, dy = ty - this.y;
        const ang = Math.atan2(dy, dx);
        // 측면 방향 (시계 / 반시계)
        const perp = ang + Math.PI / 2 * this.strafeDir;
        this.vx += Math.cos(perp) * this.thrust * 0.85 * dt;
        this.vy += Math.sin(perp) * this.thrust * 0.85 * dt;
        this.angle = ang;  // 함체는 적 바라봄 (사격 위해)
    }

    update(dt, world) {
        // 1.3 grudge: lifeTime 누적 (타임스탬프 비교용)
        this.lifeTime += dt;
        // 1.4 kiting: 측면 방향 주기적 재추첨 (2~5초)
        this.strafeTimer -= dt;
        if (this.strafeTimer <= 0) {
            this.strafeDir = (Math.random() < 0.5 ? 1 : -1);
            this.strafeTimer = 2 + Math.random() * 3;
        }

        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
            this.pickState(world);
            this.stateTimer = 0.3;
        }

        const t = this.target;
        switch (this.state) {
            case "fleeing_merchant":
                if (t && t.alive) {
                    this._flee(t.x, t.y, dt);
                    const d = Util.dist(this.x, this.y, t.x, t.y);
                    if (d > this.MERCHANT_AVOID_DIST + 100) this.stateTimer = 0;
                } else this.stateTimer = 0;
                break;
            case "repairing":
                if (t && t.alive) {
                    const dx = t.x - this.x, dy = t.y - this.y;
                    const d = Math.hypot(dx, dy);
                    if (d > t.repairRange * 0.6) {
                        this._seek(t.x, t.y, dt);
                        this.repairTimer = 0;
                    } else {
                        // 정지
                        this.vx *= Math.exp(-dt * 4);
                        this.vy *= Math.exp(-dt * 4);
                        const sp = Math.hypot(this.vx, this.vy);
                        if (sp < 8) this.repairTimer += dt;
                        if (this.repairTimer >= 2.0) {
                            this.hp = Math.min(this.maxHp, this.hp + 25 * dt);
                            if (this.hp >= this.maxHp) {
                                this.repairTimer = 0;
                                this.stateTimer = 0;
                            }
                        }
                    }
                } else this.stateTimer = 0;
                break;
            case "selling":
                if (t && t.alive) {
                    const dx = t.x - this.x, dy = t.y - this.y;
                    const d = Math.hypot(dx, dy);
                    if (d > t.r + this.r + 8) {
                        this._seek(t.x, t.y, dt);
                    } else {
                        // 도착 - 카고 판매
                        if (this.cargoChain.length > 0) {
                            const n = this.cargoChain.length;
                            // 적 함선도 같은 카고 단가 (50G/개 × priceMultiplier)
                            this.gold += Math.round(n * (t.priceMultiplier || 0.5) * 50);
                            this.cargoChain = [];
                            // 상선 측에 적 매출 통보 (도주 트리거)
                            if (t.onEnemyCargoSale) t.onEnemyCargoSale(n, world);
                            this.stateTimer = 0;
                        }
                    }
                } else this.stateTimer = 0;
                break;
            case "collecting":
                if (t && t.alive) {
                    this._seek(t.x, t.y, dt);
                    // 픽업은 Cargo.update에서 처리
                } else this.stateTimer = 0;
                break;
            case "hunting":
                if (t && t.alive) {
                    const dx = t.x - this.x, dy = t.y - this.y;
                    const d = Math.hypot(dx, dy);
                    this.angle = Math.atan2(dy, dx);

                    // === 1.4 거리 4구간 행동 ===
                    // [< fleeRange]               : 후퇴 (너무 가까움)
                    // [fleeRange ~ optimalRange]  : kitingEnabled 면 측면이동, 아니면 천천히 접근
                    // [optimalRange ~ engageRange]: 적정 거리 — 천천히 접근 (거리 유지)
                    // [> engageRange]             : 적극 접근
                    const fullThrust = 0.5 + this.aggressiveness * 0.9;
                    if (d < this.fleeRange) {
                        this._flee(t.x, t.y, dt);
                        this.angle = Math.atan2(dy, dx);
                    } else if (d < this.optimalRange) {
                        if (this.kitingEnabled) {
                            this._strafe(t.x, t.y, dt);
                        } else {
                            // 비카이팅: 살짝만 접근 (압박 유지)
                            this._seek(t.x, t.y, dt, fullThrust * 0.4);
                        }
                    } else if (d < this.engageRange) {
                        // 적정 거리 — 절반 추력으로 천천히 접근
                        this._seek(t.x, t.y, dt, fullThrust * 0.55);
                    } else {
                        // 멀음 — 풀스로틀 접근
                        this._seek(t.x, t.y, dt, fullThrust);
                    }

                    // === 사격 ===
                    this.fireCooldown -= dt;
                    if (d < this.engageRange && this.fireCooldown <= 0) {
                        this.fireCooldown = this.fireRate;
                        this._fireTurrets(world, t);
                    }
                    if (this.hasMissile) {
                        this.missileCooldown -= dt;
                        if (this.missileCooldown <= 0 && d < this.engageRange * 1.3) {
                            this.missileCooldown = this.missileRate;
                            this._fireMissile(world, t);
                        }
                    }
                } else this.stateTimer = 0;
                break;
            default: // idle
                this.vx *= Math.exp(-dt * 0.5);
                this.vy *= Math.exp(-dt * 0.5);
                break;
        }

        // 카고 페널티 반영된 maxSpeed 캡
        const adjMax = this.maxSpeed * this.cargoSpeedFactor();
        const sp = Math.hypot(this.vx, this.vy);
        if (sp > adjMax) { this.vx *= adjMax / sp; this.vy *= adjMax / sp; }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // 카고 체인 시뮬
        this.updateCargoChain(dt, world);
    }

    _fireTurrets(world, target) {
        if (window.SFX) window.SFX.laser("enemy");
        const cosA = Math.cos(this.angle), sinA = Math.sin(this.angle);

        // === 1.2 예측 사격 (Lead Aiming) ===
        // 탄환이 표적에 도달할 시점의 표적 위치를 예측.
        // aimAccuracy(0~1)로 예측 정도 조절 — 신참은 0.5, 베테랑은 0.95.
        const dx0 = target.x - this.x, dy0 = target.y - this.y;
        const d0 = Math.hypot(dx0, dy0);
        const leadTime = d0 / Math.max(1, this.bulletSpeed);
        const tvx = target.vx || 0, tvy = target.vy || 0;
        const predX = target.x + tvx * leadTime * (this.aimAccuracy || 0);
        const predY = target.y + tvy * leadTime * (this.aimAccuracy || 0);
        const aimAng = Math.atan2(predY - this.y, predX - this.x);

        const spreadAmp = (this.aimSpread != null) ? this.aimSpread : 0.06;
        for (const t of this.turrets) {
            const wx = this.x + cosA * t.x - sinA * t.y;
            const wy = this.y + sinA * t.x + cosA * t.y;
            const spread = (Math.random() - 0.5) * spreadAmp;
            const ang = aimAng + spread;
            world.spawn(new Bullet(
                wx + Math.cos(ang) * 4,
                wy + Math.sin(ang) * 4,
                Math.cos(ang) * this.bulletSpeed,
                Math.sin(ang) * this.bulletSpeed,
                this, this.bulletDamage, this.bulletLife,
            ));
        }
    }

    _fireMissile(world, target) {
        const ang = Math.atan2(target.y - this.y, target.x - this.x);
        const cosA = Math.cos(ang), sinA = Math.sin(ang);
        // 측면에서 발사 (살짝 갈라짐)
        const sideOff = (Math.random() < 0.5 ? -1 : 1) * this.r * 0.6;
        const px = this.x - sinA * sideOff;
        const py = this.y + cosA * sideOff;
        const launchSp = 200;
        world.spawn(new Missile(
            px, py,
            Math.cos(ang) * launchSp + (Math.random() - 0.5) * 100,
            Math.sin(ang) * launchSp + (Math.random() - 0.5) * 100,
            target, this, this.missileDamage,
        ));
    }

    takeDamage(dmg, world, attacker) {
        this.hp -= dmg;
        this.stateTimer = Math.min(this.stateTimer, 0.1);

        // === 1.3 Grudge memory: attacker 기록 ===
        // bullet.owner 가 자기 자신 (자해 케이스) 이거나 죽은 entity 면 무시
        if (attacker && attacker !== this && attacker.alive !== false) {
            const prev = this.attackedBy.get(attacker) || { lastHitAt: 0, totalDamage: 0 };
            prev.lastHitAt   = this.lifeTime;
            prev.totalDamage = (prev.totalDamage || 0) + dmg;
            this.attackedBy.set(attacker, prev);
            // 너무 많이 쌓이지 않게 만료된 항목 정리
            if (this.attackedBy.size > 8) {
                for (const [e, info] of [...this.attackedBy]) {
                    if (!e || !e.alive || (this.lifeTime - info.lastHitAt) > this.GRUDGE_DURATION) {
                        this.attackedBy.delete(e);
                    }
                }
            }
        }

        if (this.hp <= 0) {
            this.alive = false;
            world.camera.addShake(4);
            // 자기 카고 모두 자유 카고로 떨굼
            for (const c of this.cargoChain) {
                const cargo = new Cargo(c.x, c.y, c.vx, c.vy);
                cargo.pickupCooldown = 1.0;
                world.spawn(cargo);
            }
            // 추가 보너스 카고 1~2개
            const rng = Util.seededRng(((this.x|0) * 73856093) ^ ((this.y|0) * 19349663));
            const drops = 1 + Math.floor(rng() * 2);
            for (let i = 0; i < drops; i++) {
                const a = rng() * TAU;
                const sp = 40 + rng() * 60;
                world.spawn(new Cargo(this.x, this.y, Math.cos(a) * sp, Math.sin(a) * sp));
            }
        }
    }

    draw(ctx) {
        // 카고 체인 (자기 꽁무니)
        this.drawCargoChain(ctx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = "#7a1f2c";
        ctx.strokeStyle = "#ff8290";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.r + 2, 0);
        ctx.lineTo(-this.r * 0.4, -this.r);
        ctx.lineTo(-this.r, -this.r * 0.4);
        ctx.lineTo(-this.r * 0.6, 0);
        ctx.lineTo(-this.r, this.r * 0.4);
        ctx.lineTo(-this.r * 0.4, this.r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ff5b6c";
        ctx.beginPath();
        ctx.arc(2, 0, 3, 0, TAU);
        ctx.fill();
        ctx.restore();

        if (this.hp < this.maxHp) {
            const w = Math.max(28, this.r * 2.2), h = 3;
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(this.x - w/2, this.y - this.r - 10, w, h);
            ctx.fillStyle = "#ff8290";
            ctx.fillRect(this.x - w/2, this.y - this.r - 10, w * (this.hp / this.maxHp), h);
        }
        // 함선 등급 라벨 (Frigate 만 라벨 X, 그 외엔 표시)
        if (this.shipClassName && this.shipClassName !== "Frigate") {
            ctx.fillStyle = "rgba(255, 130, 144, 0.85)";
            ctx.font = "10px Consolas, monospace";
            ctx.textAlign = "center";
            ctx.fillText(this.shipClassName, this.x, this.y - this.r - 18);
        }
    }
}
Object.assign(Enemy.prototype, ChainMixin);

// -------------------------------------------------------------------
// Destroyer - 양쪽으로 기다란 형태, 2 포탑
// -------------------------------------------------------------------
class Destroyer extends Enemy {
    constructor(x, y, seed = 0) {
        super(x, y, seed);
        this.r = 18;
        this.maxHp = 70;
        this.hp = 70;
        this.maxSpeed = 160 + ((seed >>> 4) & 31) * 2;
        this.thrust   = 240;
        this.fireRate = 1.0;
        this.detectRange = 950;
        this.engageRange = 540;
        this.fleeRange   = 280;   // Destroyer: 거리 유지 선호
        this.shipClassName = "Destroyer";
        // 2 포탑 양옆 끝
        this.turrets = [
            { x: this.r * 0.3, y: -this.r * 0.95 },
            { x: this.r * 0.3, y:  this.r * 0.95 },
        ];
        this.bulletDamage = 9;

        // AI 성격: 균형형 카이터 — 중거리에서 측면포 2문 운용
        this.aggressiveness  = 0.7;
        this.optimalRange    = 420;
        this.kitingEnabled   = true;
        this.HP_REPAIR_RATIO = 0.30;
        // 사격: 숙련된 사수
        this.aimAccuracy = 0.75;
        this.aimSpread   = 0.06;
    }
    draw(ctx) {
        // 카고
        this.drawCargoChain(ctx);
        // 본체
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = "#6a1a26";
        ctx.strokeStyle = "#ff8290";
        ctx.lineWidth = 2;
        // 가로로 길쭉한 형태 (가로 1.8 * r)
        const rx = this.r * 1.5, ry = this.r * 1.0;
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx * 0.7, -ry * 0.7);
        ctx.lineTo(-rx * 0.6, -ry * 0.9);
        ctx.lineTo(-rx * 0.9, -ry * 0.4);
        ctx.lineTo(-rx * 0.9,  ry * 0.4);
        ctx.lineTo(-rx * 0.6,  ry * 0.9);
        ctx.lineTo(rx * 0.7,  ry * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // 함교
        ctx.fillStyle = "#ff5b6c";
        ctx.fillRect(-this.r * 0.4, -this.r * 0.3, this.r * 0.7, this.r * 0.6);
        // 2 포탑
        ctx.fillStyle = "#ff8290";
        for (const t of this.turrets) {
            ctx.beginPath();
            ctx.arc(t.x, t.y, 4, 0, TAU);
            ctx.fill();
        }
        ctx.restore();
        // HP 바 + 라벨
        if (this.hp < this.maxHp) {
            const w = 44, h = 3;
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(this.x - w/2, this.y - this.r - 12, w, h);
            ctx.fillStyle = "#ff8290";
            ctx.fillRect(this.x - w/2, this.y - this.r - 12, w * (this.hp / this.maxHp), h);
        }
        ctx.fillStyle = "rgba(255, 130, 144, 0.9)";
        ctx.font = "10px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText("◆ DESTROYER ◆", this.x, this.y - this.r - 20);
    }
}
Object.assign(Destroyer.prototype, ChainMixin);

// -------------------------------------------------------------------
// Cruiser - 3 포탑 (앞 + 양 측면)
// -------------------------------------------------------------------
class Cruiser extends Enemy {
    constructor(x, y, seed = 0) {
        super(x, y, seed);
        this.r = 24;
        this.maxHp = 140;
        this.hp = 140;
        this.maxSpeed = 150 + ((seed >>> 4) & 31) * 2;
        this.thrust   = 220;
        this.fireRate = 0.9;
        this.detectRange = 1000;
        this.engageRange = 580;
        this.fleeRange   = 320;   // Cruiser: 신중함, 거리 두고 화력 투사
        this.shipClassName = "Cruiser";
        // 3 포탑: 앞 + 좌측 + 우측
        this.turrets = [
            { x: this.r * 0.9, y: 0 },
            { x: this.r * 0.0, y: -this.r * 0.85 },
            { x: this.r * 0.0, y:  this.r * 0.85 },
        ];
        this.bulletSpeed = 540;
        this.bulletDamage = 10;

        // AI 성격: 신중한 화력 플랫폼 — 일찍 후퇴, 중장거리 운용
        this.aggressiveness  = 0.6;
        this.optimalRange    = 480;
        this.kitingEnabled   = true;
        this.HP_REPAIR_RATIO = 0.40;
        // 사격: 정밀 화력 플랫폼
        this.aimAccuracy = 0.88;
        this.aimSpread   = 0.04;
    }
    draw(ctx) {
        this.drawCargoChain(ctx);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = "#5a2030";
        ctx.strokeStyle = "#ff8290";
        ctx.lineWidth = 2;
        // 본체 (다이아몬드 + 화살촉)
        ctx.beginPath();
        ctx.moveTo(this.r * 1.1, 0);
        ctx.lineTo(this.r * 0.3, -this.r * 0.8);
        ctx.lineTo(-this.r * 0.4, -this.r * 1.0);
        ctx.lineTo(-this.r * 0.85, -this.r * 0.4);
        ctx.lineTo(-this.r * 0.85,  this.r * 0.4);
        ctx.lineTo(-this.r * 0.4,  this.r * 1.0);
        ctx.lineTo(this.r * 0.3,  this.r * 0.8);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // 함교 (큰 직사각형)
        ctx.fillStyle = "#ff5b6c";
        ctx.fillRect(-this.r * 0.3, -this.r * 0.35, this.r * 0.6, this.r * 0.7);
        ctx.fillStyle = "#0e0a14";
        ctx.fillRect(-this.r * 0.2, -this.r * 0.25, this.r * 0.4, this.r * 0.5);
        // 3 포탑
        ctx.fillStyle = "#ff8290";
        for (const t of this.turrets) {
            ctx.beginPath();
            ctx.arc(t.x, t.y, 4, 0, TAU);
            ctx.fill();
        }
        ctx.restore();
        if (this.hp < this.maxHp) {
            const w = 56, h = 3;
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(this.x - w/2, this.y - this.r - 12, w, h);
            ctx.fillStyle = "#ff8290";
            ctx.fillRect(this.x - w/2, this.y - this.r - 12, w * (this.hp / this.maxHp), h);
        }
        ctx.fillStyle = "rgba(255, 130, 144, 0.9)";
        ctx.font = "10px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText("◆◆ CRUISER ◆◆", this.x, this.y - this.r - 20);
    }
}
Object.assign(Cruiser.prototype, ChainMixin);

// -------------------------------------------------------------------
// Battleship - 4 포탑 + 유도 미사일
// -------------------------------------------------------------------
class Battleship extends Enemy {
    constructor(x, y, seed = 0) {
        super(x, y, seed);
        this.r = 32;
        this.maxHp = 260;
        this.hp = 260;
        this.maxSpeed = 130 + ((seed >>> 4) & 31) * 2;
        this.thrust   = 200;
        this.fireRate = 0.75;
        this.detectRange = 1100;
        this.engageRange = 640;
        this.fleeRange   = 380;   // Battleship: 무겁고 둔함, 근접 차단 거리 큼
        this.shipClassName = "Battleship";
        // 4 포탑 (네 모서리)
        this.turrets = [
            { x: this.r * 0.55, y: -this.r * 0.5 },
            { x: this.r * 0.55, y:  this.r * 0.5 },
            { x: -this.r * 0.4, y: -this.r * 0.5 },
            { x: -this.r * 0.4, y:  this.r * 0.5 },
        ];
        this.bulletSpeed = 600;
        this.bulletDamage = 12;
        // 미사일 활성화
        this.hasMissile = true;
        this.missileCooldown = 2.5;
        this.missileRate = 3.0;
        this.missileDamage = 30;

        // AI 성격: 중장갑 압박형 — 일찍 후퇴, 장거리 미사일 우선, 카이팅 X (덩치)
        this.aggressiveness  = 0.5;
        this.optimalRange    = 560;
        this.kitingEnabled   = false;
        this.HP_REPAIR_RATIO = 0.50;
        // 사격: 베테랑급 정밀 (느린 발사속도 보완)
        this.aimAccuracy = 0.95;
        this.aimSpread   = 0.025;
    }
    draw(ctx) {
        this.drawCargoChain(ctx);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = "#4a1822";
        ctx.strokeStyle = "#ff8290";
        ctx.lineWidth = 2.5;
        // 거대 직사각형 (8각형)
        ctx.beginPath();
        ctx.moveTo(this.r, 0);
        ctx.lineTo(this.r * 0.6, -this.r * 0.85);
        ctx.lineTo(-this.r * 0.5, -this.r * 0.95);
        ctx.lineTo(-this.r, -this.r * 0.4);
        ctx.lineTo(-this.r, this.r * 0.4);
        ctx.lineTo(-this.r * 0.5, this.r * 0.95);
        ctx.lineTo(this.r * 0.6, this.r * 0.85);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // 함교
        ctx.fillStyle = "#ff5b6c";
        ctx.fillRect(-this.r * 0.2, -this.r * 0.4, this.r * 0.5, this.r * 0.8);
        ctx.fillStyle = "#0e0a14";
        ctx.fillRect(-this.r * 0.1, -this.r * 0.3, this.r * 0.3, this.r * 0.6);
        // 4 포탑
        ctx.fillStyle = "#ff8290";
        for (const t of this.turrets) {
            ctx.beginPath();
            ctx.arc(t.x, t.y, 5, 0, TAU);
            ctx.fill();
        }
        // 미사일 포드 (좌우 측면)
        ctx.fillStyle = "#7a4030";
        ctx.fillRect(this.r * 0.2, -this.r * 0.75, this.r * 0.3, this.r * 0.15);
        ctx.fillRect(this.r * 0.2,  this.r * 0.60, this.r * 0.3, this.r * 0.15);
        ctx.restore();
        if (this.hp < this.maxHp) {
            const w = 72, h = 4;
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(this.x - w/2, this.y - this.r - 14, w, h);
            ctx.fillStyle = "#ff8290";
            ctx.fillRect(this.x - w/2, this.y - this.r - 14, w * (this.hp / this.maxHp), h);
        }
        ctx.fillStyle = "rgba(255, 130, 144, 0.95)";
        ctx.font = "bold 11px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText("◆◆◆ BATTLESHIP ◆◆◆", this.x, this.y - this.r - 22);
    }
}
Object.assign(Battleship.prototype, ChainMixin);

// -------------------------------------------------------------------
class Cargo extends Entity {
    constructor(x, y, vx = 0, vy = 0) {
        super(x, y, 8);
        this.type = "cargo";
        this.vx = vx; this.vy = vy;
        this.life = 60;
        this.rot = Math.random() * TAU;
        this.spin = (Math.random() - 0.5) * 1.2;
        this.magnetRange = 110;
        this.pickupCooldown = 0;
    }
    update(dt, world) {
        if (this.pickupCooldown > 0) this.pickupCooldown -= dt;

        if (this.pickupCooldown <= 0) {
            // 자석 대상: player + 모든 적
            const candidates = [];
            const p = world.player;
            if (p && p.alive) candidates.push(p);
            for (const e of world.entities) {
                if (e.type === "enemy" && e.alive) candidates.push(e);
            }
            let nearest = null, ndSq = this.magnetRange * this.magnetRange;
            for (const t of candidates) {
                const dx = t.x - this.x, dy = t.y - this.y;
                const d2 = dx*dx + dy*dy;
                if (d2 < ndSq) { ndSq = d2; nearest = t; }
            }
            if (nearest) {
                const dx = nearest.x - this.x, dy = nearest.y - this.y;
                const d = Math.sqrt(ndSq) || 0.001;
                const pull = 600 / Math.max(d, 1);
                this.vx += (dx / d) * pull * dt * 60;
                this.vy += (dy / d) * pull * dt * 60;
                if (d < nearest.r + this.r) {
                    nearest.attachCargo();
                    this.alive = false;
                    return;
                }
            }
        }
        this.vx *= Math.exp(-dt * 0.7);
        this.vy *= Math.exp(-dt * 0.7);
        this.x += this.vx * dt; this.y += this.vy * dt;
        this.rot += this.spin * dt;
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }
    draw(ctx) {
        const blink = this.life < 8 && Math.floor(this.life * 6) % 2 === 0;
        const dim = this.pickupCooldown > 0;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = blink ? "#5a7c5e" : (dim ? "#5d9e75" : "#7be39a");
        ctx.strokeStyle = dim ? "#a0d8b0" : "#cffce0";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(-this.r, -this.r, this.r * 2, this.r * 2);
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#0a2a14";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-this.r * 0.6, 0); ctx.lineTo(this.r * 0.6, 0);
        ctx.moveTo(0, -this.r * 0.6); ctx.lineTo(0, this.r * 0.6);
        ctx.stroke();
        ctx.restore();
    }
}

// -------------------------------------------------------------------
class FuelCanister extends Entity {
    constructor(x, y, vx = 0, vy = 0, amount = 50) {
        super(x, y, 9);
        this.type = "fuel";
        this.vx = vx; this.vy = vy;
        this.amount = amount;
        this.life = 90;
        this.rot = Math.random() * TAU;
        this.spin = (Math.random() - 0.5) * 1.5;
        this.magnetRange = 130;
    }
    update(dt, world) {
        const p = world.player;
        if (p && p.alive) {
            const dx = p.x - this.x, dy = p.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d < this.magnetRange) {
                const pull = 700 / Math.max(d, 1);
                this.vx += (dx / d) * pull * dt * 60;
                this.vy += (dy / d) * pull * dt * 60;
            }
            if (d < p.r + this.r) {
                p.addFuel(this.amount);
                if (window.SFX) window.SFX.pickupFuel();
                this.alive = false;
                return;
            }
        }
        this.vx *= Math.exp(-dt * 0.7);
        this.vy *= Math.exp(-dt * 0.7);
        this.x += this.vx * dt; this.y += this.vy * dt;
        this.rot += this.spin * dt;
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }
    draw(ctx) {
        const blink = this.life < 8 && Math.floor(this.life * 6) % 2 === 0;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = blink ? "#7d6020" : "#ffb84a";
        ctx.strokeStyle = "#fff0a0";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(-this.r, -this.r * 0.7, this.r * 2, this.r * 1.4);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#3a2a08";
        ctx.fillRect(-this.r, -this.r * 0.7, 3, this.r * 1.4);
        ctx.fillRect(this.r - 3, -this.r * 0.7, 3, this.r * 1.4);
        ctx.fillStyle = "#3a2200";
        ctx.font = "bold 11px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("F", 0, 0);
        ctx.restore();
    }
}

// -------------------------------------------------------------------
// RescueShip - 구조선
//   approach  : 플레이어 접근
//   waiting   : 도착 후 5초 의사 묻기 (1=수락 / 2=거절)
//   delivering: 결정 후 잠시 머무름 (이펙트 표시)
//   leaving   : 떠나는 중
//   hostile   : 플레이어가 직접 공격한 경우만
// 무장: 네온 청록 레이저 포탑 1대 (자동 적대 X)
// -------------------------------------------------------------------
class RescueShip extends Entity {
    constructor(x, y) {
        super(x, y, 22);
        this.type = "rescue";
        this.angle = 0;
        this.maxSpeed = 200;
        this.thrust   = 240;
        this.hp = 80; this.maxHp = 80;

        this.state = "approach";
        this.timer = 0;
        this.waitTimer = 0;
        this.WAIT_DURATION = 5.0;
        this.responseTimer = 0;
        this.responseChoice = "";   // "accept" | "decline" | ""

        // 무장 (네온 청록 레이저 1대)
        this.fireCooldown = 0.6;
        this.fireRate = 0.5;
        this.laserSpeed = 1100;
        this.laserDamage = 22;
        this.engageRange = 540;

        this.cost = 100;
        this.fuelAmount = 50;
        this.deathDropCount = 3;
        this.deathDropAmount = 50;

        this.leaveAng = 0;

        // 골드 입자 (수락 시 player → 구조선 흐름)
        this.coinParticles = [];

        // 화면 표시 위치 캐시 (이펙트용)
        this._lastPlayerX = 0;
        this._lastPlayerY = 0;
    }


    // === 소행성 회피 헬퍼 ===
    // baseAng 방향으로 진행 중일 때 lookahead px 안에 있는 소행성을 측면으로 밀어냄.
    // 반환값은 단위 벡터들의 가중 합 (회피 방향 + 강도).
    _obstacleAvoidance(world, baseAng, lookahead = 250) {
        let ax = 0, ay = 0;
        if (!world || !world.chunks) return [0, 0];
        for (const ch of world.chunks.values()) {
            if (!ch.statics) continue;
            for (const s of ch.statics) {
                if (s.type !== "asteroid") continue;
                const dx = s.x - this.x, dy = s.y - this.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 0.01) continue;
                const safeR = (s.r || 30) + this.r + 25;
                if (dist > lookahead + safeR) continue;
                // 진행 방향과의 각 차이
                const angToObs = Math.atan2(dy, dx);
                let diff = angToObs - baseAng;
                while (diff >  Math.PI) diff -= TAU;
                while (diff < -Math.PI) diff += TAU;
                if (Math.abs(diff) > Math.PI / 2.2) continue;   // 전방 ±82도 만 회피
                // 가까울수록 강한 회피력 (0~1)
                const w = Math.max(0, 1 - Math.max(0, dist - safeR) / lookahead);
                // 측면 (소행성 반대쪽) 으로 밀어냄
                const perpSign = (diff < 0) ? 1 : -1;
                const perp = baseAng + Math.PI / 2 * perpSign;
                ax += Math.cos(perp) * w;
                ay += Math.sin(perp) * w;
            }
        }
        return [ax, ay];
    }

    acceptOffer(world) {
        if (this.state !== "waiting") return;
        const p = world.player;
        if (!p) return;
        if (p.gold < this.cost) {
            // 골드 부족 - 자동 거절
            this.declineOffer(world);
            return;
        }
        p.gold -= this.cost;
        this.responseChoice = "accept";
        this.responseTimer = 1.4;
        this.state = "delivering";

        // 골드 입자 효과 시작
        this._spawnCoinParticles(p.x, p.y);

        // -100G 플로터 표시
        p._goldFloater = { amount: -this.cost, life: 1.5, maxLife: 1.5 };

        // 연료 캐니스터 (살짝 늦게 - 0.4초 후)
        this._pendingFuelSpawn = { delay: 0.6, x: 0, y: 0 };

        if (world.camera) world.camera.addShake(2);
    }

    declineOffer(world) {
        if (this.state !== "waiting") return;
        this.responseChoice = "decline";
        this.responseTimer = 1.6;
        this.state = "delivering";
    }

    _spawnCoinParticles(px, py) {
        this.coinParticles = [];
        for (let i = 0; i < 14; i++) {
            this.coinParticles.push({
                startX: px, startY: py,
                t: -i * 0.04,
                life: 0.7 + Math.random() * 0.3,
                arc: (Math.random() - 0.5) * 40,
            });
        }
    }

    update(dt, world) {
        const p = world.player;
        this.timer += dt;

        if (!p || !p.alive) {
            if (this.state !== "leaving") {
                this.state = "leaving";
                this.leaveAng = Math.random() * TAU;
            }
        }

        const dx = p ? p.x - this.x : 0;
        const dy = p ? p.y - this.y : 0;
        const dist = Math.hypot(dx, dy);
        if (p) { this._lastPlayerX = p.x; this._lastPlayerY = p.y; }

        if (this.state === "approach") {
            const ang = Math.atan2(dy, dx);
            // === 소행성 회피 (feeler 기반 측면 밀어내기) ===
            const [ax, ay] = this._obstacleAvoidance(world, ang, 260);
            this.vx += Math.cos(ang) * this.thrust * dt + ax * this.thrust * 1.6 * dt;
            this.vy += Math.sin(ang) * this.thrust * dt + ay * this.thrust * 1.6 * dt;
            // 실제 진행방향으로 함체 회전 (회피 모션 자연스럽게)
            const moveSp = Math.hypot(this.vx, this.vy);
            this.angle = (moveSp > 20) ? Math.atan2(this.vy, this.vx) : ang;
            if (dist < 240) {
                this.state = "waiting";
                this.waitTimer = this.WAIT_DURATION;
            }
        } else if (this.state === "waiting") {
            this.waitTimer -= dt;
            const ang = Math.atan2(dy, dx);
            this.angle = ang;
            // 호버 (적정 거리 유지)
            if (dist > 280) {
                this.vx += Math.cos(ang) * this.thrust * 0.4 * dt;
                this.vy += Math.sin(ang) * this.thrust * 0.4 * dt;
            } else if (dist < 180) {
                this.vx -= Math.cos(ang) * this.thrust * 0.3 * dt;
                this.vy -= Math.sin(ang) * this.thrust * 0.3 * dt;
            }
            // 입력
            if (Input.pressed["Digit1"])      this.acceptOffer(world);
            else if (Input.pressed["Digit2"]) this.declineOffer(world);
            else if (this.waitTimer <= 0)     this.declineOffer(world);
        } else if (this.state === "delivering") {
            this.responseTimer -= dt;
            // 연료 캐니스터 지연 spawn (수락한 경우)
            if (this._pendingFuelSpawn) {
                this._pendingFuelSpawn.delay -= dt;
                if (this._pendingFuelSpawn.delay <= 0) {
                    const ang = Math.atan2(dy, dx);
                    world.spawn(new FuelCanister(
                        this.x + Math.cos(ang) * (this.r + 10),
                        this.y + Math.sin(ang) * (this.r + 10),
                        Math.cos(ang) * 140 + this.vx * 0.5,
                        Math.sin(ang) * 140 + this.vy * 0.5,
                        this.fuelAmount,
                    ));
                    if (world.camera) world.camera.addShake(2);
                    this._pendingFuelSpawn = null;
                }
            }
            this.vx *= Math.exp(-dt * 1.5);
            this.vy *= Math.exp(-dt * 1.5);
            if (this.responseTimer <= 0) {
                this.state = "leaving";
                this.leaveAng = Math.atan2(-dy, -dx) || Math.random() * TAU;
            }
        } else if (this.state === "leaving") {
            const ang = this.leaveAng;
            // 떠날 때도 회피
            const [ax2, ay2] = this._obstacleAvoidance(world, ang, 220);
            this.vx += Math.cos(ang) * this.thrust * 1.4 * dt + ax2 * this.thrust * 1.5 * dt;
            this.vy += Math.sin(ang) * this.thrust * 1.4 * dt + ay2 * this.thrust * 1.5 * dt;
            const sp2 = Math.hypot(this.vx, this.vy);
            this.angle = (sp2 > 20) ? Math.atan2(this.vy, this.vx) : ang;
            if (dist > 1500) this.alive = false;
        } else if (this.state === "hostile") {
            this.angle = Math.atan2(dy, dx);
            const ax = Math.cos(this.angle);
            const ay = Math.sin(this.angle);
            if (dist > 380)      { this.vx += ax * this.thrust * dt; this.vy += ay * this.thrust * dt; }
            else if (dist < 220) { this.vx -= ax * this.thrust * dt; this.vy -= ay * this.thrust * dt; }
            this.fireCooldown -= dt;
            if (dist < this.engageRange && this.fireCooldown <= 0) {
                this.fireCooldown = this.fireRate;
                world.spawn(new Bullet(
                    this.x + ax * (this.r + 4),
                    this.y + ay * (this.r + 4),
                    ax * this.laserSpeed, ay * this.laserSpeed,
                    this, this.laserDamage, 1.4,
                ));
            }
        }

        // 골드 입자 update
        if (this.coinParticles.length > 0) {
            for (const pp of this.coinParticles) {
                pp.t += dt;
            }
            this.coinParticles = this.coinParticles.filter(pp => pp.t < pp.life);
        }

        // 속도 제한 + 마찰
        const sp = Math.hypot(this.vx, this.vy);
        if (sp > this.maxSpeed) { this.vx *= this.maxSpeed / sp; this.vy *= this.maxSpeed / sp; }
        this.vx *= Math.exp(-dt * 0.4);
        this.vy *= Math.exp(-dt * 0.4);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    takeDamage(dmg, world, attacker) {
        // 플레이어가 직접 공격한 경우만 적대 (자동 적대 없음)
        if (attacker === world.player) {
            this.state = "hostile";
        }
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.alive = false;
            if (world.camera) world.camera.addShake(8);
            for (let i = 0; i < this.deathDropCount; i++) {
                const a = Math.random() * TAU;
                const sp = 60 + Math.random() * 90;
                world.spawn(new FuelCanister(
                    this.x, this.y,
                    Math.cos(a) * sp, Math.sin(a) * sp,
                    this.deathDropAmount,
                ));
            }
        }
    }

    draw(ctx) {
        const hostile = this.state === "hostile";

        // 골드 입자 (player → 구조선 곡선)
        for (const pp of this.coinParticles) {
            if (pp.t < 0) continue;
            const t = Math.min(1, pp.t / pp.life);
            const x = pp.startX + (this.x - pp.startX) * t;
            const y = pp.startY + (this.y - pp.startY) * t;
            // 곡선 (sin 으로 위로 휘어짐)
            const arcY = -Math.sin(t * Math.PI) * pp.arc;
            const alpha = 1 - t * 0.5;
            ctx.fillStyle = `rgba(255, 216, 107, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y + arcY, 3 + (1 - t) * 1.5, 0, TAU);
            ctx.fill();
            // 작은 반짝임
            ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(x, y + arcY, 1.2, 0, TAU);
            ctx.fill();
        }

        // 본체
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle   = hostile ? "#aa3a3a" : "#d8d8e0";
        ctx.strokeStyle = hostile ? "#ff8290" : "#a0d8ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.r, -this.r * 0.4);
        ctx.lineTo(this.r * 0.6, -this.r * 0.75);
        ctx.lineTo(-this.r * 0.7, -this.r * 0.75);
        ctx.lineTo(-this.r, -this.r * 0.3);
        ctx.lineTo(-this.r, this.r * 0.3);
        ctx.lineTo(-this.r * 0.7, this.r * 0.75);
        ctx.lineTo(this.r * 0.6, this.r * 0.75);
        ctx.lineTo(this.r, this.r * 0.4);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // 의무 마크
        ctx.fillStyle = hostile ? "#ffe0e0" : "#3a82c4";
        ctx.fillRect(-3, -10, 6, 20);
        ctx.fillRect(-10, -3, 20, 6);
        // 콕핏
        ctx.fillStyle = hostile ? "#ffd0d0" : "#0e1e36";
        ctx.beginPath();
        ctx.arc(this.r * 0.5, 0, 3.5, 0, TAU);
        ctx.fill();
        // 레이저 포탑 (앞부분 위에)
        if (!hostile) {
            ctx.shadowColor = "#a0e0ff";
            ctx.shadowBlur = 6;
        }
        ctx.fillStyle = hostile ? "#ff8290" : "#a0e0ff";
        ctx.beginPath();
        ctx.arc(this.r * 0.3, 0, 4, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        // HP 바
        if (this.hp < this.maxHp) {
            const w = 56, h = 4;
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(this.x - w / 2, this.y - this.r - 14, w, h);
            ctx.fillStyle = hostile ? "#ff8290" : "#a0d8ff";
            ctx.fillRect(this.x - w / 2, this.y - this.r - 14, w * (this.hp / this.maxHp), h);
        }

        // 라벨
        if (this.state === "approach" || this.state === "waiting") {
            ctx.fillStyle = "rgba(180, 220, 255, 0.85)";
            ctx.font = "10px Consolas, monospace";
            ctx.textAlign = "center";
            ctx.fillText("◆ RESCUE ◆", this.x, this.y - this.r - 22);
        } else if (hostile) {
            ctx.fillStyle = "rgba(255, 91, 108, 0.95)";
            ctx.font = "bold 11px Consolas, monospace";
            ctx.textAlign = "center";
            ctx.fillText("!!! HOSTILE !!!", this.x, this.y - this.r - 22);
        }

        // === waiting 말풍선 ===
        if (this.state === "waiting") {
            this._drawDialogBubble(ctx);
        }

        // === delivering 응답 표시 ===
        if (this.state === "delivering") {
            const t = this.responseTimer / 1.5;
            if (this.responseChoice === "accept") {
                ctx.fillStyle = `rgba(255, 216, 107, ${Math.min(1, t * 1.5)})`;
                ctx.font = "bold 14px Consolas, monospace";
                ctx.textAlign = "center";
                ctx.fillText("✓ 거래 완료", this.x, this.y - this.r - 30);
            } else if (this.responseChoice === "decline") {
                ctx.fillStyle = `rgba(220, 220, 220, ${Math.min(1, t * 1.5)})`;
                ctx.font = "20px serif";
                ctx.textAlign = "center";
                // \ 두 개로 백슬래시 한 개 (¯\_(ツ)_/¯)
                ctx.fillText("¯\\_(ツ)_/¯", this.x, this.y - this.r - 30);
            }
        }
    }

    _drawDialogBubble(ctx) {
        const px = this.x;
        const py = this.y - this.r - 70;
        const w = 230, h = 70;
        // 박스
        ctx.fillStyle = "rgba(15, 30, 50, 0.94)";
        ctx.strokeStyle = "#5fd0ff";
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(95, 208, 255, 0.4)";
        ctx.shadowBlur = 6;
        this._roundRect(ctx, px - w/2, py - h/2, w, h, 6);
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;

        // 텍스트
        ctx.fillStyle = "#cfe7ff";
        ctx.font = "12px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText("💰 100 G에 연료를 받으시겠습니까?", px, py - 16);

        // 옵션 (터치 모드는 SOS 안내창의 수락/거절 버튼으로 선택 → 키 번호 생략)
        const touch = !!(window.TouchControls && window.TouchControls.active);
        ctx.fillStyle = "#7be39a";
        ctx.font = "bold 12px Consolas, monospace";
        ctx.textAlign = "right";
        ctx.fillText(touch ? "수락" : "[1] 수락", px - 8, py + 6);
        ctx.fillStyle = "#ff8290";
        ctx.textAlign = "left";
        ctx.fillText(touch ? "거절" : "[2] 거절", px + 8, py + 6);

        // 카운트다운 바
        ctx.fillStyle = "rgba(180, 200, 220, 0.6)";
        ctx.font = "10px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`남은 시간 ${Math.max(0, this.waitTimer).toFixed(1)}s`, px, py + 24);
        // 시간 바
        const barW = 180, barH = 3;
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(px - barW/2, py + h/2 - 8, barW, barH);
        const frac = Math.max(0, this.waitTimer / this.WAIT_DURATION);
        ctx.fillStyle = frac > 0.3 ? "#5fd0ff" : "#ffb84a";
        ctx.fillRect(px - barW/2, py + h/2 - 8, barW * frac, barH);

        // 화살표 (말풍선 → 구조선)
        ctx.fillStyle = "rgba(15, 30, 50, 0.94)";
        ctx.strokeStyle = "#5fd0ff";
        ctx.beginPath();
        ctx.moveTo(px - 8, py + h/2);
        ctx.lineTo(px, py + h/2 + 10);
        ctx.lineTo(px + 8, py + h/2);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
}

// -------------------------------------------------------------------
// MerchantShip - 정규 상선
//   정박 시: anchor 주변 천천히 patrol (살짝 움직임, 함선스러운 느낌)
//   hostile 시: player와 거리 유지하며 실제 운행
//   fleeing 시: 빠른 직선 이탈
//   무장: 4개 네온 레이저 포탑 (0.4초 사이클 동시 연사) + 좌우 미사일 포드 (2초마다 2발)
// -------------------------------------------------------------------
class MerchantShip extends Entity {
    constructor(x, y, seed = 0) {
        super(x, y, 80);
        this.type = "merchant";
        this.anchorX = x; this.anchorY = y;
        this.angle = (seed % 1000) / 1000 * TAU;
        this.maxSpeed = 70;        // 정박/일반 최대속도
        this.combatMaxSpeed = 180; // 전투 시
        this.thrust = 80;
        this.maxHp = 2000;
        this.hp = 2000;
        this.priceMultiplier = 1.0;

        // 최근 공격자 메모리 (PirateMerchant 의 대응사격 우선 타깃에 사용)
        this.lastAttacker = null;
        this.lastAttackerTimer = 0;

        // 정박 patrol
        this.patrolPhase = (seed % 700) / 700 * TAU;
        this.patrolRadius = 50;

        // 레이저 무장 (4 포탑 동시 발사, 0.4s 사이클)
        this.laserCooldown = 0;
        this.laserRate = 0.4;
        this.laserDamage = 22;
        this.laserSpeed = 1100;
        this.laserSpread = 0.08;

        // 미사일 무장 (2초마다 2발 추격)
        this.missileCooldown = 2.0;
        this.missileRate = 2.0;
        this.missileCount = 2;
        this.missileDamage = 35;

        this.engageRange = 800;

        this.state = "friendly";
        this.warningTimer = 0;
        this.WARNING_DURATION = 2.0;
        this.cargoSoldByPlayer = 0;
        this.fleeTriggerCargo = 30;

        this.recentEarn = 0;
        this.recentEarnTimer = 0;
        this.thumbsUpTimer = 0;
        this.fleeAng = 0;
        this.fleeTimer = 0;       // 5초 일반 기동
        this.warping = false;
        this.warpTimer = 0;       // 1초 워프

        this.cargoSoldByEnemy = 0;   // 적 함선이 가져다 판 카고

        this.pulse = (seed % 700) / 700 * TAU;

        // 가까운 적 함선에 자동 적대? (정규=true, 해적=false)
        this.autoHostileToEnemy = true;

        // 격침 시 드랍 / 폭발 화려도
        this.deathCargoCount = 50;
        this.deathFuelCount = 5;
        this.deathBigExplosion = true;
    }

    // 가장 가까운 위협 (player + 적 + 해적 + hostile 구조선)
    _findNearestThreat(world) {
        const range2 = this.engageRange * this.engageRange * 1.21;
        let best = null, bd = range2;
        const p = world.player;
        if (p && p.alive) {
            const dx = p.x - this.x, dy = p.y - this.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < bd) { bd = d2; best = p; }
        }
        for (const e of world.entities) {
            if (e === this || !e.alive) continue;
            const isThreat = (e.type === "enemy")
                          || (e.type === "pirate")
                          || (e.type === "rescue" && e.state === "hostile");
            if (!isThreat) continue;
            const dx = e.x - this.x, dy = e.y - this.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < bd) { bd = d2; best = e; }
        }
        return best;
    }

    // 가장 가까운 비-player 위협 ship (적 + 해적 + 구조선의 hostile)
    // 자기 자신, 다른 정규 상선은 제외
    _findNearestEnemyShip(world) {
        const range2 = this.engageRange * this.engageRange * 1.21;
        let best = null, bd = range2;
        for (const e of world.entities) {
            if (e === this || !e.alive) continue;
            // 적 함선 + 해적 상선은 항상 타겟
            // 구조선은 hostile 상태일 때만 타겟
            const isThreat = (e.type === "enemy")
                          || (e.type === "pirate")
                          || (e.type === "rescue" && e.state === "hostile");
            if (!isThreat) continue;
            const dx = e.x - this.x, dy = e.y - this.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < bd) { bd = d2; best = e; }
        }
        return best;
    }

    _startFleeing(world) {
        if (this.state === "fleeing") return;
        this.state = "fleeing";
        this.thumbsUpTimer = 2.5;
        this.fleeTimer = 5.0;
        this.warping = false;
        this.warpTimer = 1.0;
        const p = world ? world.player : null;
        if (p && p.alive) {
            const dx = this.x - p.x, dy = this.y - p.y;
            this.fleeAng = Math.atan2(dy, dx) || (Math.random() * TAU);
        } else {
            this.fleeAng = Math.random() * TAU;
        }
    }

    _startWarpEffect(world) {
        if (window.SFX) window.SFX.warp();
        if (world.camera) world.camera.addShake(10);
        const col = this.type === "pirate" ? "purple" : "cyan";
        world.spawn(new Explosion(this.x, this.y, this.r * 1.8, 0, col));
    }

    // Enemy 가 해적 상선에 카고 판매 시 호출 (적 함선 매출 누적)
    onEnemyCargoSale(amount, world) {
        this.cargoSoldByEnemy += amount;
        const total = this.cargoSoldByPlayer + this.cargoSoldByEnemy;
        if (total >= this.fleeTriggerCargo) this._startFleeing(world);
    }

    _fireLasers(world, aimX, aimY) {
        const cosA = Math.cos(this.angle), sinA = Math.sin(this.angle);
        const turrets = [
            { x: this.r * 0.6,  y: -this.r * 0.45 },
            { x: this.r * 0.6,  y:  this.r * 0.45 },
            { x: -this.r * 0.35, y: -this.r * 0.4 },
            { x: -this.r * 0.35, y:  this.r * 0.4 },
        ];
        for (const t of turrets) {
            const wx = this.x + cosA * t.x - sinA * t.y;
            const wy = this.y + sinA * t.x + cosA * t.y;
            const dx = aimX - wx, dy = aimY - wy;
            const baseAng = Math.atan2(dy, dx);
            const ang = baseAng + (Math.random() - 0.5) * this.laserSpread;
            world.spawn(new Bullet(
                wx + Math.cos(ang) * 10,
                wy + Math.sin(ang) * 10,
                Math.cos(ang) * this.laserSpeed,
                Math.sin(ang) * this.laserSpeed,
                this, this.laserDamage, 1.1,
            ));
        }
        if (world.camera) world.camera.addShake(2);
    }

    _fireMissiles(world, target) {
        const cosA = Math.cos(this.angle), sinA = Math.sin(this.angle);
        const pods = [
            { x: this.r * 0.3, y: -this.r * 0.55 },
            { x: this.r * 0.3, y:  this.r * 0.55 },
        ];
        for (let i = 0; i < this.missileCount; i++) {
            const pod = pods[i % pods.length];
            const px = this.x + cosA * pod.x - sinA * pod.y;
            const py = this.y + sinA * pod.x + cosA * pod.y;
            const launchAng = this.angle + (pod.y < 0 ? -0.5 : 0.5);
            const launchSp = 200;
            world.spawn(new Missile(
                px, py,
                Math.cos(launchAng) * launchSp,
                Math.sin(launchAng) * launchSp,
                target, this, this.missileDamage,
            ));
        }
        if (world.camera) world.camera.addShake(3);
    }

    update(dt, world) {
        this.pulse += dt * 0.6;
        if (this.recentEarnTimer > 0) this.recentEarnTimer -= dt;
        if (this.thumbsUpTimer > 0)   this.thumbsUpTimer -= dt;
        // lastAttacker 메모리 감쇠 (5초 후 자동 만료)
        if (this.lastAttackerTimer > 0) {
            this.lastAttackerTimer -= dt;
            if (this.lastAttackerTimer <= 0 || !this.lastAttacker || !this.lastAttacker.alive) {
                this.lastAttacker = null;
                this.lastAttackerTimer = 0;
            }
        }

        const p = world.player;

        // === fleeing: 5초 일반 기동 → 1초 워프 ===
        if (this.state === "fleeing") {
            if (!this.warping) {
                this.fleeTimer -= dt;
                const fleeMaxSpeed = 380;
                const fleeThrust = 260;
                this.vx += Math.cos(this.fleeAng) * fleeThrust * dt;
                this.vy += Math.sin(this.fleeAng) * fleeThrust * dt;
                const sp = Math.hypot(this.vx, this.vy);
                if (sp > fleeMaxSpeed) { this.vx *= fleeMaxSpeed/sp; this.vy *= fleeMaxSpeed/sp; }
                this.angle = this.fleeAng;
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                if (this.fleeTimer <= 0) {
                    this.warping = true;
                    this.warpTimer = 1.0;
                    this._startWarpEffect(world);
                }
            } else {
                // 워프 중 — 매우 빠른 가속 + 위치 진행
                this.warpTimer -= dt;
                const warpSp = 1400;
                this.vx += Math.cos(this.fleeAng) * 4000 * dt;
                this.vy += Math.sin(this.fleeAng) * 4000 * dt;
                const sp = Math.hypot(this.vx, this.vy);
                if (sp > warpSp) { this.vx *= warpSp/sp; this.vy *= warpSp/sp; }
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                if (this.warpTimer <= 0) this.alive = false;
            }
            return;
        }

        // warning 타이머
        if (this.state === "warning") {
            this.warningTimer -= dt;
            if (this.warningTimer <= 0) this.state = "friendly";
        }

        // === hostile: 실제 운행 + 무장 발사 ===
        // 전투 타겟 결정 (state에 따라)
        //  hostile          → player + 적 모두 위협, 가장 가까운 것
        //  friendly/warning → autoHostileToEnemy 이면 가까운 적만 타겟
        let combatTarget = null;
        if (this.state === "hostile") {
            combatTarget = this._findNearestThreat(world);
        } else if (this.autoHostileToEnemy) {
            combatTarget = this._findNearestEnemyShip(world);
        }

        if (combatTarget) {
            const dx = combatTarget.x - this.x, dy = combatTarget.y - this.y;
            const d = Math.hypot(dx, dy);
            const targetAng = Math.atan2(dy, dx);
            const targetD = this.engageRange * 0.65;
            if (d > targetD * 1.15) {
                this.vx += Math.cos(targetAng) * this.thrust * 1.4 * dt;
                this.vy += Math.sin(targetAng) * this.thrust * 1.4 * dt;
            } else if (d < targetD * 0.7) {
                this.vx -= Math.cos(targetAng) * this.thrust * dt;
                this.vy -= Math.sin(targetAng) * this.thrust * dt;
            }
            this.angle = targetAng;

            // 무장
            this.laserCooldown -= dt;
            if (this.laserCooldown <= 0 && d < this.engageRange) {
                this.laserCooldown = this.laserRate;
                this._fireLasers(world, combatTarget.x, combatTarget.y);
            }
            this.missileCooldown -= dt;
            if (this.missileCooldown <= 0 && d < this.engageRange * 1.5) {
                this.missileCooldown = this.missileRate;
                this._fireMissiles(world, combatTarget);
            }
        } else {
            // === 정박 patrol ===
            this.patrolPhase += dt * 0.3;
            const tx = this.anchorX + Math.cos(this.patrolPhase) * this.patrolRadius;
            const ty = this.anchorY + Math.sin(this.patrolPhase * 0.7) * this.patrolRadius * 0.6;
            const dx = tx - this.x, dy = ty - this.y;
            const tAng = Math.atan2(dy, dx);
            const td = Math.hypot(dx, dy);
            if (td > 2) {
                this.vx += Math.cos(tAng) * this.thrust * 0.5 * dt;
                this.vy += Math.sin(tAng) * this.thrust * 0.5 * dt;
            }
            // 함체 방향 천천히 따라감
            let dAng = tAng - this.angle;
            while (dAng > Math.PI)  dAng -= TAU;
            while (dAng < -Math.PI) dAng += TAU;
            this.angle += dAng * dt * 0.4;
        }

        // 거래 (friendly / warning + player가 combatTarget이 아닐 때)
        const playerIsTarget = (combatTarget === p);
        if (p && p.alive && !playerIsTarget && (this.state === "friendly" || this.state === "warning")) {
            const d = Util.dist(p.x, p.y, this.x, this.y);
            if (d < this.r + p.r + 12 && p.cargoChain.length > 0) {
                const n = p.cargoChain.length;
                const earned = p.sellCargoAt(this);
                if (earned > 0) {
                    this.recentEarn = earned;
                    this.recentEarnTimer = 1.6;
                    this.cargoSoldByPlayer += n;
                    world.camera.addShake(2);
                    const total = this.cargoSoldByPlayer + this.cargoSoldByEnemy;
                    if (total >= this.fleeTriggerCargo) this._startFleeing(world);
                }
            }
        }

        // 속도 제한 + 마찰
        const sp = Math.hypot(this.vx, this.vy);
        // 전투 중이면 combat 속도, 아니면 정박 속도
        const inCombat = (this.state === "hostile") || (this.autoHostileToEnemy && this._findNearestEnemyShip(world));
        const maxV = inCombat ? this.combatMaxSpeed : this.maxSpeed;
        if (sp > maxV) { this.vx *= maxV/sp; this.vy *= maxV/sp; }
        this.vx *= Math.exp(-dt * 0.5);
        this.vy *= Math.exp(-dt * 0.5);

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    takeDamage(dmg, world, attacker) {
        if (attacker === world.player) {
            if (this.state === "friendly") {
                this.state = "warning";
                this.warningTimer = this.WARNING_DURATION;
            } else if (this.state === "warning") {
                this.state = "hostile";
                if (world.camera) world.camera.addShake(4);
            }
        }
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.alive = false;
            this._spawnDeathLoot(world);
            this._spawnDeathExplosion(world);
        }
    }

    _spawnDeathLoot(world) {
        const cn = this.deathCargoCount || 0;
        const fn = this.deathFuelCount  || 0;
        for (let i = 0; i < cn; i++) {
            const ang = Math.random() * TAU;
            const sp = 60 + Math.random() * 180;
            world.spawn(new Cargo(
                this.x, this.y,
                Math.cos(ang) * sp, Math.sin(ang) * sp,
            ));
        }
        for (let i = 0; i < fn; i++) {
            const ang = Math.random() * TAU;
            const sp = 80 + Math.random() * 150;
            world.spawn(new FuelCanister(
                this.x, this.y,
                Math.cos(ang) * sp, Math.sin(ang) * sp,
                50,
            ));
        }
    }

    _spawnDeathExplosion(world) {
        if (this.deathBigExplosion) {
            // 정규 상선급: 외곽 시간차 폭발 8개 + 메인 거대 폭발
            for (let i = 0; i < 8; i++) {
                const ang = Math.random() * TAU;
                const rd = this.r * (0.3 + Math.random() * 0.65);
                world.spawn(new Explosion(
                    this.x + Math.cos(ang) * rd,
                    this.y + Math.sin(ang) * rd,
                    24 + Math.random() * 28,
                    Math.random() * 0.45,
                ));
            }
            world.spawn(new Explosion(this.x, this.y, this.r * 1.6, 0.5));
            if (world.camera) world.camera.addShake(28);
        } else {
            // 해적급: 외곽 4 + 메인
            for (let i = 0; i < 4; i++) {
                const ang = Math.random() * TAU;
                const rd = this.r * Math.random() * 0.55;
                world.spawn(new Explosion(
                    this.x + Math.cos(ang) * rd,
                    this.y + Math.sin(ang) * rd,
                    18 + Math.random() * 15,
                    Math.random() * 0.22,
                ));
            }
            world.spawn(new Explosion(this.x, this.y, this.r * 1.2, 0.25));
            if (world.camera) world.camera.addShake(16);
        }
    }

    draw(ctx) {
        const hostile = this.state === "hostile";
        const warning = this.state === "warning";
        const fleeing = this.state === "fleeing";
        const pulse = (Math.sin(this.pulse) * 0.5 + 0.5);

        // === 워프 중 — 빛 줄기 + 작아지는 함선 ===
        if (this.warping) {
            const t = 1 - this.warpTimer / 1.0;
            const rgb = this.type === "pirate" ? "200, 122, 255" : "95, 208, 255";
            const cosA = Math.cos(this.angle), sinA = Math.sin(this.angle);
            // 뒤로 길게 늘어나는 빛 줄기
            const trailLen = 240 * t;
            const grad = ctx.createLinearGradient(
                this.x, this.y,
                this.x - cosA * trailLen, this.y - sinA * trailLen,
            );
            grad.addColorStop(0, `rgba(${rgb}, ${0.9 * (1 - t * 0.5)})`);
            grad.addColorStop(1, `rgba(${rgb}, 0)`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 36 * (1 - t * 0.6);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - cosA * trailLen, this.y - sinA * trailLen);
            ctx.stroke();
            // 함선 본체 (작아지면서 페이드)
            ctx.save();
            ctx.globalAlpha = 1 - t * 0.85;
            ctx.shadowColor = `rgb(${rgb})`;
            ctx.shadowBlur = 24 * (1 - t);
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            const sc = Math.max(0.05, 1 - t * 0.8);
            ctx.scale(sc, sc * 0.8);
            ctx.fillStyle   = this.type === "pirate" ? "#28163a" : "#142a40";
            ctx.strokeStyle = `rgb(${rgb})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.r * 1.1, 0);
            ctx.lineTo(this.r * 0.7, -this.r * 0.55);
            ctx.lineTo(-this.r * 0.5, -this.r * 0.7);
            ctx.lineTo(-this.r * 0.95, -this.r * 0.5);
            ctx.lineTo(-this.r * 1.05, 0);
            ctx.lineTo(-this.r * 0.95, this.r * 0.5);
            ctx.lineTo(-this.r * 0.5, this.r * 0.7);
            ctx.lineTo(this.r * 0.7, this.r * 0.55);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.restore();
            ctx.shadowBlur = 0;
            return;
        }

        if (hostile) ctx.strokeStyle = `rgba(255, 91, 108, ${0.4 + pulse * 0.3})`;
        else if (warning) ctx.strokeStyle = `rgba(255, 180, 80, ${0.5 + pulse * 0.3})`;
        else ctx.strokeStyle = `rgba(95, 208, 255, ${0.20 + pulse * 0.15})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r + 12 + pulse * 5, 0, TAU);
        ctx.stroke();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle   = hostile ? "#3a1518" : (warning ? "#3a2a18" : "#142a40");
        ctx.strokeStyle = hostile ? "#ff8290" : (warning ? "#ffb84a" : "#5fd0ff");
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.r * 1.1, 0);
        ctx.lineTo(this.r * 0.7, -this.r * 0.55);
        ctx.lineTo(-this.r * 0.5, -this.r * 0.7);
        ctx.lineTo(-this.r * 0.95, -this.r * 0.5);
        ctx.lineTo(-this.r * 1.05, 0);
        ctx.lineTo(-this.r * 0.95, this.r * 0.5);
        ctx.lineTo(-this.r * 0.5, this.r * 0.7);
        ctx.lineTo(this.r * 0.7, this.r * 0.55);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 함교
        ctx.fillStyle = hostile ? "#ff5b6c" : (warning ? "#ffd86b" : "#5fd0ff");
        ctx.fillRect(-this.r * 0.2, -this.r * 0.25, this.r * 0.6, this.r * 0.5);
        ctx.fillStyle = "#0e1e36";
        ctx.fillRect(-this.r * 0.15, -this.r * 0.15, this.r * 0.5, this.r * 0.3);

        // 4 레이저 포탑 (네온 글로우)
        const turretColor = hostile ? "#ff8290" : "#5fffe0";
        ctx.shadowColor = turretColor;
        ctx.shadowBlur = hostile ? 6 : 8;
        ctx.fillStyle = turretColor;
        for (const [tx, ty] of [
            [this.r * 0.6, -this.r * 0.45], [this.r * 0.6, this.r * 0.45],
            [-this.r * 0.35, -this.r * 0.4], [-this.r * 0.35, this.r * 0.4],
        ]) {
            ctx.beginPath();
            ctx.arc(tx, ty, 5, 0, TAU);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // 미사일 포드 (좌우)
        ctx.fillStyle = "#7a5040";
        ctx.fillRect(this.r * 0.2, -this.r * 0.65, this.r * 0.28, this.r * 0.18);
        ctx.fillRect(this.r * 0.2,  this.r * 0.47, this.r * 0.28, this.r * 0.18);
        // 포드 안의 미사일 머리
        ctx.fillStyle = "#ff8244";
        ctx.fillRect(this.r * 0.42, -this.r * 0.6, this.r * 0.05, this.r * 0.06);
        ctx.fillRect(this.r * 0.42,  this.r * 0.52, this.r * 0.05, this.r * 0.06);

        ctx.restore();

        if (this.hp < this.maxHp) {
            const w = 90, h = 5;
            ctx.fillStyle = "rgba(0,0,0,0.65)";
            ctx.fillRect(this.x - w/2, this.y - this.r - 18, w, h);
            ctx.fillStyle = hostile ? "#ff8290" : (warning ? "#ffb84a" : "#5fd0ff");
            ctx.fillRect(this.x - w/2, this.y - this.r - 18, w * (this.hp / this.maxHp), h);
        }

        let labelColor = "rgba(95, 208, 255, 0.9)";
        let labelText = "◆◆ MERCHANT SHIP ◆◆";
        if (warning)  { labelColor = "rgba(255, 184, 74, 0.95)"; labelText = "⚠ WARNING ⚠"; }
        if (hostile)  { labelColor = "rgba(255, 91, 108, 0.95)"; labelText = "!!! HOSTILE !!!"; }
        if (fleeing)  { labelColor = "rgba(180, 220, 255, 0.9)"; labelText = "(이탈 중)"; }
        ctx.fillStyle = labelColor;
        ctx.font = "11px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText(labelText, this.x, this.y - this.r - 28);

        if (this.state === "friendly") {
            ctx.fillStyle = "rgba(150, 200, 230, 0.7)";
            ctx.font = "10px Consolas, monospace";
            ctx.fillText("(카고 자동 판매 · 풀가격)", this.x, this.y + this.r + 22);
        }

        if (this.recentEarnTimer > 0) {
            const t = 1.6 - this.recentEarnTimer;
            ctx.fillStyle = `rgba(255, 216, 107, ${this.recentEarnTimer / 1.6})`;
            ctx.font = "bold 18px Consolas, monospace";
            ctx.textAlign = "center";
            ctx.fillText(`+${this.recentEarn} G`, this.x, this.y - this.r - 42 - t * 30);
        }

        if (this.thumbsUpTimer > 0) {
            ctx.font = "32px serif";
            ctx.textAlign = "center";
            ctx.fillText("👍", this.x, this.y - this.r - 40);
        }
    }
}

// -------------------------------------------------------------------
// PirateMerchant - 해적 상선 (정규 50% 스펙, 즉시 적대, 판매가 50%)

// -------------------------------------------------------------------
// PirateMerchant - 해적 진영 거점 상선 (적 함선의 카고 환전소)
// -------------------------------------------------------------------
class PirateMerchant extends MerchantShip {
    constructor(x, y, seed = 0) {
        super(x, y, seed);
        this.type = "pirate";
        this.r = 60;
        this.maxHp = 1000;
        this.hp = 1000;
        // 정규 대비 무장 50%
        this.laserDamage = 11;
        this.laserSpeed = 900;
        this.laserRate = 0.4;
        this.missileDamage = 17;
        this.missileCount = 1;
        this.missileRate = 2.5;
        this.priceMultiplier = 0.5;
        this.engageRange = 650;
        this.fleeTriggerCargo = 30;
        // 해적 상선: 기본은 적 함선에도 우호 (적의 거점). 공격받으면 적대 전환.
        this.autoHostileToEnemy = false;
        // 격침 시 드랍 / 폭발 화려도 (정규의 절반 미만)
        this.deathCargoCount = 20;
        this.deathFuelCount = 2;
        this.deathBigExplosion = false;
    }
    takeDamage(dmg, world, attacker) {
        // 해적 상선은 까칠함 — 모든 함선 (player / 적 / 정규 상선 / 구조선 / 다른 해적)
        // 공격에 즉시 적대 전환. attacker 를 기억해 대응사격 우선 타깃으로 삼음.
        const isShip = attacker && attacker !== this && attacker.alive !== false && (
            attacker === world.player ||
            attacker.type === "enemy" ||
            attacker.type === "merchant" ||
            attacker.type === "rescue"  ||
            attacker.type === "pirate"
        );
        if ((this.state === "friendly" || this.state === "warning") && isShip) {
            this.state = "hostile";
            if (world.camera) world.camera.addShake(3);
        }
        if (isShip) {
            this.lastAttacker = attacker;
            this.lastAttackerTimer = 5.0;
        }
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.alive = false;
            this._spawnDeathLoot(world);
            this._spawnDeathExplosion(world);
        }
    }

    // === 해적 상선의 위협 탐지 오버라이드 ===
    // 1) 최근 공격자 (lastAttacker) 가 살아있고 사정거리 내면 최우선
    // 2) 그 외 — player / 적 / 정규 상선 / hostile 구조선 모두 위협
    //    (부모는 정규 상선을 위협으로 안 보지만, 적대화된 해적은 정규 상선도 적으로 간주)
    _findNearestThreat(world) {
        // 1) lastAttacker 우선
        if (this.lastAttacker && this.lastAttacker.alive && this.lastAttackerTimer > 0) {
            const dx = this.lastAttacker.x - this.x;
            const dy = this.lastAttacker.y - this.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < this.engageRange * this.engageRange * 1.5) {
                return this.lastAttacker;
            }
        }
        // 2) 가까운 위협 일반 탐색
        const range2 = this.engageRange * this.engageRange * 1.21;
        let best = null, bd = range2;
        const p = world.player;
        if (p && p.alive) {
            const dx = p.x - this.x, dy = p.y - this.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < bd) { bd = d2; best = p; }
        }
        for (const e of world.entities) {
            if (e === this || !e.alive) continue;
            const isThreat = (e.type === "enemy")
                          || (e.type === "merchant")  // 적대화된 해적은 정규 상선도 적
                          || (e.type === "rescue" && e.state === "hostile");
            if (!isThreat) continue;
            const dx = e.x - this.x, dy = e.y - this.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < bd) { bd = d2; best = e; }
        }
        return best;
    }
    draw(ctx) {
        const hostile = this.state === "hostile";
        const pulse = (Math.sin(this.pulse) * 0.5 + 0.5);

        ctx.strokeStyle = hostile
            ? `rgba(255, 91, 108, ${0.4 + pulse * 0.3})`
            : `rgba(200, 122, 255, ${0.20 + pulse * 0.15})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r + 10 + pulse * 4, 0, TAU);
        ctx.stroke();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle   = hostile ? "#3a1518" : "#28163a";
        ctx.strokeStyle = hostile ? "#ff8290" : "#c87aff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.r * 1.1, 0);
        ctx.lineTo(this.r * 0.6, -this.r * 0.6);
        ctx.lineTo(-this.r * 0.6, -this.r * 0.7);
        ctx.lineTo(-this.r * 1.0, 0);
        ctx.lineTo(-this.r * 0.6, this.r * 0.7);
        ctx.lineTo(this.r * 0.6, this.r * 0.6);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 해골 마크
        ctx.fillStyle = hostile ? "#ffd0d0" : "#e0c0ff";
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#0e0e1a";
        ctx.fillRect(-3, -3, 2, 3);
        ctx.fillRect(1, -3, 2, 3);
        ctx.fillRect(-2, 2, 4, 1.5);
        ctx.restore();

        if (this.hp < this.maxHp) {
            const w = 90, h = 5;
            ctx.fillStyle = "rgba(0,0,0,0.65)";
            ctx.fillRect(this.x - w/2, this.y - this.r - 18, w, h);
            ctx.fillStyle = hostile ? "#ff8290" : "#c87aff";
            ctx.fillRect(this.x - w/2, this.y - this.r - 18, w * (this.hp / this.maxHp), h);
        }

        ctx.fillStyle = hostile ? "rgba(255, 91, 108, 0.95)" : "rgba(200, 122, 255, 0.9)";
        ctx.font = "11px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText(hostile ? "!!! HOSTILE PIRATE !!!" : "☠ PIRATE MERCHANT ☠", this.x, this.y - this.r - 28);
        if (!hostile) {
            ctx.fillStyle = "rgba(170, 130, 200, 0.75)";
            ctx.font = "10px Consolas, monospace";
            ctx.fillText("(바가지 - 판매가 50%)", this.x, this.y + this.r + 22);
        }

        if (this.recentEarnTimer > 0) {
            const t = 1.6 - this.recentEarnTimer;
            ctx.fillStyle = `rgba(255, 216, 107, ${this.recentEarnTimer / 1.6})`;
            ctx.font = "bold 18px Consolas, monospace";
            ctx.textAlign = "center";
            ctx.fillText(`+${this.recentEarn} G`, this.x, this.y - this.r - 42 - t * 30);
        }
    }
}

// === 전역 익스포트 ===
window.Player          = Player;
window.Bullet          = Bullet;
window.Missile         = Missile;
window.Explosion       = Explosion;
window.Asteroid        = Asteroid;
window.Enemy           = Enemy;
window.Destroyer       = Destroyer;
window.Cruiser         = Cruiser;
window.Battleship      = Battleship;
window.Cargo           = Cargo;
window.FuelCanister    = FuelCanister;
window.RescueShip      = RescueShip;
window.MerchantShip    = MerchantShip;
window.PirateMerchant  = PirateMerchant;
window.ChainMixin      = ChainMixin;
window.CARGO_SPEED_PENALTY = CARGO_SPEED_PENALTY;
window.CARGO_FACTOR_MIN    = CARGO_FACTOR_MIN;
window.TETHER_LENGTH       = TETHER_LENGTH;
window.WEAPONS         = WEAPONS;
window.PLAYER_TIERS    = PLAYER_TIERS;
