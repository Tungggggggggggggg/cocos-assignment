// Pure data — mô tả weapon để hiển thị UI, unlock system sau này
export interface WeaponData {
    readonly id:          string;
    readonly displayName: string;
    readonly fireRateMs:  number;
    readonly bulletId:    string;   // trỏ vào BulletRegistry
    readonly bulletCount: number;   // số đạn mỗi lần bắn (spread = 3)
    readonly spreadAngle: number;   // 0 = không spread
}

export const WeaponRegistry: Record<string, WeaponData> = {
    basic: {
        id:          "basic",
        displayName: "Pistol",
        fireRateMs:  300,
        bulletId:    "basic",
        bulletCount: 1,
        spreadAngle: 0,
    },
    spread: {
        id:          "spread",
        displayName: "Shotgun",
        fireRateMs:  600,
        bulletId:    "basic",
        bulletCount: 3,
        spreadAngle: 20,
    },
} as const;