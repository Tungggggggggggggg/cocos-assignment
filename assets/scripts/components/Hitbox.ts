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

const { ccclass, requireComponent } = _decorator;

@ccclass("Hitbox")
@requireComponent(Collider2D)
export class Hitbox extends Component {
    private _health: Health | null = null;
    private _collider: Collider2D | null = null;

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
    }
}
