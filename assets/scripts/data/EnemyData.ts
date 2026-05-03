export interface EnemyData {
    readonly id: string;
    readonly maxHealth: number;
    readonly speedMin: number;
    readonly speedMax: number;
    readonly scoreValue: number;
    readonly spawnWeight: number;
}

export const EnemyRegistry: readonly EnemyData[] = [
    {
        id: "normal",
        maxHealth: 100,
        speedMin: 150,
        speedMax: 250,
        scoreValue: 10,
        spawnWeight: 70,
    },
    {
        id: "fast",
        maxHealth: 50,
        speedMin: 300,
        speedMax: 450,
        scoreValue: 15,
        spawnWeight: 20,
    },
    {
        id: "tank",
        maxHealth: 300,
        speedMin: 80,
        speedMax: 120,
        scoreValue: 30,
        spawnWeight: 10,
    },
] as const;