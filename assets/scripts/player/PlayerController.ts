import { _decorator, Component, Color } from "cc";
import { PlayerInput } from "./PlayerInput";
import { PlayerMovement } from "./PlayerMovement";
import { Health } from "../shared/Health";
import { GameBus } from "../core/events/EventEmitter";
import { GameConfig } from "../data/GameConfig";
import { PlayerAnimator } from "./PlayerAnimator";
import { WeaponInventory } from "../weapon/WeaponInventory";

const { ccclass, requireComponent } = _decorator;

@ccclass("PlayerController")
@requireComponent(PlayerInput)
@requireComponent(PlayerMovement)
@requireComponent(PlayerAnimator)
@requireComponent(WeaponInventory)
@requireComponent(Health)
export class PlayerController extends Component {
    private _input: PlayerInput | null = null;
    private _animator: PlayerAnimator | null = null;
    private _inventory: WeaponInventory | null = null;
    private _health: Health | null = null;
    private _isDead = false;

    protected onLoad(): void {
        this._input = this.getComponent(PlayerInput);
        this._animator = this.getComponent(PlayerAnimator);
        this._inventory = this.getComponent(WeaponInventory);
        this._health = this.getComponent(Health);

        this._input?.setAlive(false);
    }

    protected onEnable(): void {
        this.node.on("input:move", this._onMove, this);
        this.node.on("input:shoot", this._onShoot, this);
        this.node.on("health-changed", this._onHealthChanged, this);
        this.node.on("died", this._onDied, this);

        GameBus.on("game:start", this._onGameStart, this);
        GameBus.on("game:over", this._onGameOver, this);
        GameBus.on("enemy:escaped", this._onEscaped, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    private _onGameStart(): void {
        this._isDead = false;
        this._health?.init(GameConfig.PLAYER.MAX_HEALTH);
        this._inventory?.init();

        if (!this._animator) {
            this._input?.setAlive(true);
            GameBus.emit("player:ready");
            return;
        }

        const duration = this._animator.playAnimation("portal", false);
        this._animator.addAnimation("idle", true, 0, 0);

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
        if (this._isDead) return;
        const anim = isMoving ? "run" : "idle";
        if (this._animator?.animationName !== anim) {
            this._animator?.playAnimation(anim, true);
        }
    }

    private _onShoot(): void {
        if (!this._isDead) {
            this._animator?.playAnimation("shoot", false, 1);
        }
    }

    private _onHealthChanged(current: number, max: number): void {
        GameBus.emit("player:health-changed", { current, max });
        if (current < max) {
            this._animator?.setFlash(Color.RED, 0.1);
        }
    }

    private _onDied(): void {
        if (this._isDead) return;
        this._isDead = true;
        this._input?.setAlive(false);

        const duration = this._animator?.playAnimation("death", false) ?? 0;
        this.scheduleOnce(() => GameBus.emit("game:over"), duration);
    }
}
