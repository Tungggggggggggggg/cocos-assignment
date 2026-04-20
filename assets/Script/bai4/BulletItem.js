cc.Class({
    extends: cc.Component,

    init(config) {
        this._speed = config.speed;
        this._damage = config.damage;
        this.node.color = cc.Color.fromHEX(new cc.Color(), config.color);
        this._active = true;
        cc.log("Bullet Initialized with speed:", this._speed);
    },

    update(dt) {
        if (!this._active) return;

        this.node.x += this._speed * dt;

        // Kiểm tra biên bằng World Space để đảm bảo đạn bay hết màn hình
        let worldPos = this.node.parent.convertToWorldSpaceAR(
            this.node.position,
        );
        if (worldPos.x > cc.winSize.width + 100) {
            this.recycle();
        }
    },

    onCollisionEnter(other, self) {
        cc.log("COLLISION DETECTED with:", other.node.name);

        // Lấy script CreepItem từ đối tượng bị đâm trúng
        const creep = other.node.getComponent("CreepItem");

        if (creep) {
            // Bắn sự kiện lên lớp BulletLayer để Manager xử lý
            this.node.parent.emit("bullet-hit-creep", {
                creep: creep,
                damage: this._damage,
            });
        } else {
            cc.warn("Hit something without CreepItem component!");
        }

        this.recycle();
    },

    recycle() {
        this._active = false;
        if (cc.BulletManager) {
            cc.BulletManager.recycleBullet(this.node);
        }
    },
});
