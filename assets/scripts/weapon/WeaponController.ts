import { _decorator, Component, Node, Vec3 } from "cc";
import { IWeapon } from "./IWeapon";
import { BasicGun } from "./BasicGun";

const { ccclass, property } = _decorator;

@ccclass("WeaponController")
export class WeaponController extends Component {
    @property(Node)
    private readonly muzzleNode: Node | null = null;

    private _weapon: IWeapon = new BasicGun();
    private readonly _spawnDir = new Vec3();

    protected onEnable(): void {
        this.node.on("input:shoot", this._onShoot, this);
    }

    protected onDisable(): void {
        this.node.off("input:shoot", this._onShoot, this);
    }

    public equipWeapon(weapon: IWeapon): void {
        this._weapon = weapon;
    }

    private _onShoot(): void {
        const origin =
            this.muzzleNode?.worldPosition ?? this.node.worldPosition;
        const dirX = this.node.scale.x > 0 ? 1 : -1;
        this._spawnDir.set(dirX, 0, 0);
        this._weapon.fire(origin, this._spawnDir);
    }
}
