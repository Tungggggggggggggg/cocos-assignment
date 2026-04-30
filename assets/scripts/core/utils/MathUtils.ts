import { math } from "cc";

export class MathUtils {
    /**
     * Weighted random pick từ array có trường weight
     * Dùng cho EnemySpawner, loot drop, v.v.
     */
    static weightedRandom<T extends { spawnWeight: number }>(
        items: readonly T[]
    ): T {
        const total = items.reduce((s, i) => s + i.spawnWeight, 0);
        let roll = Math.random() * total;
        for (const item of items) {
            roll -= item.spawnWeight;
            if (roll <= 0) return item;
        }
        return items[0];
    }

    /**
     * Rotate Vec2/Vec3 quanh trục Z một góc degrees
     * Dùng cho SpreadGun, skill xoay đạn
     */
    static rotateDir(x: number, y: number, degrees: number): [number, number] {
        const rad = (degrees * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return [x * cos - y * sin, x * sin + y * cos];
    }

    /**
     * Tính despawn X dựa trên visible size thay vì hardcode
     */
    static despawnX(marginPx = 100): number {
        const { width } = require("cc").view.getVisibleSize();
        return -(width / 2 + marginPx);
    }
}