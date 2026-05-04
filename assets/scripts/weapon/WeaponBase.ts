import { game } from "cc";
import { IWeapon } from "./IWeapon";
import { Vec3 } from "cc";

export abstract class WeaponBase implements IWeapon {
    abstract readonly weaponId: string;
    abstract readonly fireRateMs: number;

    private _lastFireTime = 0;

    fire(origin: Vec3, direction: Vec3): void {
        const now = game.totalTime;
        if (now - this._lastFireTime < this.fireRateMs) return;
        this._lastFireTime = now;
        this.doFire(origin, direction);
    }

    protected abstract doFire(origin: Vec3, direction: Vec3): void;
}
