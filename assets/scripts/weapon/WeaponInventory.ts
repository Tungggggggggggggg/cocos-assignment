import { _decorator, Component } from "cc";
import { WeaponRegistry } from "../data/WeaponRegistry";
import { GameBus } from "../core/events/EventEmitter";
import { WeaponController } from "../weapon/WeaponController";

const { ccclass, property, requireComponent } = _decorator;

@ccclass("WeaponInventory")
@requireComponent(WeaponController)
export class WeaponInventory extends Component {
    private _weaponController: WeaponController | null = null;
    private _currentIndex = 0;

    protected onLoad(): void {
        this._weaponController = this.getComponent(WeaponController);
    }

    protected start(): void {
        if (!this._weaponController) {
            this._weaponController = this.getComponent(WeaponController);
        }
    }

    protected onEnable(): void {
        this.node.on("input:weapon-swap", this.nextWeapon, this);
    }

    protected onDisable(): void {
        this.node.off("input:weapon-swap", this.nextWeapon, this);
    }

    public init(): void {
        if (!this._weaponController) {
            this._weaponController = this.getComponent(WeaponController);
        }
        this._currentIndex = 0;
        this._equipCurrent();
    }

    public nextWeapon(): void {
        this._currentIndex = (this._currentIndex + 1) % WeaponRegistry.length;
        this._equipCurrent();
    }

    private _equipCurrent(): void {
        const factory = WeaponRegistry[this._currentIndex];
        if (!factory) return;

        const weapon = factory();

        if (!this._weaponController) {
            this._weaponController = this.getComponent(WeaponController);
        }

        this._weaponController?.equipWeapon(weapon);

        GameBus.emit("weapon:swapped", {
            index: this._currentIndex,
            id: weapon.weaponId,
        });
    }
}