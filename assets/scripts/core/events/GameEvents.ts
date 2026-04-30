// Định nghĩa tất cả event và payload tương ứng
// Ai muốn thêm event mới → chỉ cần thêm vào đây, compiler tự bắt lỗi ở nơi dùng

import { Vec3 } from "cc";

export interface GameEventMap {
    // Game flow
    "game:start":           void;
    "game:over":            void;
    "game:paused":          void;
    "game:resumed":         void;

    // Player
    "player:ready":         void;
    "player:died":          void;
    "player:health-changed": { current: number; max: number };

    // Enemy
    "enemy:escaped":        void;
    "enemy:died":           { scoreValue: number; position: Vec3 };

    // Bullet
    "bullet:return":        import("cc").Node;
    "enemy:return":         import("cc").Node;

    // Score
    "score:add":            { points: number };

    // Timer
    "timer:tick":           { secondsLeft: number };

    // Sound
    "sound:bgm-volume":     { volume: number };
    "sound:sfx-volume":     { volume: number };
    "sound:bgm-mute":       { muted: boolean };
    "sound:sfx-mute":       { muted: boolean };
    "sound:play-sfx":       void;
    "sound:play-coin":      void;
}

export type GameEventKey = keyof GameEventMap;