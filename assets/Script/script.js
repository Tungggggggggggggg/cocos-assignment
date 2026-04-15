cc.Class({
    extends: cc.Component,

    properties: {
        player1: cc.Node,
        player2: cc.Node,
        p1Bar: cc.ProgressBar,
        p2Bar: cc.ProgressBar,
        btnForwardNode: cc.Node,
        btnBackNode: cc.Node,

        speed: 400,
        consumeSpeed: 0.28,
        recoverySpeed: 0.15,
        minX: -730,
        maxX: 730,
    },

    onLoad() {
        this.moveDir = 0;
        this.activePlayer = this.player1;
        this.currentAnim = "";

        this.p1Spine = this.player1.getComponent(sp.Skeleton);
        this.p2Spine = this.player2.getComponent(sp.Skeleton);

        // Lưu tỷ lệ scale tuyệt đối (ví dụ 0.3)
        this.p1BaseScale = Math.abs(this.player1.scaleX);
        this.p2BaseScale = Math.abs(this.player2.scaleX);

        // Đăng ký sự kiện Touch
        this.btnForwardNode.on(
            cc.Node.EventType.TOUCH_START,
            this.startForward,
            this,
        );
        this.btnForwardNode.on(
            cc.Node.EventType.TOUCH_END,
            this.stopMove,
            this,
        );
        this.btnForwardNode.on(
            cc.Node.EventType.TOUCH_CANCEL,
            this.stopMove,
            this,
        );

        this.btnBackNode.on(
            cc.Node.EventType.TOUCH_START,
            this.startBack,
            this,
        );
        this.btnBackNode.on(cc.Node.EventType.TOUCH_END, this.stopMove, this);
        this.btnBackNode.on(
            cc.Node.EventType.TOUCH_CANCEL,
            this.stopMove,
            this,
        );

        this.playAnim("idle");
    },

    // Nút GO: Luôn đi về phía trước của mỗi nhân vật
    startForward() {
        if (this.activePlayer === this.player1) {
            this.activePlayer.scaleX = this.p1BaseScale; // P1 nhìn PHẢI
            this.moveDir = 1;
        } else {
            this.activePlayer.scaleX = -this.p2BaseScale; // P2 nhìn TRÁI
            this.moveDir = -1;
        }
        this.playAnim("walk");
    },

    // Nút BACK: Luôn đi về phía sau (quay đầu lại)
    startBack() {
        if (this.activePlayer === this.player1) {
            this.activePlayer.scaleX = -this.p1BaseScale; // P1 quay sang TRÁI
            this.moveDir = -1;
        } else {
            this.activePlayer.scaleX = this.p2BaseScale; // P2 quay sang PHẢI
            this.moveDir = 1;
        }
        this.playAnim("walk");
    },

    stopMove() {
        this.moveDir = 0;
        this.playAnim("idle");
    },

    playAnim(name) {
        if (this.currentAnim === name) return;
        let spine =
            this.activePlayer === this.player1 ? this.p1Spine : this.p2Spine;
        if (spine) {
            spine.setAnimation(0, name, true);
            this.currentAnim = name;
        }
    },

    btnSwitch() {
        this.stopMove();
        this.activePlayer =
            this.activePlayer === this.player1 ? this.player2 : this.player1;
        this.currentAnim = "";
        this.playAnim("idle");
    },

    update(dt) {
        let activeBar =
            this.activePlayer === this.player1 ? this.p1Bar : this.p2Bar;
        let inactiveBar =
            this.activePlayer === this.player1 ? this.p2Bar : this.p1Bar;

        if (this.moveDir !== 0 && activeBar && activeBar.progress > 0) {
            let nextX = this.activePlayer.x + this.moveDir * this.speed * dt;
            if (nextX >= this.minX && nextX <= this.maxX) {
                this.activePlayer.x = nextX;
                activeBar.progress -= this.consumeSpeed * dt;
            } else {
                this.stopMove();
            }
        } else if (activeBar && activeBar.progress <= 0) {
            this.stopMove();
        }

        // Hồi mana
        if (this.moveDir === 0 && activeBar && activeBar.progress < 1) {
            activeBar.progress += this.recoverySpeed * dt;
        }
        if (inactiveBar && inactiveBar.progress < 1) {
            inactiveBar.progress += this.recoverySpeed * dt;
        }
    },
});
