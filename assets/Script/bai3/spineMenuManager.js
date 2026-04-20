import { instance } from "mEmitter";

cc.Class({
    extends: cc.Component,

    properties: {
        spineComp: sp.Skeleton,
        contentView: cc.Node,
        btnPrefab: cc.Prefab,
    },

    onLoad() {
        this._callbackPlay = this.playAnimation.bind(this);
        this.startListening();

        instance.registerEvent(
            "CMD_STOP_LISTEN",
            this.stopListening.bind(this),
        );
        instance.registerEvent(
            "CMD_START_LISTEN",
            this.startListening.bind(this),
        );
    },

    startListening() {
        instance.registerEvent("PLAY_SPINE_ANIM", this._callbackPlay);
    },

    stopListening() {
        instance.removeEvent("PLAY_SPINE_ANIM", this._callbackPlay);
    },

    start() {
        this.scheduleOnce(() => this.buildMenu(), 0);
    },

    buildMenu() {
        const animNames = Object.keys(
            this.spineComp.skeletonData.skeletonJson.animations,
        );
        this.contentView.removeAllChildren();
        animNames.forEach((name) => {
            const node = cc.instantiate(this.btnPrefab);
            node.parent = this.contentView;
            node.getComponent("AnimationItem")?.init(name);
        });
        this.contentView.getComponent(cc.Layout)?.updateLayout();
    },

    playAnimation(name) {
        this.spineComp.setAnimation(0, name, true);
    },
});
