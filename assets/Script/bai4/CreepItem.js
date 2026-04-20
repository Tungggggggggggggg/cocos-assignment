const GameConfig = require("GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        manaBar: cc.ProgressBar,
    },

    onLoad() {
        this._startY = this.node.y;
        this._direction = 1;
        this._health = GameConfig.CREEP_MAX_HEALTH;
    },

    update(dt) {
        this.node.y += GameConfig.CREEP_SPEED * this._direction * dt;
        if (
            Math.abs(this.node.y - this._startY) >= GameConfig.CREEP_MOVE_RANGE
        ) {
            this._direction *= -1;
        }
    },

    takeDamage(amount) {
        this._health -= amount;
        cc.log("Creep took damage:", amount, "Remaining health:", this._health);

        if (this.manaBar) {
            this.manaBar.progress = cc.misc.clampf(
                this._health / GameConfig.CREEP_MAX_HEALTH,
                0,
                1,
            );
        }

        if (this._health <= 0) {
            cc.log("Creep Dead!");
            this.node.destroy();
        }
    },
});
