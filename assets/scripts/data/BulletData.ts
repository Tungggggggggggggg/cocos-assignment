export interface BulletData {
    readonly id:                    string;
    readonly speed:                 number;
    readonly damage:                number;
    readonly maxDistanceMultiplier: number;
    readonly piercing:              boolean; // xuyên enemy không
}

export const BulletRegistry: Record<string, BulletData> = {
    basic: {
        id:                    "basic",
        speed:                 800,    // fix: đơn vị px/s cho RigidBody2D
        damage:                34,
        maxDistanceMultiplier: 1.5,
        piercing:              false,
    },
    pierce: {
        id:                    "pierce",
        speed:                 600,
        damage:                20,
        maxDistanceMultiplier: 2.0,
        piercing:              true,
    },
} as const;