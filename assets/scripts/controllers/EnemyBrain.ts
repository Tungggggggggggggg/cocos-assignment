import { _decorator, Component, Vec3 } from "cc";
import { Health } from "../components/Health";
import { AutoMovement } from "../components/AutoMovement";
import { HealthBar } from "../components/HealthBar";
import { EventManager } from "../managers/EventManager";
import { EventName, GameConfig } from "../configs/GameConfig";

const { ccclass, property, requireComponent } = _decorator;

@ccclass("EnemyBrain")
@requireComponent(Health)
@requireComponent(AutoMovement)
export class EnemyBrain extends Component {
    @property(HealthBar)
    private healthBar: HealthBar = null;

    private _health: Health = null;
    private _movement: AutoMovement = null;

    onLoad() {
        this._health = this.getComponent(Health);
        this._movement = this.getComponent(AutoMovement);

        if (!this._health || !this._movement) {
            console.error("[EnemyBrain] Prefab thiếu component Health hoặc AutoMovement!");
        }
    }

    onEnable() {
        this.node.on("health-changed", this._onHealthChanged, this);
        this.node.on("died", this._onDied, this);
        this.node.on("out-of-bounds", this._onOutOfBounds, this);
    }

    onDisable() {
        this.node.off("health-changed", this._onHealthChanged, this);
        this.node.off("died", this._onDied, this);
        this.node.off("out-of-bounds", this._onOutOfBounds, this);
    }

    public spawn(startPos: Vec3, speed: number): void {
        this.node.setPosition(startPos);
        this._health.init(GameConfig.ENEMY.MAX_HEALTH);
        this._movement.init(speed, new Vec3(-1, 0, 0));
        this.healthBar?.updateHealth(GameConfig.ENEMY.MAX_HEALTH, GameConfig.ENEMY.MAX_HEALTH);
    }

    private _onHealthChanged(currentHp: number, maxHp: number): void {
        this.healthBar?.updateHealth(currentHp, maxHp);
    }

    private _onDied(): void {
        this._movement.stop();
        EventManager.emit(EventName.ADD_SCORE, 10);
        EventManager.emit(EventName.RETURN_ENEMY, this.node);
    }

    private _onOutOfBounds(): void {
        EventManager.emit(EventName.RETURN_ENEMY, this.node);
    }
}