const GameConfig = require("GameConfig");

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
        this._spine = this.getComponent(sp.Skeleton);
        const hw = cc.winSize.width / 2;
        const hh = cc.winSize.height / 2;
        this._limit = {
            minX: -hw + GameConfig.PADDING,
            maxX: hw - GameConfig.PADDING - 1250,
            minY: -hh + GameConfig.PADDING,
            maxY: hh - GameConfig.PADDING - 150,
        };
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
        const { minX, maxX, minY, maxY } = this._limit;
        const next = this.node
            .getPosition()
            .add(this._moveDir.mul(GameConfig.PLAYER_SPEED * dt));
        next.x = cc.misc.clampf(next.x, minX, maxX);
        next.y = cc.misc.clampf(next.y, minY, maxY);
        this.node.setPosition(next);
    },

    onKeyDown(e) {
        const k = KEY_DIR[e.keyCode];
        if (k) {
            this._moveDir[k.axis] = k.val;
        } else if (e.keyCode === cc.macro.KEY.space) {
            this.fire();
        }
    },

    onKeyUp(e) {
        const k = KEY_DIR[e.keyCode];
        if (k) {
            this._moveDir[k.axis] = 0;
        }
    },

    fire() {
        if (cc.BulletManager) {
            const worldPos = this.posFire.convertToWorldSpaceAR(cc.v2());
            const pos = this.bulletLayer.convertToNodeSpaceAR(worldPos);
            cc.BulletManager.spawnBullet(pos);
        }
        if (this._spine) {
            this._spine.setAnimation(0, "shoot", false);
            this._spine.addAnimation(0, "idle", true);
        }
    },
});
