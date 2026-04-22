cc.Class({
    extends: cc.Component,

    init({ speed, damage }) {
        this._speed = speed;
        this._damage = damage;
    },

    update(dt) {
        this.node.x += this._speed * dt;
        const wx = this.node.parent.convertToWorldSpaceAR(this.node.position).x;
        if (wx > cc.winSize.width + 100) {
            this.recycle();
        }
    },

    onCollisionEnter(other) {
        const hunter = other.node.getComponent("HunterController");
        if (hunter) {
            this.node.parent.emit("bullet-hit-hunter", {
                hunter,
                damage: this._damage,
            });
        }
        this.recycle();
    },

    recycle() {
        cc.BulletManager?.recycleBullet(this.node);
    },
});
