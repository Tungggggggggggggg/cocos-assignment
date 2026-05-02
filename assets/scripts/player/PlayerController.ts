import { _decorator, Component, sp, Color } from "cc";
import { PlayerInput } from "./PlayerInput";
import { PlayerMovement } from "./PlayerMovement";
import { WeaponController } from "../weapon/WeaponController";
import { Health } from "../shared/Health";
import { GameBus } from "../core/events/EventEmitter";
import { GameConfig } from "../data/GameConfig";
import { SpreadGun } from "../weapon/SpreadGun";
import { BasicGun } from "../weapon/BasicGun";
import { PierceGun } from "../weapon/PierceGun";
import { IWeapon } from "../weapon/IWeapon";

const { ccclass, property, requireComponent } = _decorator;

@ccclass("PlayerController")
@requireComponent(PlayerInput)
@requireComponent(PlayerMovement)
@requireComponent(Health)
export class PlayerController extends Component {
    @property(sp.Skeleton)
    private readonly spine: sp.Skeleton | null = null;

    private _input: PlayerInput | null = null;
    private _movement: PlayerMovement | null = null;
    private _weapon: WeaponController | null = null;
    private _health: Health | null = null;
    private _isDead = false;

    private _weaponIndex = 0;
    private readonly _weaponFactory: Array<() => IWeapon> = [
        () => new BasicGun(),
        () => new SpreadGun(),
        () => new PierceGun(),
    ];

    protected onLoad(): void {
        this._input = this.getComponent(PlayerInput);
        this._movement = this.getComponent(PlayerMovement);
        this._weapon = this.getComponent(WeaponController);
        this._health = this.getComponent(Health);
        this._input?.setAlive(false);
    }

    protected onEnable(): void {
        this.node.on("input:move", this._onMove, this);
        this.node.on("input:shoot", this._onShoot, this);
        this.node.on("health-changed", this._onHealthChanged, this);
        this.node.on("died", this._onDied, this);
        this.node.on("input:weapon-swap", this._onWeaponSwap, this);

        GameBus.on("game:start", this._onGameStart, this);
        GameBus.on("game:over", this._onGameOver, this);
        GameBus.on("enemy:escaped", this._onEscaped, this);
    }

    protected onDisable(): void {
        this.node.off("input:move", this._onMove, this);
        this.node.off("input:shoot", this._onShoot, this);
        this.node.off("health-changed", this._onHealthChanged, this);
        this.node.off("died", this._onDied, this);
        this.node.off("input:weapon-swap", this._onWeaponSwap, this);
        GameBus.offAll(this);
    }

    private _onGameStart(): void {
        this._isDead = false;
        this._weaponIndex = 0;
        this._health?.init(GameConfig.PLAYER.MAX_HEALTH);
        this._weapon?.equipWeapon(this._weaponFactory[0]());

        if (!this.spine) {
            this._input?.setAlive(true);
            GameBus.emit("player:ready");
            return;
        }

        const track = this.spine.setAnimation(0, "portal", false);
        this.spine.addAnimation(0, "idle", true, 0);
        const duration = track?.animation.duration ?? 1.0;

        this.scheduleOnce(() => {
            this._input?.setAlive(true);
            GameBus.emit("player:ready");
        }, duration);
    }

    private _onGameOver(): void {
        this._input?.setAlive(false);
    }

    private _onEscaped(): void {
        this._health?.takeDamage(GameConfig.ENEMY.ESCAPE_DAMAGE);
    }

    private _onMove(isMoving: boolean): void {
        if (!this.spine || this._isDead) return;
        const anim = isMoving ? "run" : "idle";
        if (this.spine.animation !== anim) {
            this.spine.setAnimation(0, anim, true);
        }
    }

    private _onShoot(): void {
        if (this.spine && !this._isDead) {
            this.spine.setAnimation(1, "shoot", false);
        }
    }

    private _onHealthChanged(current: number, max: number): void {
        GameBus.emit("player:health-changed", { current, max });
        if (current >= max || !this.spine) return;

        this.spine.color = Color.RED;
        this.scheduleOnce(() => {
            if (this.spine?.isValid) this.spine.color = Color.WHITE;
        }, 0.1);
    }

    private _onDied(): void {
        if (this._isDead) return;
        this._isDead = true;
        this._input?.setAlive(false);

        if (!this.spine) {
            GameBus.emit("game:over");
            return;
        }

        const track = this.spine.setAnimation(0, "death", false);
        const duration = track?.animation.duration ?? 1.0;
        this.scheduleOnce(() => GameBus.emit("game:over"), duration);
    }

    private _onWeaponSwap(): void {
        if (!this._weapon || this._isDead) return;

        this._weaponIndex =
            (this._weaponIndex + 1) % this._weaponFactory.length;
        const next = this._weaponFactory[this._weaponIndex]();
        this._weapon.equipWeapon(next);

        GameBus.emit("weapon:swapped", {
            index: this._weaponIndex,
            id: next.weaponId,
        });
    }
}
