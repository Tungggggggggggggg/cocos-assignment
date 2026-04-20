// assets/scripts/controllers/PlayerController.js
const GameConfig = require("GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        posFire: cc.Node, // Điểm đầu súng (local node của Player)
        bulletLayer: cc.Node, // Tham chiếu đến Layer quản lý đạn
    },

    onLoad() {
        this._moveDir = cc.v2(0, 0);
        // Đăng ký sự kiện bàn phím [cite: 2616, 2634]
        cc.systemEvent.on(
            cc.SystemEvent.EventType.KEY_DOWN,
            this.onKeyDown,
            this,
        );
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    update(dt) {
        this.handleMovement(dt); // Chạy logic di chuyển mỗi frame [cite: 1608, 1664]
    },

    handleMovement(dt) {
        if (this._moveDir.mag() === 0) return;

        let nextPos = this.node
            .getPosition()
            .add(this._moveDir.mul(GameConfig.PLAYER_SPEED * dt));

        // Giới hạn nhân vật di chuyển trong vùng nhất định
        const limit = GameConfig.PLAYER_LIMIT;
        nextPos.x = cc.misc.clampf(nextPos.x, limit.minX, limit.maxX);
        nextPos.y = cc.misc.clampf(nextPos.y, limit.minY, limit.maxY);

        this.node.setPosition(nextPos);
    },

    onKeyDown(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.w:
                this._moveDir.y = 1;
                break;
            case cc.macro.KEY.s:
                this._moveDir.y = -1;
                break;
            case cc.macro.KEY.a:
                this._moveDir.x = -1;
                break;
            case cc.macro.KEY.d:
                this._moveDir.x = 1;
                break;
            case cc.macro.KEY.space:
                this.fire();
                break; // Nút bắn
        }
    },

    onKeyUp(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.w:
            case cc.macro.KEY.s:
                this._moveDir.y = 0;
                break;
            case cc.macro.KEY.a:
            case cc.macro.KEY.d:
                this._moveDir.x = 0;
                break;
        }
    },
fire() {
    const posFire = this.bulletLayer.convertToNodeSpaceAR(this.posFire.convertToWorldSpaceAR(cc.v2(0, 0)));
    
    // Thay đổi từ cc.exports.BulletManager thành cc.BulletManager
    if (cc.BulletManager) {
        cc.BulletManager.spawnBullet(posFire);
    }

    const anim = this.getComponent(cc.Animation);
    if (anim) anim.play("shoot"); // Đã sửa thành "shoot" theo animation Spine
},

    onDestroy() {
        cc.systemEvent.off(
            cc.SystemEvent.EventType.KEY_DOWN,
            this.onKeyDown,
            this,
        );
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },
});
