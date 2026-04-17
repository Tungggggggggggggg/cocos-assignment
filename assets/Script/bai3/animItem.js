cc.Class({
    extends: cc.Component,

    properties: {
        lblName: {
            default: null,
            type: cc.Label,
        },
    },

    init(animName, onSelect) {
        this.animName = animName;
        this.onSelect = onSelect;
        this.lblName.string = animName;
    },

    onBtnClick() {
        this.onSelect?.(this.animName);
    },
});