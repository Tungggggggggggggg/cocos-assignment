export interface BulletData {
    readonly id: string;
    readonly speed: number;
    readonly damage: number;
    readonly maxDistanceMultiplier: number;
    readonly piercing: boolean;
}

export const BulletRegistry: Record<string, BulletData> = {
    basic: {
        id: "basic",
        speed: 20,
        damage: 34,
        maxDistanceMultiplier: 1.5,
        piercing: false,
    },
    pierce: {
        id: "pierce",
        speed: 600,
        damage: 20,
        maxDistanceMultiplier: 2.0,
        piercing: true,
    },
} as const;
