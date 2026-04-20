import { instance } from "mEmitter";

cc.Class({
    extends: cc.Component,

    onBtnRemoveEvents() {
        instance.emit("CMD_STOP_LISTEN");
    },

    onBtnResetEvents() {
        instance.emit("CMD_START_LISTEN");
    },

    onEmitTween() {
        instance.emit("EVT_TWEEN");
    },

    onEmitAction() {
        instance.emit("EVT_ACTION");
    },

    onEmitTimeline() {
        instance.emit("EVT_TIMELINE");
    },
});
