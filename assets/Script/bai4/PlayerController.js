import { PLAYER_LIMIT, PLAYER_SPEED } from "GameConfig";

const KEY_DIR = {
    [cc.macro.KEY.w]: { axis: "y", val: 1 },
    [cc.macro.KEY.s]: { axis: "y", val: -1 },
    [cc.macro.KEY.a]: { axis: "x", val: -1 },
    [cc.macro.KEY.d]: { axis: "x", val: 1 },
};

cc.Class({
    extends: cc.Component,

    properties: {
        posFire: cc.Node,
        bulletLayer: cc.Node,
    },

    onLoad() {
        this._moveDir = cc.v2(0, 0);
        cc.systemEvent.on(
            cc.SystemEvent.EventType.KEY_DOWN,
            this.onKeyDown,
            this,
        );
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onDestroy() {
        cc.systemEvent.off(
            cc.SystemEvent.EventType.KEY_DOWN,
            this.onKeyDown,
            this,
        );
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    update(dt) {
        if (this._moveDir.mag() === 0) return;
        const { minX, maxX, minY, maxY } = PLAYER_LIMIT;
        const next = this.node
            .getPosition()
            .add(this._moveDir.mul(PLAYER_SPEED * dt));
        next.x = cc.misc.clampf(next.x, minX, maxX);
        next.y = cc.misc.clampf(next.y, minY, maxY);
        this.node.setPosition(next);
    },

    onKeyDown(e) {
        const k = KEY_DIR[e.keyCode];
        if (k) this._moveDir[k.axis] = k.val;
        else if (e.keyCode === cc.macro.KEY.space) this.fire();
    },

    onKeyUp(e) {
        const k = KEY_DIR[e.keyCode];
        if (k) this._moveDir[k.axis] = 0;
    },

    fire() {
        if (cc.BulletManager) {
            const pos = this.bulletLayer.convertToNodeSpaceAR(
                this.posFire.convertToWorldSpaceAR(cc.v2(0, 0)),
            );
            cc.BulletManager.spawnBullet(pos);
        }
        this.getComponent(cc.Animation)?.play("shoot");
    },
});
