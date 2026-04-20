// assets/scripts/managers/GameManager.js
cc.Class({
    extends: cc.Component,

// GameManager.js
onLoad() {
    let manager = cc.director.getCollisionManager();
    manager.enabled = true;
    manager.enabledDebugDraw = true;
    cc.log("Hệ thống va chạm đã được bật!"); // Nếu không thấy dòng này thì script GameManager chưa chạy
}
});