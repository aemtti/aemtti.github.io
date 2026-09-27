// input.js - 키보드 / 마우스 입력 매니저

const Input = {
    keys: Object.create(null),
    pressed: Object.create(null),
    mouseX: 0, mouseY: 0,
    worldX: 0, worldY: 0,
    mouseDown: false,
    mouseClicked: false,

    init(canvas) {
        addEventListener("keydown", (e) => {
            if (!this.keys[e.code]) this.pressed[e.code] = true;
            this.keys[e.code] = true;
            if ([
                "KeyW", "KeyA", "KeyS", "KeyD",
                "Space", "ShiftLeft", "ShiftRight",
            ].includes(e.code)) {
                e.preventDefault();
            }
        });
        addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });

        canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        canvas.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                if (!this.mouseDown) this.mouseClicked = true;
                this.mouseDown = true;
            }
        });
        addEventListener("mouseup", (e) => {
            if (e.button === 0) this.mouseDown = false;
        });
        canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        addEventListener("blur", () => { this.keys = Object.create(null); });
    },

    endFrame() {
        this.pressed = Object.create(null);
        this.mouseClicked = false;
    },

    isDown(code) { return !!this.keys[code]; },
};

window.Input = Input;
