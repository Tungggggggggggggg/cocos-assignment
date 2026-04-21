cc.Class({
    extends: cc.Component,

    init({ speed, damage, color }) {
        this._speed = speed;
        this._damage = damage;
        this._active = true;
        this.node.color = cc.Color.fromHEX(new cc.Color(), color);
    },

    update(dt) {
        if (!this._active) return;
        this.node.x += this._speed * dt;
        const wx = this.node.parent.convertToWorldSpaceAR(this.node.position).x;
        if (wx > cc.winSize.width + 100) this.recycle();
    },

    onCollisionEnter(other) {
        const creep = other.node.getComponent("CreepItem");
        if (creep)
            this.node.parent.emit("bullet-hit-creep", {
                creep,
                damage: this._damage,
            });
        this.recycle();
    },

    recycle() {
        if (!this._active) return;
        this._active = false;
        cc.BulletManager?.recycleBullet(this.node);
    },
});
