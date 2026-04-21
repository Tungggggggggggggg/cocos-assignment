import { CREEP_MAX_HEALTH, CREEP_SPEED, CREEP_MOVE_RANGE } from "GameConfig";

cc.Class({
    extends: cc.Component,

    properties: { manaBar: cc.ProgressBar },

    onLoad() {
        this._startY = this.node.y;
        this._direction = 1;
        this._health = CREEP_MAX_HEALTH;
    },

    update(dt) {
        this.node.y += CREEP_SPEED * this._direction * dt;
        if (Math.abs(this.node.y - this._startY) >= CREEP_MOVE_RANGE)
            this._direction *= -1;
    },

    takeDamage(amount) {
        this._health = Math.max(0, this._health - amount);
        if (this.manaBar)
            this.manaBar.progress = this._health / CREEP_MAX_HEALTH;
        if (this._health === 0) this.node.destroy();
    },
});
