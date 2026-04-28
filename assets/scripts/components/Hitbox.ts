import {
    _decorator,
    Component,
    Collider2D,
    Contact2DType,
    IPhysics2DContact,
    PhysicsSystem2D,
} from "cc";
import { Bullet } from "./Bullet";
import { Health } from "./Health";
import { EnemyBrain } from "../controllers/EnemyBrain";
import { PlayerBrain } from "../controllers/PlayerBrain";
import { GameConfig } from "../configs/GameConfig";

const { ccclass, requireComponent } = _decorator;

@ccclass("Hitbox")
@requireComponent(Collider2D)
export class Hitbox extends Component {
    private _health: Health | null = null;
    private _collider: Collider2D | null = null;
    private _contactCount: number = 0;

    protected onLoad() {
        this._health = this.getComponent(Health);
        this._collider = this.getComponent(Collider2D);
    }

    protected onEnable() {
        this._collider?.on(
            Contact2DType.BEGIN_CONTACT,
            this._onBeginContact,
            this,
        );
    }

    protected onDisable() {
        this._collider?.off(
            Contact2DType.BEGIN_CONTACT,
            this._onBeginContact,
            this,
        );
        this._contactCount = 0;
    }

    private _onBeginContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        _contact: IPhysics2DContact | null,
    ): void {
        if (!this._health || !this._health.isAlive) return;

        const bullet = otherCollider.node.getComponent(Bullet);

        if (bullet) {
            this._health.takeDamage(bullet.damage);
            bullet.recycle();
            return;
        }

        const isSelfPlayer = this.node.getComponent(PlayerBrain) !== null;
        const isOtherEnemy =
            otherCollider.node.getComponent(EnemyBrain) !== null;

        if (isSelfPlayer && isOtherEnemy) {
            this._health.takeDamage(GameConfig.ENEMY.KAMIKAZE_DAMAGE);
            return;
        }

        const isSelfEnemy = this.node.getComponent(EnemyBrain) !== null;
        const isOtherPlayer =
            otherCollider.node.getComponent(PlayerBrain) !== null;

        if (isSelfEnemy && isOtherPlayer) {
            this._health.takeDamage(9999);
        }
    }
}
