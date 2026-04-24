export const GameConfig = {
    PLAYER: {
        BASE_SPEED: 300,
        BOUNDARY_PADDING: 50,
        SCALE: 0.3,
    },
    ENEMY: {
        SPAWN_INTERVAL: 2,
        SPEED_MIN: 150,
        SPEED_MAX: 250,
        MAX_HEALTH: 100,
        DESPAWN_X: -1200,
    },
    BULLET: {
        SPEED: 800,
        DAMAGE: 20,
    },
};

export const EventName = {
    GAME_START: "game-start",
    GAME_OVER: "game-over",
    ADD_SCORE: "add-score",
    ENTITY_DIED: "entity-died",
    RETURN_BULLET: "return-bullet",
    RETURN_ENEMY: "return-enemy",
};
