// assets/scripts/managers/BulletManager.js
const GameConfig = require("GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        bulletPrefab: cc.Prefab,
    },

    // Thay đổi từ cc.exports.BulletManager = this;
    onLoad() {
        cc.BulletManager = this; // Gán trực tiếp vào cc
        this._bulletPool = new cc.NodePool();
        this.node.on("bullet-hit-creep", this.handleBulletHit, this);
    },

    spawnBullet(pos) {
        let bullet =
            this._bulletPool.size() > 0
                ? this._bulletPool.get()
                : cc.instantiate(this.bulletPrefab);
        bullet.parent = this.node;
        bullet.setPosition(pos);

        // Random 1 trong 5 loại đạn
        const randomIdx = Math.floor(
            Math.random() * GameConfig.BULLET_DATA.length,
        );
        const config = GameConfig.BULLET_DATA[randomIdx];

        bullet.getComponent("BulletItem").init(config);
    },

    handleBulletHit(data) {
        // data.creep là component CreepItem của con quái bị trúng
        if (data.creep) {
            data.creep.takeDamage(data.damage);
        }
    },

    recycleBullet(bulletNode) {
        this._bulletPool.put(bulletNode);
    },
});
