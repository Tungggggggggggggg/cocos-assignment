import { Vec3 } from "cc";
import { WeaponBase } from "./WeaponBase";
import { BulletManager } from "../bullet/BulletManager";
import { MathUtils } from "../core/utils/MathUtils";

export class SpreadGun extends WeaponBase {
    readonly weaponId = "spread";
    readonly fireRateMs = 600;

    private readonly ANGLES = [-20, 0, 20];

    protected doFire(origin: Vec3, dir: Vec3): void {
        for (const angle of this.ANGLES) {
            const [rx, ry] = MathUtils.rotateDir(dir.x, dir.y, angle);
            const rotated = new Vec3(rx, ry, 0);
            BulletManager.instance?.spawn("basic", origin, rotated);
        }
    }
}
