import { IWeapon } from "../weapon/IWeapon";
import { BasicGun } from "../weapon/BasicGun";
import { SpreadGun } from "../weapon/SpreadGun";
import { PierceGun } from "../weapon/PierceGun";

export const WeaponRegistry: Array<() => IWeapon> = [
    () => new BasicGun(),
    () => new SpreadGun(),
    () => new PierceGun(),
];
