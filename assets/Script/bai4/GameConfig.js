// assets/scripts/configs/GameConfig.js
const GameConfig = {
    PLAYER_SPEED: 500,
    PLAYER_LIMIT: { minX: -450, maxX: 450, minY: -300, maxY: 300 },

    CREEP_MOVE_RANGE: 200,
    CREEP_SPEED: 150,
    CREEP_MAX_HEALTH: 100,

    // Cấu hình 5 loại đạn ngẫu nhiên
    BULLET_DATA: [
        { type: "NORMAL", speed: 600, damage: 10, color: "#FFFFFF" },
        { type: "FAST", speed: 1200, damage: 5, color: "#FFFF00" },
        { type: "HEAVY", speed: 400, damage: 30, color: "#FF0000" },
        { type: "FIRE", speed: 700, damage: 15, color: "#FFA500" },
        { type: "ICE", speed: 550, damage: 12, color: "#0000FF" },
    ],
};

module.exports = GameConfig;
