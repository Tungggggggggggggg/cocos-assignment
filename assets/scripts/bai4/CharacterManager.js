cc.Class({
    extends: cc.Component,

    properties: {
        playerPrefab: cc.Prefab,
    },

    onLoad() {
        cc.CharacterManager = this;
    },

    spawnPlayer(pos) {
        const player = cc.instantiate(this.playerPrefab);
        player.parent = this.node;
        player.setPosition(pos);
        return player;
    }
});