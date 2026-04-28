import { _decorator, Component, sp, Vec2, Color } from "cc";
import { PlayerInput } from "../components/PlayerInput";
import { EventManager } from "../managers/EventManager";
import { EventName, GameConfig } from "../configs/GameConfig";
import { Health } from "../components/Health";
const { ccclass, property, requireComponent } = _decorator;
@ccclass("PlayerBrain")
@requireComponent(PlayerInput)
@requireComponent(Health)
export class PlayerBrain extends Component {
    @property(sp.Skeleton)
    private readonly spineAnim: sp.Skeleton | null = null;

    private _input: PlayerInput = null;
    private _health: Health | null = null;
    private _isDead: boolean = false;

    protected onLoad() {
        this._input = this.getComponent(PlayerInput);
        this._health = this.getComponent(Health);
        if (!this._input) {
            throw new Error("[PlayerBrain] Missing PlayerInput component!");
        }
        this._input.setAlive(false);
    }

    protected onEnable() {
        this.node.on("input-move", this.onMoveStatus, this);
        this.node.on("input-shoot", this.onShootStatus, this);
        this.node.on("died", this.onDied, this);
        this.node.on("health-changed", this.onHealthChanged, this);

        EventManager.on(EventName.GAME_START, this.onGameStart, this);
        EventManager.on(EventName.GAME_OVER, this.onGameOver, this);
        EventManager.on(EventName.ENEMY_ESCAPED, this.onEnemyEscaped, this);
    }

    protected onDisable() {
        this.node.off("input-move", this.onMoveStatus, this);
        this.node.off("input-shoot", this.onShootStatus, this);
        this.node.off("died", this.onDied, this);
        this.node.off("health-changed", this.onHealthChanged, this);

        EventManager.off(EventName.GAME_START, this.onGameStart, this);
        EventManager.off(EventName.GAME_OVER, this.onGameOver, this);
        EventManager.off(EventName.ENEMY_ESCAPED, this.onEnemyEscaped, this);
    }

    private onGameStart() {
        this._isDead = false;
        this._input.setAlive(false);
        this._health?.init(100);

        if (this.spineAnim) {
            const track = this.spineAnim.setAnimation(0, "portal", false);
            this.spineAnim.addAnimation(0, "idle", true, 0);
            
            const duration = track ? track.animation.duration : 1.0;
            this.scheduleOnce(() => {
                this._input.setAlive(true);
                EventManager.emit(EventName.PLAYER_READY);
            }, duration);
        } else {
            this._input.setAlive(true);
            EventManager.emit(EventName.PLAYER_READY);
        }
    }

    private onGameOver() {
        this._input.setAlive(false);
    }

    private onDied() {
        if (this._isDead) return;
        this._isDead = true;
        this._input.setAlive(false);

        if (this.spineAnim) {
            const track = this.spineAnim.setAnimation(0, "death", false);
            const duration = track ? track.animation.duration : 1.0;
            this.scheduleOnce(() => {
                EventManager.emit(EventName.GAME_OVER);
            }, duration);
        } else {
            EventManager.emit(EventName.GAME_OVER);
        }
    }

    private onEnemyEscaped() {
        this._health?.takeDamage(GameConfig.ENEMY.ESCAPE_DAMAGE);
    }

    private onMoveStatus(dir: Vec2) {
        if (!this.spineAnim || this._isDead) return;
        const isMoving = dir.x !== 0 || dir.y !== 0;
        const animName = isMoving ? "run" : "idle";

        if (this.spineAnim.animation !== animName) {
            if (this.spineAnim.animation === "portal" && !isMoving) {
                return;
            }
            this.spineAnim.setAnimation(0, animName, true);
        }
    }

    private onShootStatus() {
        if (this.spineAnim && !this._isDead) {
            this.spineAnim.setAnimation(1, "shoot", false);
        }
    }

    private onHealthChanged(currentHp: number, maxHp: number) {
        EventManager.emit(EventName.PLAYER_HEALTH_CHANGED, currentHp, maxHp);
        
        if (currentHp >= maxHp) return;

        if (this.spineAnim) {
            this.spineAnim.color = Color.RED;

            this.scheduleOnce(() => {
                if (this.spineAnim?.isValid) {
                    this.spineAnim.color = Color.WHITE;
                }
            }, 0.1);
        }
    }
}
