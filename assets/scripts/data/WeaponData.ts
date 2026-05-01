export interface WeaponData {
    readonly id: string;
    readonly displayName: string;
    readonly fireRateMs: number;
    readonly bulletId: string;
    readonly bulletCount: number;
    readonly spreadAngle: number;
}

export const WeaponRegistry: Record<string, WeaponData> = {
    basic: {
        id: "basic",
        displayName: "Pistol",
        fireRateMs: 300,
        bulletId: "basic",
        bulletCount: 1,
        spreadAngle: 0,
    },
    spread: {
        id: "spread",
        displayName: "Shotgun",
        fireRateMs: 600,
        bulletId: "basic",
        bulletCount: 3,
        spreadAngle: 20,
    },
} as const;
