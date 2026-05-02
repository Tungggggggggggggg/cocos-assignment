import { Vec3 } from "cc";
import { WeaponBase } from "./WeaponBase";
import { BulletManager } from "../bullet/BulletManager";

export class PierceGun extends WeaponBase {
    readonly weaponId = "pierce";
    readonly fireRateMs = 500;

    protected doFire(origin: Vec3, direction: Vec3): void {
        BulletManager.instance?.spawn("pierce", origin, direction);
    }
}