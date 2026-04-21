const GameConfig = require("GameConfig");

cc.Class({
    extends: cc.Component,

    properties: { healthBar: cc.ProgressBar },

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
        this._health = Math.max(0, this._health - amount);
        if (this.healthBar) {
            this.healthBar.progress = this._health / GameConfig.CREEP_MAX_HEALTH;
        }
        if (this._health <= 0) {
            this.node.destroy();
        }
    },
});
