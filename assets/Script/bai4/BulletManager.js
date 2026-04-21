import { BULLET_DATA } from "GameConfig";

cc.Class({
    extends: cc.Component,

    properties: { bulletPrefab: cc.Prefab },

    onLoad() {
        cc.BulletManager = this;
        this._pool = new cc.NodePool();
        this.node.on(
            "bullet-hit-creep",
            ({ creep, damage }) => creep?.takeDamage(damage),
            this,
        );
    },

    spawnBullet(pos) {
        const bullet =
            this._pool.size() > 0
                ? this._pool.get()
                : cc.instantiate(this.bulletPrefab);
        bullet.parent = this.node;
        bullet.setPosition(pos);
        const config =
            BULLET_DATA[
                Math.floor(Math.random() * BULLET_DATA.length)
            ];
        bullet.getComponent("BulletItem").init(config);
    },

    recycleBullet(node) {
        this._pool.put(node);
    },
});
