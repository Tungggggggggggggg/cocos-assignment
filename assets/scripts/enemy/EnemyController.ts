import {
    _decorator,
    Component,
    Vec3,
    Sprite,
    Color,
    Collider2D,
    Contact2DType,
    IPhysics2DContact,
    math,
} from "cc";
import { Health } from "../shared/Health";
import { HealthBarView } from "../ui/hud/HealthBarView";
import { GameBus } from "../core/events/EventEmitter";
import { GameConfig } from "../data/GameConfig";
import { EnemyData } from "../data/EnemyData";
import { Bullet } from "../bullet/Bullet";

const { ccclass, property, requireComponent } = _decorator;

const LEFT_DIR = new Vec3(-1, 0, 0);

@ccclass("EnemyController")
@requireComponent(Health)
export class EnemyController extends Component {
    @property(HealthBarView)
    private readonly healthBarView: HealthBarView | null = null;

    private _data: EnemyData | null = null;
    private _health: Health | null = null;
    private _collider: Collider2D | null = null;
    private _sprite: Sprite | null = null;

    private _speed = 0;
    private _isActive = false;

    private readonly _moveStep = new Vec3();
    private readonly _nextPos = new Vec3();

    protected onLoad(): void {
        this._health = this.getComponent(Health);
        this._collider = this.getComponent(Collider2D);
        this._sprite = this.getComponent(Sprite);
    }

    protected onEnable(): void {
        this.node.on("health-changed", this._onHealthChanged, this);
        this.node.on("died", this._onDied, this);
        this._collider?.on(Contact2DType.BEGIN_CONTACT, this._onContact, this);
    }

    protected onDisable(): void {
        this.node.off("health-changed", this._onHealthChanged, this);
        this.node.off("died", this._onDied, this);
        this._collider?.off(Contact2DType.BEGIN_CONTACT, this._onContact, this);
    }

    protected update(dt: number): void {
        if (!this._isActive) return;

        Vec3.multiplyScalar(this._moveStep, LEFT_DIR, this._speed * dt);
        Vec3.add(this._nextPos, this.node.position, this._moveStep);
        this.node.setPosition(this._nextPos);

        if (this._nextPos.x < GameConfig.ENEMY.DESPAWN_X) {
            this._isActive = false;
            this._onEscaped();
        }
    }

    public spawn(data: EnemyData, startPos: Vec3): void {
        this._data = data;
        this._speed = math.randomRange(data.speedMin, data.speedMax);
        this._isActive = true;

        this.node.setPosition(startPos);
        this._health?.init(data.maxHealth);
        this.healthBarView?.refresh(data.maxHealth, data.maxHealth);

        if (this._sprite) this._sprite.color = Color.WHITE;
    }

    private _onHealthChanged(current: number, max: number): void {
        this.healthBarView?.refresh(current, max);
        if (current < max) this._flashDamage();
    }

    private _onDied(): void {
        this._isActive = false;
        const scoreValue = this._data?.scoreValue ?? 0;

        GameBus.emit("enemy:died", {
            scoreValue,
            position: this.node.worldPosition,
        });
        GameBus.emit("score:add", { points: scoreValue });
        GameBus.emit("sound:play-coin");
        GameBus.emit("enemy:return", this.node);
    }

    private _onEscaped(): void {
        GameBus.emit("enemy:escaped");
        GameBus.emit("enemy:return", this.node);
    }

    private _onContact(_self: Collider2D, other: Collider2D): void {
        if (!this._health?.isAlive) return;

        const bullet = other.node.getComponent(Bullet);
        if (bullet) {
            this._health.takeDamage(bullet.damage);
            if (!bullet.isPiercing) bullet.recycle();
        }
    }

    private _flashDamage(): void {
        if (!this._sprite?.isValid) return;
        this._sprite.color = Color.RED;
        this.scheduleOnce(() => {
            if (this._sprite?.isValid) this._sprite.color = Color.WHITE;
        }, 0.1);
    }

    onBorrow(): void {
        this.node.active = true;
    }
    onReturn(): void {
        this.node.active = false;
    }
}
