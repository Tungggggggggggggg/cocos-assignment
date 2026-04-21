cc.Class({
    extends: cc.Component,
    onLoad() {
        const mgr = cc.director.getCollisionManager();
        mgr.enabled = true;
        mgr.enabledDebugDraw = false;
    },
});
