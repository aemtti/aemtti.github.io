// shop.js - 정비소 상점 모달. 수리/연료/사양 업그레이드/(개발 중) 함선 계층.

// 업그레이드 정의 - 베이스 비용 100 ~ 150, 단계당 2배. 5단계 한계.
const UPGRADE_DEFS = {
    speed: {
        name: "이동속도",  icon: "🚀",
        max: 5, baseCost: 100, costMult: 2,
        currentText: (p) => `추진 ${Math.round(p.thrust)} / 최고속 ${Math.round(p.maxSpeed)}`,
        nextText: (p) => {
            const lvl = p.upgrades.speed + 1;
            const t = p.baseThrust * (1 + 0.12 * lvl);
            const m = p.baseMaxSpeed * (1 + 0.12 * lvl);
            return `${Math.round(t)} / ${Math.round(m)} (+12%)`;
        },
    },
    bulletSpeed: {
        name: "탄환 속도",  icon: "💨",
        max: 5, baseCost: 100, costMult: 2,
        currentText: (p) => `${Math.round(p.bulletSpeed)} u/s`,
        nextText: (p) => {
            const lvl = p.upgrades.bulletSpeed + 1;
            const v = p.baseBulletSpeed * (1 + 0.15 * lvl);
            return `${Math.round(v)} u/s (+15%)`;
        },
    },
    fireRate: {
        name: "연사력",  icon: "⚡",
        max: 5, baseCost: 120, costMult: 2,
        currentText: (p) => `${(1 / p.fireRate).toFixed(2)} 발/초`,
        nextText: (p) => {
            const lvl = p.upgrades.fireRate + 1;
            const r = p.baseFireRate * Math.pow(0.85, lvl);
            return `${(1 / r).toFixed(2)} 발/초 (-15% 간격)`;
        },
    },
    damage: {
        name: "공격력",  icon: "💥",
        max: 5, baseCost: 100, costMult: 2,
        currentText: (p) => `${p.damage}`,
        nextText: (p) => `${p.baseDamage + 5 * (p.upgrades.damage + 1)} (+5)`,
    },
    hull: {
        name: "선체 내구도",  icon: "🛡",
        max: 5, baseCost: 150, costMult: 2,
        currentText: (p) => `최대 ${p.maxHp} HP`,
        nextText: (p) => `최대 ${p.baseMaxHp + 30 * (p.upgrades.hull + 1)} HP (+30)`,
    },
    cargoCapacity: {
        name: "카고 운반 한도",  icon: "📦",
        max: 5, baseCost: 250, costMult: 2,
        currentText: (p) => `${p.cargoSoftCap}개까지 속도 페널티 없음`,
        nextText: (p) => `${p.cargoSoftCap + 1}개까지 (+1)`,
    },
    powerplant: {
        name: "발전소",  icon: "⚡",
        max: 5, baseCost: 130, costMult: 2,
        currentText: (p) => `최대 ${Math.round(p.maxEnergy)} / 회복 ${Math.round(p.energyRegen)}/s`,
        nextText: (p) => {
            const lvl = (p.upgrades.powerplant || 0) + 1;
            const nextMax   = p.baseMaxEnergy   + (p.tierEnergyBonus      || 0) + 30 * lvl;
            const nextRegen = p.baseEnergyRegen + (p.tierEnergyRegenBonus || 0) + 6  * lvl;
            return `최대 ${nextMax} / 회복 ${nextRegen}/s (+30 cap, +6 regen)`;
        },
    },
};

function upgradeCost(stat, level) {
    const def = UPGRADE_DEFS[stat];
    if (!def || level < 0 || level >= def.max) return Infinity;
    return Math.round(def.baseCost * Math.pow(def.costMult, level));
}

const REPAIR_RATIO  = 0.10;   // 한 번에 maxHp의 10%
const REPAIR_PER_HP = 1;      // 1HP 당 1골드
const REFUEL_COST   = 50;     // 만땅 충전
const WEAPON_REFUND_RATIO = 0.5;   // 무기 환불 비율 (기존 무기 → 신규 무기 교체 시)

// 함선 계층 비용 / 설명 (사양은 entities.js 의 PLAYER_TIERS)
const TIER_COSTS = [0, 2000, 5000, 12000, -1];  // -1 = 잠금
const TIER_DESCS = [
    "포탑 1기 · HP 100",
    "포탑 2기 (양측) · HP 150",
    "포탑 3기 (앞+양측) · HP 220",
    "포탑 4기 + 유도 미사일 · HP 320",
    "Battleship + 인터셉터 3대 (개발 중)",
];

const ShopScreen = {
    elPanel: null,
    elClose: null,
    elGold:  null,

    elHpCur: null, elHpMax: null,
    elFuelCur: null, elFuelMax: null,
    elRepairAmount: null, elRepairCost: null, elRepairBtn: null,
    elRefuelBtn: null,

    elUpgradeList: null,

    player: null,
    onCloseHandler: null,

    init(onClose) {
        this.elPanel  = document.getElementById("shop-screen");
        this.elClose  = document.getElementById("shop-close-btn");
        this.elGold   = document.getElementById("shop-gold");

        this.elHpCur   = document.getElementById("shop-hp-current");
        this.elHpMax   = document.getElementById("shop-hp-max");
        this.elFuelCur = document.getElementById("shop-fuel-current");
        this.elFuelMax = document.getElementById("shop-fuel-max");

        this.elRepairAmount = document.getElementById("shop-repair-amount");
        this.elRepairCost   = document.getElementById("shop-repair-cost");
        this.elRepairBtn    = document.getElementById("shop-repair-btn");
        this.elRefuelBtn    = document.getElementById("shop-refuel-btn");
        this.elUpgradeList  = document.getElementById("shop-upgrade-list");

        this.elTierCurrent = document.getElementById("shop-tier-current");
        this.elTierDesc    = document.getElementById("shop-tier-desc");
        this.elTierNext    = document.getElementById("shop-tier-next");
        this.elTierBtn     = document.getElementById("shop-tier-btn");

        this.onCloseHandler = onClose;
        this.elClose.addEventListener("click", () => {
            if (this.pendingPurchase) return;   // 무기 장착 대기중엔 무시
            onClose && onClose();
        });
        this.elRepairBtn.addEventListener("click", () => this._doRepair());
        this.elRefuelBtn.addEventListener("click", () => this._doRefuel());
        if (this.elTierBtn) this.elTierBtn.addEventListener("click", () => this._doTierUpgrade());

        // === 무기 / 포탑 섹션 ===
        this.elWeaponList   = document.getElementById("shop-weapon-list");
        this.elShipDiagram  = document.getElementById("shop-ship-diagram");
        this.elPendingMsg   = document.getElementById("shop-weapon-pending");
        this.elPendingName  = document.getElementById("shop-pending-name");
        this.pendingPurchase = null;   // weapon id 문자열 또는 null

        this._buildUpgradeList();
        this._buildWeaponList();
    },

    // === 외부에서 ESC/닫기 가능 여부 조회 (game.js 에서 키 핸들러용) ===
    canClose() { return !this.pendingPurchase; },

    _buildUpgradeList() {
        this.elUpgradeList.innerHTML = "";
        for (const stat of Object.keys(UPGRADE_DEFS)) {
            const def = UPGRADE_DEFS[stat];
            const row = document.createElement("div");
            row.className = "upgrade-row";
            row.dataset.stat = stat;
            row.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name">
                        <span class="upgrade-icon">${def.icon}</span>
                        <span class="upgrade-label">${def.name}</span>
                        <span class="upgrade-level"></span>
                    </div>
                    <div class="upgrade-desc"></div>
                </div>
                <button class="upgrade-btn"></button>
            `;
            row.querySelector(".upgrade-btn")
               .addEventListener("click", () => this._doUpgrade(stat));
            this.elUpgradeList.appendChild(row);
        }
    },

    show(player) {
        this.player = player;
        this.pendingPurchase = null;   // 새 세션 — pending 초기화
        this.refresh();
        this.elPanel.classList.remove("hidden");
    },
    hide() { this.elPanel.classList.add("hidden"); },

    refresh() {
        const p = this.player;
        if (!p) return;

        this.elGold.textContent = Math.floor(p.gold);

        // 현재 HP/연료
        this.elHpCur.textContent   = Math.floor(p.hp);
        this.elHpMax.textContent   = p.maxHp;
        this.elFuelCur.textContent = Math.floor(p.fuel);
        this.elFuelMax.textContent = p.maxFuel;

        // === 수리 (10%씩, 1G/HP) ===
        const missing = p.maxHp - p.hp;
        const repairAmount = Math.min(Math.ceil(p.maxHp * REPAIR_RATIO), Math.ceil(missing));
        const repairCost   = Math.ceil(repairAmount * REPAIR_PER_HP);
        this.elRepairAmount.textContent = repairAmount;
        this.elRepairCost.textContent   = repairCost;

        if (missing <= 0) {
            this.elRepairBtn.textContent = "선체 만전";
            this.elRepairBtn.disabled = true;
        } else if (p.gold < repairCost) {
            this.elRepairBtn.textContent = `골드 부족 (${repairCost} G 필요)`;
            this.elRepairBtn.disabled = true;
        } else {
            this.elRepairBtn.textContent = `수리하기 (+${repairAmount} HP / ${repairCost} G)`;
            this.elRepairBtn.disabled = false;
        }

        // === 연료 충전 ===
        if (p.fuel >= p.maxFuel - 0.01) {
            this.elRefuelBtn.textContent = "연료 만땅";
            this.elRefuelBtn.disabled = true;
        } else if (p.gold < REFUEL_COST) {
            this.elRefuelBtn.textContent = `골드 부족 (${REFUEL_COST} G 필요)`;
            this.elRefuelBtn.disabled = true;
        } else {
            this.elRefuelBtn.textContent = `만땅 충전 (${REFUEL_COST} G)`;
            this.elRefuelBtn.disabled = false;
        }

        // === 함선 계층 ===
        if (this.elTierCurrent) {
            const cur = p.tier || 0;
            this.elTierCurrent.textContent = ["Frigate", "Destroyer", "Cruiser", "Battleship", "Carrier"][cur];
            this.elTierDesc.textContent    = TIER_DESCS[cur];
            if (cur >= 3) {
                // Carrier 잠금 (인터셉터 개발 중)
                this.elTierNext.textContent = "다음: Carrier (개발 중)";
                this.elTierBtn.textContent = "🚧 Carrier 개발 중";
                this.elTierBtn.disabled = true;
            } else {
                const next = ["Frigate", "Destroyer", "Cruiser", "Battleship", "Carrier"][cur + 1];
                const cost = TIER_COSTS[cur + 1];
                this.elTierNext.textContent = `다음: ${next} · ${TIER_DESCS[cur + 1]}`;
                if (p.gold < cost) {
                    this.elTierBtn.textContent = `${next} (${cost} G - 부족)`;
                    this.elTierBtn.disabled = true;
                } else {
                    this.elTierBtn.textContent = `→ ${next} (${cost} G)`;
                    this.elTierBtn.disabled = false;
                }
            }
        }

        // === 사양 업그레이드 ===
        for (const stat of Object.keys(UPGRADE_DEFS)) {
            const def = UPGRADE_DEFS[stat];
            const lvl = p.upgrades[stat];
            const row = this.elUpgradeList.querySelector(`.upgrade-row[data-stat="${stat}"]`);
            if (!row) continue;

            row.querySelector(".upgrade-level").textContent = `Lv ${lvl}/${def.max}`;
            const desc = lvl >= def.max
                ? `${def.currentText(p)}  ·  최대치 도달`
                : `${def.currentText(p)} → ${def.nextText(p)}`;
            row.querySelector(".upgrade-desc").textContent = desc;

            const btn = row.querySelector(".upgrade-btn");
            if (lvl >= def.max) {
                btn.textContent = "MAX";
                btn.disabled = true;
            } else {
                const cost = upgradeCost(stat, lvl);
                if (p.gold < cost) {
                    btn.textContent = `${cost} G (부족)`;
                    btn.disabled = true;
                } else {
                    btn.textContent = `업그레이드 (${cost} G)`;
                    btn.disabled = false;
                }
            }
        }

        // === 무기 카탈로그 버튼 상태 ===
        const W = window.WEAPONS || {};
        if (this.elWeaponList) {
            for (const card of this.elWeaponList.querySelectorAll(".weapon-card")) {
                const id = card.dataset.weaponId;
                const w = W[id];
                const btn = card.querySelector(".weapon-buy-btn");
                if (!w || !btn) continue;
                if (this.pendingPurchase) {
                    btn.textContent = (this.pendingPurchase === id) ? "장착 대기 중…" : "다른 무기 장착 대기";
                    btn.disabled = true;
                } else if (p.gold < w.cost) {
                    btn.textContent = `${w.cost} G (부족)`;
                    btn.disabled = true;
                } else {
                    btn.textContent = `구매 (${w.cost} G)`;
                    btn.disabled = false;
                }
            }
        }

        // === Pending 안내 + Close 버튼 잠금 ===
        if (this.pendingPurchase) {
            const pw = W[this.pendingPurchase];
            if (this.elPendingMsg) this.elPendingMsg.classList.remove("hidden");
            if (this.elPendingName) this.elPendingName.textContent = pw ? pw.name : this.pendingPurchase;
            if (this.elClose) {
                this.elClose.disabled = true;
                this.elClose.textContent = "← 무기 장착 후 닫을 수 있음";
            }
        } else {
            if (this.elPendingMsg) this.elPendingMsg.classList.add("hidden");
            if (this.elClose) {
                this.elClose.disabled = false;
                // 터치 모드엔 ESC 키가 없으므로 키 안내 생략
                const touch = !!(window.TouchControls && window.TouchControls.active);
                this.elClose.textContent = touch ? "← 떠나기" : "← 떠나기 (ESC)";
            }
        }

        // === 함선 다이어그램 갱신 ===
        this._buildShipDiagram();
    },

    _doRepair() {
        const p = this.player;
        if (!p) return;
        const missing = p.maxHp - p.hp;
        if (missing <= 0) return;
        const amount = Math.min(Math.ceil(p.maxHp * REPAIR_RATIO), Math.ceil(missing));
        const cost   = Math.ceil(amount * REPAIR_PER_HP);
        if (p.gold < cost) return;
        p.gold -= cost;
        p.repairHull(amount);
        if (window.SFX) window.SFX.uiPurchase();
        this.refresh();
    },

    _doRefuel() {
        const p = this.player;
        if (!p) return;
        if (p.fuel >= p.maxFuel - 0.01) return;
        if (p.gold < REFUEL_COST) return;
        p.gold -= REFUEL_COST;
        p.refuel();
        if (window.SFX) window.SFX.uiPurchase();
        this.refresh();
    },

    _doTierUpgrade() {
        const p = this.player;
        if (!p || p.tier >= 3) return;
        const cost = TIER_COSTS[p.tier + 1];
        if (cost < 0) return;
        if (p.gold < cost) return;
        p.gold -= cost;
        p.upgradeTier();
        if (window.SFX) window.SFX.uiPurchase();
        this.refresh();
    },


    _buildWeaponList() {
        if (!this.elWeaponList) return;
        this.elWeaponList.innerHTML = "";
        const W = window.WEAPONS || {};
        for (const id of Object.keys(W)) {
            const w = W[id];
            if (!w.cost || w.cost <= 0) continue;   // 시작 무기(base_laser)는 노출 X
            const card = document.createElement("div");
            card.className = "weapon-card";
            card.dataset.weaponId = id;
            card.innerHTML = `
                <div class="weapon-info">
                    <div class="weapon-name">${w.name}</div>
                    <div class="weapon-stats">DMG <span class="val">${w.damage}</span> · 탄속 <span class="val">${w.bulletSpeed}</span> · 환불 ${Math.round((w.refundRatio || WEAPON_REFUND_RATIO) * 100)}%</div>
                    <div class="weapon-stats desc">${w.description}</div>
                </div>
                <button class="weapon-buy-btn">구매 (${w.cost} G)</button>
            `;
            card.querySelector(".weapon-buy-btn")
                .addEventListener("click", () => this._purchaseWeapon(id));
            this.elWeaponList.appendChild(card);
        }
    },

    _buildShipDiagram() {
        const p = this.player;
        if (!p || !this.elShipDiagram) return;
        const W = window.WEAPONS || {};
        const tiers = window.PLAYER_TIERS;
        if (!tiers) { this.elShipDiagram.innerHTML = ""; return; }
        const tier = tiers[p.tier || 0];
        const r = tier.r;
        // viewBox 200x125, 함선 중앙 / 슬롯 scale
        const viewW = 200, viewH = 125;
        const cx = viewW / 2, cy = viewH / 2 - 8;
        // 함선 r 기준 scale (Battleship r=28 일 때도 view 안에 깔끔히 들어가도록)
        const scale = Math.min(2.4, 36 / r);

        // 함선 본체 그리기 (tier 별 모양)
        const sR = r * scale;
        let bodySvg;
        if (p.tier === 0) {
            // Frigate - 화살촉
            bodySvg = `<polygon points="${cx + sR},${cy} ${cx - sR*0.4},${cy - sR} ${cx - sR},${cy - sR*0.4} ${cx - sR*0.6},${cy} ${cx - sR},${cy + sR*0.4} ${cx - sR*0.4},${cy + sR}" fill="#1e3a52" stroke="#5fd0ff" stroke-width="1.5"/>`;
        } else if (p.tier === 1) {
            // Destroyer - 가로 길쭉
            const rx = sR * 1.4, ry = sR * 0.85;
            bodySvg = `<polygon points="${cx+rx},${cy} ${cx+rx*0.65},${cy-ry*0.75} ${cx-rx*0.55},${cy-ry*0.95} ${cx-rx*0.95},${cy-ry*0.4} ${cx-rx*0.95},${cy+ry*0.4} ${cx-rx*0.55},${cy+ry*0.95} ${cx+rx*0.65},${cy+ry*0.75}" fill="#1e3a52" stroke="#5fd0ff" stroke-width="1.5"/>`;
        } else if (p.tier === 2) {
            // Cruiser - 다이아몬드 + 화살촉
            bodySvg = `<polygon points="${cx + sR*1.1},${cy} ${cx + sR*0.3},${cy - sR*0.85} ${cx - sR*0.5},${cy - sR*0.95} ${cx - sR},${cy - sR*0.35} ${cx - sR},${cy + sR*0.35} ${cx - sR*0.5},${cy + sR*0.95} ${cx + sR*0.3},${cy + sR*0.85}" fill="#1e3a52" stroke="#5fd0ff" stroke-width="1.5"/>`;
        } else {
            // Battleship - 8각형 거대
            bodySvg = `<polygon points="${cx + sR},${cy} ${cx + sR*0.6},${cy - sR*0.85} ${cx - sR*0.5},${cy - sR*0.95} ${cx - sR},${cy - sR*0.4} ${cx - sR},${cy + sR*0.4} ${cx - sR*0.5},${cy + sR*0.95} ${cx + sR*0.6},${cy + sR*0.85}" fill="#1e3a52" stroke="#5fd0ff" stroke-width="2"/>`;
        }

        // 슬롯
        let slotsSvg = "";
        const pending = this.pendingPurchase;
        const pendingClass = pending ? "pending-target clickable" : (pending === null ? "" : "");
        // 터치 모드: 손가락으로 누르기 쉽게 보이지 않는 넓은 터치 영역 추가
        const touch = !!(window.TouchControls && window.TouchControls.active);
        p.turrets.forEach((t, i) => {
            const sx = cx + t.x * scale;
            const sy = cy + t.y * scale;
            const wpn = W[t.weapon] || W.base_laser;
            const slotClass = `turret-slot ${pending ? "pending-target clickable" : ""}`;
            slotsSvg += `
                <g class="${slotClass}" data-slot-idx="${i}">
                    ${touch ? `<circle class="slot-hit" cx="${sx}" cy="${sy}" r="15" fill="transparent"/>` : ""}
                    <circle class="slot-ring" cx="${sx}" cy="${sy}" r="11"
                        fill="rgba(0,0,0,0.55)" stroke="${wpn.color}" stroke-width="1.6"/>
                    <circle cx="${sx}" cy="${sy}" r="5.5" fill="${wpn.color}" opacity="0.9"/>
                </g>
            `;
        });

        // 슬롯별 라벨 (포탑 아래)
        let labelsSvg = "";
        p.turrets.forEach((t, i) => {
            const wpn = W[t.weapon] || W.base_laser;
            const lx = 18 + i * (164 / Math.max(1, p.turrets.length));
            const ly = viewH - 6;
            labelsSvg += `<text x="${lx}" y="${ly}" text-anchor="start" fill="${wpn.color}" font-size="8.5" font-family="Consolas, monospace">#${i+1} ${wpn.name}</text>`;
        });

        this.elShipDiagram.innerHTML = `
            <svg viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="xMidYMid meet">
                ${bodySvg}
                ${slotsSvg}
                ${labelsSvg}
            </svg>
        `;

        // 슬롯 클릭 핸들러
        this.elShipDiagram.querySelectorAll(".turret-slot").forEach(g => {
            g.addEventListener("click", () => {
                if (!this.pendingPurchase) return;
                const idx = parseInt(g.dataset.slotIdx, 10);
                this._equipPendingToSlot(idx);
            });
        });
    },

    _purchaseWeapon(id) {
        const p = this.player;
        if (!p) return;
        if (this.pendingPurchase) return;   // 이미 대기 중
        const W = window.WEAPONS || {};
        const w = W[id];
        if (!w || p.gold < w.cost) return;
        p.gold -= w.cost;
        this.pendingPurchase = id;
        if (window.SFX) window.SFX.uiPurchase();
        this.refresh();
    },

    _equipPendingToSlot(slotIdx) {
        const p = this.player;
        if (!p || !this.pendingPurchase) return;
        if (slotIdx < 0 || slotIdx >= p.turrets.length) return;
        const W = window.WEAPONS || {};
        const newId = this.pendingPurchase;
        const oldId = p.turrets[slotIdx].weapon || "base_laser";
        // 환불 (base_laser 는 cost=0 이라 환불 0)
        const oldW = W[oldId];
        if (oldW && oldW.cost > 0) {
            const refund = Math.round(oldW.cost * (oldW.refundRatio || WEAPON_REFUND_RATIO));
            p.gold += refund;
            // 환불 골드 플로터 (선택)
            if (refund > 0) p._goldFloater = { amount: +refund, life: 1.5, maxLife: 1.5 };
        }
        // 교체
        p.turrets[slotIdx].weapon = newId;
        this.pendingPurchase = null;
        if (window.SFX) window.SFX.uiClick();
        this.refresh();
    },

    _doUpgrade(stat) {
        const p = this.player;
        if (!p) return;
        if (!p.canUpgrade(stat)) return;
        const cost = upgradeCost(stat, p.upgrades[stat]);
        if (p.gold < cost) return;
        p.gold -= cost;
        p.upgradeStat(stat);
        if (window.SFX) window.SFX.uiPurchase();
        this.refresh();
    },
};

window.UPGRADE_DEFS = UPGRADE_DEFS;
window.upgradeCost  = upgradeCost;
window.ShopScreen   = ShopScreen;
window.SHOP_REPAIR_RATIO  = REPAIR_RATIO;
window.SHOP_REPAIR_PER_HP = REPAIR_PER_HP;
window.SHOP_REFUEL_COST   = REFUEL_COST;

window.WEAPON_REFUND_RATIO = WEAPON_REFUND_RATIO;
