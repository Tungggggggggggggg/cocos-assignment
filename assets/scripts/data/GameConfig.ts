export const GameConfig = {
    PLAYER: {
        BASE_SPEED: 300,
        BOUNDARY_PADDING: 50,
        SCALE: 0.3,
        MAX_HEALTH: 100,
    },
    GAME: {
        TIME_LIMIT_SECONDS: 30,
    },
    ENEMY: {
        DESPAWN_X: -1200,
        SPAWN_OFFSET: 100,
        MIN_SPAWN_INTERVAL: 0.5,
        INITIAL_SPAWN_INTERVAL: 2.0,
        SPAWN_DECREASE_RATE: 0.05,
        ESCAPE_DAMAGE: 10,
    },
} as const;
