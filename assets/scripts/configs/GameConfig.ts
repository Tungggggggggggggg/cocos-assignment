// export const GameConfig = {
//     PLAYER: {
//         BASE_SPEED: 300,
//         BOUNDARY_PADDING: 50,
//         SCALE: 0.3,
//         FIRE_RATE_MS: 300,
//     },
//     ENEMY: {
//         SPAWN_INTERVAL: 2,
//         SPEED_MIN: 150,
//         SPEED_MAX: 250,
//         MAX_HEALTH: 100,
//         DESPAWN_X: -1200,
//         SCORE_VALUE: 10,
//         SPAWN_OFFSET: 100,
//         KAMIKAZE_DAMAGE: 20,
//         MIN_SPAWN_INTERVAL: 0.5,
//         SPAWN_DECREASE_RATE: 0.05,
//         ESCAPE_DAMAGE: 10,
//     },
//     BULLET: {
//         SPEED: 20,
//         DAMAGE: 34,
//         MAX_DISTANCE_MULTIPLIER: 1.5,
//     },
//     GAME: {
//         TIME_LIMIT_SECONDS: 30,
//     },
// } as const;

// export const EventName = {
//     GAME_START: "game-start",
//     GAME_OVER: "game-over",
//     ADD_SCORE: "add-score",
//     ENTITY_DIED: "entity-died",
//     RETURN_BULLET: "return-bullet",
//     RETURN_ENEMY: "return-enemy",
//     TIME_TICK: "time-tick",
//     GAME_PAUSED: "game-paused",
//     GAME_RESUMED: "game-resumed",
//     ENEMY_ESCAPED: "enemy-escaped",
//     PLAYER_HEALTH_CHANGED: "player-health-changed",
//     PLAYER_READY: "player-ready",
//     CHANGE_BGM_VOLUME: "change-bgm-volume",
//     CHANGE_SFX_VOLUME: "change-sfx-volume",
//     MUTE_BGM: "mute-bgm",
//     MUTE_SFX: "mute-sfx",
//     PLAY_SFX: "play-sfx",
// } as const;

// export type EventNameType = (typeof EventName)[keyof typeof EventName];
