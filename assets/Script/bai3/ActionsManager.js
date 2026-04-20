cc.Class({
    extends: cc.Component,

    properties: {
        spineComp: {
            default: null,
            type: sp.Skeleton,
        },

        timelineClipName: "CharacterSpecialEffect",
    },
    onBtnTween() {
        if (!this.spineComp) return;

        cc.tween(this.spineComp.node)
            .to(0.3, { scale: 1.2, angle: 15 }, { easing: "backOut" })
            .delay(0.1)
            .to(0.3, { scale: 1, angle: 0 }, { easing: "sineIn" })
            .start();
    },

    onBtnRunAction() {
        if (!this.spineComp) return;

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

        if (animComp) {
            animComp.play(this.timelineClipName);
        } else {
            cc.error(
                "Không tìm thấy component cc.Animation trên Node nhân vật",
            );
        }
    },
});
