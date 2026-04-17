cc.Class({
    extends: cc.Component,

    properties: {
        player1: cc.Node,
        player2: cc.Node,
        p1Bar: cc.ProgressBar,
        p2Bar: cc.ProgressBar,
        btnGoNode: cc.Node,
        btnBackNode: cc.Node,

        speed: 400,
        consumeSpeed: 0.5,
        recoverySpeed: 0.15,
        minX: -730,
        maxX: 730,
    },

    onLoad() {
        this.moveDir = 0;
        this.activePlayer = this.player1;
        this.currentAnim = "";

        this.p1Dead = false;
        this.p2Dead = false;

        this.p1Spine = this.player1.getComponent(sp.Skeleton);
        this.p2Spine = this.player2.getComponent(sp.Skeleton);

        this.p1BaseScale = Math.abs(this.player1.scaleX);
        this.p2BaseScale = Math.abs(this.player2.scaleX);

        this._updateCache();

        const { TOUCH_START, TOUCH_END, TOUCH_CANCEL } = cc.Node.EventType;

        this.btnGoNode.on(TOUCH_START, this.startGo, this);
        this.btnGoNode.on(TOUCH_END, this.stopMove, this);
        this.btnGoNode.on(TOUCH_CANCEL, this.stopMove, this);

        this.btnBackNode.on(TOUCH_START, this.startBack, this);
        this.btnBackNode.on(TOUCH_END, this.stopMove, this);
        this.btnBackNode.on(TOUCH_CANCEL, this.stopMove, this);

        this.playAnim("idle");
    },

    _updateCache() {
        const isP1 = this.activePlayer === this.player1;

        this.activeSpine = isP1 ? this.p1Spine : this.p2Spine;
        this.activeBar = isP1 ? this.p1Bar : this.p2Bar;
        this.inactiveBar = isP1 ? this.p2Bar : this.p1Bar;
    },

    _fixChildrenScale(playerNode) {
        const sign = Math.sign(playerNode.scaleX);
        playerNode.children.forEach((child) => {
            child.scaleX = Math.abs(child.scaleX) * sign;
        });
    },

    startGo() {
        const isP1 = this.activePlayer === this.player1;
        const isDead = isP1 ? this.p1Dead : this.p2Dead;

        if (isDead) {
            return;
        }

        if (this.activePlayer === this.player1) {
            this.activePlayer.scaleX = this.p1BaseScale;
            this.moveDir = 1;
        } else {
            this.activePlayer.scaleX = -this.p2BaseScale;
            this.moveDir = -1;
        }
        this._fixChildrenScale(this.activePlayer);
        this.playAnim("walk");
    },

    startBack() {
        const isP1 = this.activePlayer === this.player1;
        const isDead = isP1 ? this.p1Dead : this.p2Dead;

        if (isDead) {
            return;
        }

        if (this.activePlayer === this.player1) {
            this.activePlayer.scaleX = -this.p1BaseScale;
            this.moveDir = -1;
        } else {
            this.activePlayer.scaleX = this.p2BaseScale;
            this.moveDir = 1;
        }
        this._fixChildrenScale(this.activePlayer);
        this.playAnim("walk");
    },

    stopMove() {
        this.moveDir = 0;

        const isP1 = this.activePlayer === this.player1;
        const isDead = isP1 ? this.p1Dead : this.p2Dead;

        if (!isDead) {
            this.playAnim("idle");
        }
    },

    playAnim(name, loop = true) {
        if (this.currentAnim === name) {
            return;
        }
        const spine = this.activeSpine;
        if (spine) {
            spine.setAnimation(0, name, loop);
            this.currentAnim = name;
        }
    },

    btnSwitch() {
        this.stopMove();
        this.activePlayer =
            this.activePlayer === this.player1 ? this.player2 : this.player1;
        this.currentAnim = "";
        this._updateCache();

        const isP1 = this.activePlayer === this.player1;
        const isDead = isP1 ? this.p1Dead : this.p2Dead;

        if (!isDead) {
            this.playAnim("idle");
        } else {
            this.playAnim("death", false);
        }
    },

    update(dt) {
        const { activeBar, inactiveBar } = this;

        if (this.moveDir !== 0 && activeBar && activeBar.progress > 0) {
            const nextX = this.activePlayer.x + this.moveDir * this.speed * dt;
            if (nextX >= this.minX && nextX <= this.maxX) {
                this.activePlayer.x = nextX;
                activeBar.progress -= this.consumeSpeed * dt;
            } else {
                this.stopMove();
            }
        } else if (activeBar && activeBar.progress <= 0) {
            const isP1 = this.activePlayer === this.player1;
            const isDead = isP1 ? this.p1Dead : this.p2Dead;

            if (!isDead) {
                if (isP1) {
                    this.p1Dead = true;
                } else {
                    this.p2Dead = true;
                }

                activeBar.node.active = false;

                this.moveDir = 0;
                this.playAnim("death", false);
            }
        }
        if (this.moveDir === 0 && activeBar && activeBar.progress < 1) {
            activeBar.progress += this.recoverySpeed * dt;
        }
        if (inactiveBar && inactiveBar.progress < 1) {
            inactiveBar.progress += this.recoverySpeed * dt;
        }
    },
});
