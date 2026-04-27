export const GameConfig = {
    PLAYER: {
        BASE_SPEED: 300,
        BOUNDARY_PADDING: 50,
        SCALE: 0.3,
        FIRE_RATE_MS: 300,
    },
    ENEMY: {
        SPAWN_INTERVAL: 2,
        SPEED_MIN: 150,
        SPEED_MAX: 250,
        MAX_HEALTH: 100,
        DESPAWN_X: -1200,
        SCORE_VALUE: 10,
        SPAWN_OFFSET: 100,
    },
    BULLET: {
        SPEED: 20,
        DAMAGE: 34,
        MAX_DISTANCE_MULTIPLIER: 1.5,
    },
} as const;

export const EventName = {
    GAME_START:     "game-start",
    GAME_OVER:      "game-over",
    ADD_SCORE:      "add-score",
    ENTITY_DIED:    "entity-died",
    RETURN_BULLET:  "return-bullet",
    RETURN_ENEMY:   "return-enemy",
} as const;

export type EventNameType = typeof EventName[keyof typeof EventName];