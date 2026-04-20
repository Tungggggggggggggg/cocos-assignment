import { instance } from "mEmitter";

cc.Class({
    extends: cc.Component,

    properties: {
        spineComp: { default: null, type: sp.Skeleton },
        timelineClipName: "CharacterSpecialEffect",
    },

    onLoad() {
        this._callbackTween = this.onBtnTween.bind(this);
        this._callbackAction = this.onBtnRunAction.bind(this);
        this._callbackTimeline = this.onBtnTimeline.bind(this);

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
        instance.registerEvent("EVT_TWEEN", this._callbackTween);
        instance.registerEvent("EVT_ACTION", this._callbackAction);
        instance.registerEvent("EVT_TIMELINE", this._callbackTimeline);
    },

    stopListening() {
        instance.removeEvent("EVT_TWEEN", this._callbackTween);
        instance.removeEvent("EVT_ACTION", this._callbackAction);
        instance.removeEvent("EVT_TIMELINE", this._callbackTimeline);
    },

    onBtnTween() {
        cc.tween(this.spineComp.node)
            .to(0.3, { scale: 0.7, angle: -30 }, { easing: "backOut" })
            .to(0.3, { scale: 0.8, angle: 0 }, { easing: "sineIn" })
            .start();
    },

    onBtnRunAction() {
        let jumpUp = cc
            .moveBy(0.4, cc.v2(0, 100))
            .easing(cc.easeCubicActionOut());
        let jumpDown = cc
            .moveBy(0.4, cc.v2(0, -100))
            .easing(cc.easeCubicActionIn());
        let sequence = cc.sequence(jumpUp, jumpDown).repeat(2);
        this.spineComp.node.runAction(sequence);
    },

    onBtnTimeline() {
        let animComp = this.spineComp.getComponent(cc.Animation);
        animComp.play(this.timelineClipName);
    },
});
