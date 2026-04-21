const GameConfig = require("GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        bulletPrefabs: { type: [cc.Prefab], default: [] },
    },

    onLoad() {
        cc.BulletManager = this;
        this._pools = this.bulletPrefabs.map(() => new cc.NodePool());
        this.node.on(
            "bullet-hit-creep",
            ({ creep, damage }) => creep?.takeDamage(damage),
            this,
        );
    },

    spawnBullet(pos) {
        const idx = Math.floor(Math.random() * this.bulletPrefabs.length);
        const config = GameConfig.BULLET_DATA[idx];
        const pool = this._pools[idx];

        const bullet =
            pool.size() > 0
                ? pool.get()
                : cc.instantiate(this.bulletPrefabs[idx]);

        bullet.parent = this.node;
        bullet.setPosition(pos);
        bullet._poolIdx = idx;
        bullet.getComponent("BulletItem").init(config);
    },

    recycleBullet(node) {
        const idx = node._poolIdx;
        if (idx !== undefined) {
            this._pools[idx].put(node);
        } else {
            node.destroy();
        }
    },
});
