import { Vec3, Node } from "cc";

export interface GameEventMap {
    "game:start": void;
    "game:over": void;
    "game:won": void;
    "game:paused": void;
    "game:resumed": void;

    "player:ready": void;
    "player:died": void;
    "player:health-changed": { current: number; max: number };

    "enemy:escaped": void;
    "enemy:died": { scoreValue: number; position: Vec3 };

    "bullet:return": Node;
    "enemy:return": Node;

    "score:add": { points: number };

    "timer:tick": { secondsLeft: number };

    "sound:bgm-volume": { volume: number };
    "sound:sfx-volume": { volume: number };
    "sound:bgm-mute": { muted: boolean };
    "sound:sfx-mute": { muted: boolean };
    "sound:play-sfx": void;
    "sound:play-coin": void;

    "skill:cooldown-update": {
        skillId: string;
        ratio: number;
        cooldownMs: number;
    };
    "enemy:damage-taken": { amount: number; worldPosition: Vec3 };
    "weapon:swapped": { index: number; id: string };
}

export type GameEventKey = keyof GameEventMap;
