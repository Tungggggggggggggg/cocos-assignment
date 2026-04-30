import { math, view } from "cc";

export class MathUtils {
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

    static rotateDir(x: number, y: number, degrees: number): [number, number] {
        const rad = (degrees * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return [x * cos - y * sin, x * sin + y * cos];
    }

    static despawnX(marginPx = 100): number {
        const { width } = view.getVisibleSize();
        return -(width / 2 + marginPx);
    }
}