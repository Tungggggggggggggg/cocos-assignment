import { instance } from "mEmitter";

cc.Class({
    extends: cc.Component,

    onBtnRemoveEvents() {
        instance.emit("STOP_LISTEN");
    },

    onBtnResetEvents() {
        instance.emit("START_LISTEN");
    },

    onEmitTween() {
        instance.emit("TWEEN");
    },

    onEmitAction() {
        instance.emit("ACTION");
    },

    onEmitTimeline() {
        instance.emit("TIMELINE");
    },
});
