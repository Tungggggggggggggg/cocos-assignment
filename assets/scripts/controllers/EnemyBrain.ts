import { _decorator, Component, Vec3 } from "cc";
import { Health } from "../components/Health";
import { AutoMovement } from "../components/AutoMovement";
import { EventManager } from "../managers/EventManager";
import { EventName, GameConfig } from "../configs/GameConfig";
import { HealthBar } from "../components/HealthBar";
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
    }

    onEnable() {
        this.node.on("health-changed", this.onHealthChanged, this);
        this.node.on("died", this.onDied, this);
        this.node.on("out-of-bounds", this.onOutOfBounds, this);
    }

    onDisable() {
        this.node.off("health-changed", this.onHealthChanged, this);
        this.node.off("died", this.onDied, this);
        this.node.off("out-of-bounds", this.onOutOfBounds, this);
    }

    public spawn(startPos: Vec3, speed: number) {
        this.node.setPosition(startPos);

        this._health.init(GameConfig.ENEMY.MAX_HEALTH);
        this._movement.init(speed, new Vec3(-1, 0, 0));

        if (this.healthBar)
            this.healthBar.updateHealth(
                GameConfig.ENEMY.MAX_HEALTH,
                GameConfig.ENEMY.MAX_HEALTH,
            );
    }

    private onHealthChanged(currentHp: number, maxHp: number) {
        if (this.healthBar) this.healthBar.updateHealth(currentHp, maxHp);
    }

    private onDied() {
        this._movement.stop();
        EventManager.emit(EventName.ADD_SCORE, 10);
        this.playDeathAnimation();
    }

    private playDeathAnimation() {
        EventManager.emit(EventName.RETURN_ENEMY, this.node);
    }

    private onOutOfBounds() {
        EventManager.emit(EventName.RETURN_ENEMY, this.node);
    }
}
