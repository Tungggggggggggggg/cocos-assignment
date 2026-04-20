// spineMenuManager.js
cc.Class({
    extends: cc.Component,

    properties: {
        spineComp: sp.Skeleton,
        contentView: cc.Node,
        btnPrefab: cc.Prefab,
    },

    start() {
        this.scheduleOnce(() => this.buildMenu(), 0);
    },

    buildMenu() {
        const animNames = this.getAnimNames();
        if (!animNames) return;

        this.contentView.removeAllChildren();
        animNames.forEach((name) => this.createItem(name));
        this.contentView.getComponent(cc.Layout)?.updateLayout();
    },

    getAnimNames() {
        if (!this.spineComp?.skeletonData) return null;
        return Object.keys(this.spineComp.skeletonData.skeletonJson.animations);
    },

    createItem(name) {
        const node = cc.instantiate(this.btnPrefab);
        node.parent = this.contentView;
        node.getComponent("AnimationItem")?.init(name, (selectedName) => {
            this.playAnimation(selectedName);
        });
    },

    playAnimation(name) {
        this.spineComp.setAnimation(0, name, true);
    },
});
