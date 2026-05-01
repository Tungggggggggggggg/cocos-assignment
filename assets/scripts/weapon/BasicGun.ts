import { Vec3 } from "cc";
import { WeaponBase } from "./WeaponBase";
import { BulletManager } from "../bullet/BulletManager";

export class BasicGun extends WeaponBase {
    readonly weaponId = "basic";
    readonly fireRateMs = 300;

    protected doFire(origin: Vec3, direction: Vec3): void {
        BulletManager.instance?.spawn("basic", origin, direction);
    }
}
