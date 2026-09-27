// repair-station.js - 정비소. 자동 회복 없음. 플레이어가 작용 범위에 들어오면 [E] 입장 텍스트 표시.

class RepairStation {
    constructor(x, y, seed = 0) {
        this.x = x; this.y = y;
        this.vx = 0; this.vy = 0;
        this.r = 38;
        this.alive = true;
        this.type = "shipyard";
        this.pulse = (seed % 1000) / 1000 * TAU;

        this.repairRange = this.r + 60;   // 모달 진입 가능 범위
        this.playerInRange = false;       // 시각/HUD용 플래그
    }

    update(dt, world) {
        this.pulse += dt * 1.2;
        this.playerInRange = false;
        const p = world.player;
        if (p && p.alive) {
            const d = Util.dist(p.x, p.y, this.x, this.y);
            if (d < this.repairRange) this.playerInRange = true;
        }
    }

    draw(ctx) {
        const pulse = (Math.sin(this.pulse) * 0.5 + 0.5);

        // 작용 범위 링 (플레이어 진입 시 더 뚜렷)
        const ringAlpha = this.playerInRange ? (0.25 + pulse * 0.35) : (0.10 + pulse * 0.10);
        ctx.strokeStyle = `rgba(123, 227, 154, ${ringAlpha})`;
        ctx.lineWidth = this.playerInRange ? 2 : 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.repairRange, 0, TAU);
        ctx.stroke();

        // 외곽 펄스 링
        const ringR = this.r + 10 + pulse * 8;
        ctx.strokeStyle = `rgba(123, 227, 154, ${0.25 + pulse * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, ringR, 0, TAU);
        ctx.stroke();

        // 본체 (육각형)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.pulse * 0.15);
        ctx.fillStyle = "#1a3a2a";
        ctx.strokeStyle = "#7be39a";
        ctx.lineWidth = 2;
        const r = this.r * 0.75;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * TAU;
            const x = Math.cos(a) * r;
            const y = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 의무 십자
        ctx.fillStyle = `rgba(180, 255, 200, ${0.85 + pulse * 0.15})`;
        ctx.fillRect(-3, -12, 6, 24);
        ctx.fillRect(-12, -3, 24, 6);
        ctx.restore();

        // 라벨
        ctx.fillStyle = "rgba(180, 255, 200, 0.9)";
        ctx.font = "11px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText("◆ REPAIR STATION ◆", this.x, this.y - this.r - 14);

        // 플레이어 진입 시 [E] prompt (터치 모드는 화면의 DOCK 버튼)
        const touch = !!(window.TouchControls && window.TouchControls.active);
        if (this.playerInRange) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 14px Consolas, monospace";
            ctx.fillText(touch ? "[DOCK] 입장" : "[E] 입장", this.x, this.y - this.r - 36);
        } else {
            ctx.fillStyle = "rgba(180, 255, 200, 0.6)";
            ctx.font = "10px Consolas, monospace";
            ctx.fillText(touch ? "(가까이 가서 DOCK)" : "(가까이 가서 E)", this.x, this.y + this.r + 24);
        }
    }
}

window.RepairStation = RepairStation;
