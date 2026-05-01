import { Vec3 } from "cc";

export interface IWeapon {
    readonly weaponId: string;
    readonly fireRateMs: number;
    fire(origin: Vec3, direction: Vec3): void;
}
