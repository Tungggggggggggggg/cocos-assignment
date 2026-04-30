export interface EnemyData {
    readonly id:          string;
    readonly maxHealth:   number;
    readonly speedMin:    number;
    readonly speedMax:    number;
    readonly scoreValue:  number;
    readonly damage:      number;   // damage khi chạm player
    readonly spawnWeight: number;   // tỉ lệ xuất hiện, dùng weighted random
}

// Thêm loại enemy mới → chỉ thêm object vào đây, không đụng code khác
export const EnemyRegistry: readonly EnemyData[] = [
    {
        id:          "normal",
        maxHealth:   100,
        speedMin:    150,
        speedMax:    250,
        scoreValue:  10,
        damage:      20,
        spawnWeight: 70,
    },
    {
        id:          "fast",
        maxHealth:   50,
        speedMin:    300,
        speedMax:    450,
        scoreValue:  15,
        damage:      15,
        spawnWeight: 20,
    },
    {
        id:          "tank",
        maxHealth:   300,
        speedMin:    80,
        speedMax:    120,
        scoreValue:  30,
        damage:      35,
        spawnWeight: 10,
    },
] as const;