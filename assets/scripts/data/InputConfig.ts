import { KeyCode } from "cc";

export const InputConfig = {
    SHOOT: KeyCode.SPACE,
    WEAPON_SWAP: KeyCode.KEY_E,
    SKILL_BOMB: KeyCode.KEY_Q,
    MOVE_UP: KeyCode.KEY_W,
    MOVE_DOWN: KeyCode.KEY_S,
    MOVE_LEFT: KeyCode.KEY_A,
    MOVE_RIGHT: KeyCode.KEY_D,
} as const;
