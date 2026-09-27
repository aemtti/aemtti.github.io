// game.js - 진입점, 게임 루프, 별 배경, 모드 전환 (타이틀/옵션/게임/일시정지/상점)

(function () {
    const canvas = document.getElementById("game");
    const ctx    = canvas.getContext("2d");

    let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    let viewW = 0, viewH = 0;

    function resize() {
        dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        viewW = window.innerWidth;
        viewH = window.innerHeight;
        // 크기가 같으면 다시 할당하지 않음 (할당하면 캔버스가 지워짐 — 터치 컨트롤이 resize 를 보낼 때)
        const cw = Math.floor(viewW * dpr), ch = Math.floor(viewH * dpr);
        if (canvas.width !== cw || canvas.height !== ch) {
            canvas.width  = cw;
            canvas.height = ch;
        }
        canvas.style.width  = viewW + "px";
        canvas.style.height = viewH + "px";
        if (camera) camera.resize(viewW, viewH);
    }

    let world = null, player = null, camera = null;
    let lastTime = performance.now();
    let running     = false;
    let gameStarted = false;
    let paused      = false;
    let shopOpen    = false;     // 상점 모달이 열려 있나

    function newGame() {
        const seed = (Math.random() * 0xffffffff) >>> 0;
        world  = new World(seed);
        camera = new Camera();
        camera.resize(viewW, viewH);
        world.setCamera(camera);

        player = new Player(0, 0);
        world.setPlayer(player);

        world.ensureChunk(0, 0);
        camera.x = player.x; camera.y = player.y;

        HUD.hideGameOver();
        HUD.hidePause();
        ShopScreen.hide();
        running = true;
        paused  = false;
        shopOpen = false;
    }

    function startGame() {
        TitleScreen.hide();
        OptionsScreen.hide();
        ShopScreen.hide();
        HUD.hideGameOver();
        HUD.hidePause();
        newGame();
        gameStarted = true;
        paused = false;
        shopOpen = false;
        lastTime = performance.now();
    }

    function returnToTitle() {
        HUD.hideGameOver();
        HUD.hidePause();
        ShopScreen.hide();
        running = false;
        paused = false;
        shopOpen = false;
        gameStarted = false;
        OptionsScreen.hide();
        TitleScreen.show();
    }

    function showOptions() { OptionsScreen.show(); }
    function hideOptions() { OptionsScreen.hide(); }

    function pauseGame() {
        if (!gameStarted || !running || shopOpen) return;
        paused = true;
        HUD.showPause();
    }
    function resumeGame() {
        if (!paused) return;
        paused = false;
        HUD.hidePause();
        lastTime = performance.now();
    }

    // 터치 조작(touch-controls.js)에 넘기는 상태 — 매 프레임 같은 객체 재사용
    const touchState = { inPlay: false, player: null, world: null, camera: null, viewW: 0, viewH: 0 };
    function getTouchState() {
        touchState.inPlay = gameStarted && running && !paused && !shopOpen;
        touchState.player = player;
        touchState.world  = world;
        touchState.camera = camera;
        touchState.viewW  = viewW;
        touchState.viewH  = viewH;
        return touchState;
    }
    const Touch = window.TouchControls || null;

    function openShop(station) {
        if (!gameStarted || !running || paused) return;
        shopOpen = true;
        ShopScreen.show(player);
    }
    function closeShop() {
        if (!shopOpen) return;
        shopOpen = false;
        ShopScreen.hide();
        // 긴 시간 모달 열려 있다가 닫혔을 때 dt 폭주 방지
        lastTime = performance.now();
    }

    // === 별 배경 ===
    const STAR_LAYERS = [
        { density: 0.00010, parallax: 0.25, size: 1, color: "rgba(180, 200, 220, 0.65)" },
        { density: 0.00018, parallax: 0.5,  size: 1, color: "rgba(220, 230, 250, 0.85)" },
    ];

    function drawStars() {
        if (!camera) return;
        const layerTile = 256;
        for (const layer of STAR_LAYERS) {
            const px = camera.x * layer.parallax;
            const py = camera.y * layer.parallax;
            const startX = Math.floor((px - viewW * 0.5) / layerTile) - 1;
            const endX   = Math.floor((px + viewW * 0.5) / layerTile) + 1;
            const startY = Math.floor((py - viewH * 0.5) / layerTile) - 1;
            const endY   = Math.floor((py + viewH * 0.5) / layerTile) + 1;
            ctx.fillStyle = layer.color;
            for (let ty = startY; ty <= endY; ty++) {
                for (let tx = startX; tx <= endX; tx++) {
                    const h = Util.hash32(tx, ty, 0xC0DE | (layer.parallax * 1000));
                    const count = Math.floor(layer.density * layerTile * layerTile) + 1;
                    let s = h;
                    for (let i = 0; i < count; i++) {
                        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
                        const lx = (s & 0xffff) / 65535;
                        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
                        const ly = (s & 0xffff) / 65535;
                        const sx = (tx * layerTile + lx * layerTile - px) + viewW * 0.5;
                        const sy = (ty * layerTile + ly * layerTile - py) + viewH * 0.5;
                        if (sx < 0 || sy < 0 || sx > viewW || sy > viewH) continue;
                        ctx.fillRect(sx, sy, layer.size, layer.size);
                    }
                }
            }
        }
    }

    function frame(now) {
        const rawDt = (now - lastTime) / 1000;
        lastTime = now;
        const dt = Math.min(rawDt, 1 / 30);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#05060a";
        ctx.fillRect(0, 0, viewW, viewH);

        if (!gameStarted) {
            camera.x += dt * 25;
            camera.y += dt * 8;
            drawStars();
            if (Touch) Touch.sync(getTouchState());   // 타이틀/옵션: 가상 컨트롤 숨김
            Input.endFrame();
            requestAnimationFrame(frame);
            return;
        }

        // === 인게임 키 처리 ===
        if (running) {
            if (Input.pressed["Escape"]) {
                // 정비소 무기 장착 대기 중에는 ESC 로도 닫을 수 없음
                if (shopOpen) {
                    if (ShopScreen.canClose && !ShopScreen.canClose()) {
                        // 무시 — 사용자에게 안내 메시지는 UI에 이미 표시됨
                    } else {
                        closeShop();
                    }
                }
                else if (paused)   resumeGame();
                else               pauseGame();
            }
            // E 키: 정비소 입장 (다른 모달 안 열려있을 때만)
            if (Input.pressed["KeyE"] && !paused && !shopOpen) {
                const station = world.nearestShipyardInRange();
                if (station) openShop(station);
            }
            // X 키: 카고 체인 말단 하나 분리 (속도 페널티 즉시 완화)
            if (Input.pressed["KeyX"] && !paused && !shopOpen) {
                player.detachLastCargo(world);
            }
        }

        // 터치 모드: 조준 스틱 → 가상 마우스 커서/사격 (마우스 조작 중엔 아무것도 안 함)
        if (Touch) Touch.beforeUpdate(dt, getTouchState());

        const [wmx, wmy] = camera.screenToWorld(Input.mouseX, Input.mouseY);
        Input.worldX = wmx; Input.worldY = wmy;

        // (터치) 세로 화면 회전 안내가 떠 있는 동안은 진행 정지
        if (running && !paused && !shopOpen && !(Touch && Touch.blocking())) {
            if (Input.pressed["KeyH"]) world.callRescue();
            world.update(dt);
            if (player.alive) {
                camera.follow(player, dt);
            } else {
                running = false;
                paused = false;
                shopOpen = false;
                HUD.hidePause();
                ShopScreen.hide();
                HUD.showGameOver(player);
                if (window.SFX) window.SFX.gameOver();
            }
        }

        drawStars();
        camera.apply(ctx);
        world.draw(ctx);
        if (Touch) Touch.drawWorld(ctx);   // 터치 조준점
        camera.restore(ctx);

        HUD.updateText(world);
        HUD.drawMinimap(world);

        if (Touch) Touch.sync(getTouchState());   // 가상 컨트롤 표시/숨김 (일시정지·상점·게임오버에선 숨김)
        Input.endFrame();
        requestAnimationFrame(frame);
    }

    // === 부팅 ===
    Input.init(canvas);
    HUD.init();
    HUD.onRestart(() => startGame());
    HUD.onTitle(() => returnToTitle());
    HUD.onResume(() => resumeGame());
    HUD.onPauseTitle(() => returnToTitle());
    TitleScreen.init(() => startGame(), () => showOptions());
    OptionsScreen.init(() => hideOptions());
    ShopScreen.init(() => closeShop());
    if (Touch) Touch.init();   // 터치 기기: 가상 스틱/버튼 (데스크톱에선 숨김)

    camera = new Camera();
    addEventListener("resize", resize);
    resize();

    TitleScreen.show();
    requestAnimationFrame(frame);

    window.GAME = {
        get world() { return world; },
        get player() { return player; },
        get camera() { return camera; },
        get gameStarted() { return gameStarted; },
        get running() { return running; },
        get paused() { return paused; },
        get shopOpen() { return shopOpen; },
        startGame, returnToTitle, pauseGame, resumeGame,
        showOptions, hideOptions, openShop, closeShop,
    };
})();
