const GameConfig = {
    PLAYER_SPEED: 250,
    HUNTER_MOVE_RANGE: 200,
    HUNTER_SPEED: 150,
    HUNTER_MAX_HEALTH: 100,
    MAP_LIMIT_OFFSET_X: 1300,
    MAP_LIMIT_OFFSET_Y: 200,
    PADDING: 50,
    BULLET_DATA: [
        { speed: 1200, damage: 5 },
        { speed: 700, damage: 10 },
        { speed: 600, damage: 15 },
        { speed: 550, damage: 20 },
        { speed: 400, damage: 30 },
    ],
};

module.exports = GameConfig;
