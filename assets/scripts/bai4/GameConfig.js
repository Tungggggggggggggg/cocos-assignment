const GameConfig = {
    PLAYER_SPEED: 500,

    CREEP_MOVE_RANGE: 200,
    CREEP_SPEED: 150,
    CREEP_MAX_HEALTH: 100,

    BULLET_DATA: [
        { type: "NORMAL", speed: 600, damage: 10 },
        { type: "FAST", speed: 1200, damage: 5 },
        { type: "HEAVY", speed: 400, damage: 30 },
        { type: "FIRE", speed: 700, damage: 15 },
        { type: "ICE", speed: 550, damage: 12 },
    ],
};

module.exports = GameConfig;
