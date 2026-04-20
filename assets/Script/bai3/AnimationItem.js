import { instance } from "mEmitter";

cc.Class({
    extends: cc.Component,

    properties: {
        lblName: { default: null, type: cc.Label },
    },

    init(animName) {
        this.animName = animName;
        this.lblName.string = animName;
    },

    onBtnClick() {
        instance.emit("PLAY_SPINE_ANIM", this.animName);
    },
});
