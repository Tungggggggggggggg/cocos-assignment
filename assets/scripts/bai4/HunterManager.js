const GameConfig = require("GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        hunterPrefab: cc.Prefab,
    },

    onLoad() {
        cc.HunterManager = this;
        // this._hunterPool = new cc.NodePool();
    },

    // spawnHunter(pos) {
    //     let hunter = null;
    //     if (this._hunterPool.size() > 0) {
    //         hunter = this._hunterPool.get();
    //     } else {
    //         hunter = cc.instantiate(this.hunterPrefab);
    //     }

    //     hunter.parent = this.node;
    //     hunter.setPosition(pos);

    //     const controller = hunter.getComponent("HunterController");
    //     if (controller && controller.init) {
    //         controller.init();
    //     }
    // },

    // recycleHunter(hunterNode) {
    //     this._hunterPool.put(hunterNode);
    // },

});