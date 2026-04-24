import {
    _decorator,
    Component,
    Collider2D,
    Contact2DType,
} from "cc";
import { Bullet } from "./Bullet";
import { Health } from "./Health";
const { ccclass, requireComponent } = _decorator;

@ccclass("Hitbox")
@requireComponent(Collider2D)
export class Hitbox extends Component {
    private _health: Health | null = null;
    private _collider: Collider2D | null = null;

    onLoad() {
        this._health = this.getComponent(Health);
        this._collider = this.getComponent(Collider2D);
    }

    onEnable() {
        if (this._collider) {
            this._collider.on(
                Contact2DType.BEGIN_CONTACT,
                this.onBeginContact,
                this,
            );
        }
    }

    onDisable() {
        if (this._collider) {
            this._collider.off(
                Contact2DType.BEGIN_CONTACT,
                this.onBeginContact,
                this,
            );
        }
    }

    private onBeginContact(other: Collider2D) {
        const bullet = other.node.getComponent(Bullet);

        if (bullet && this._health) {
            this._health.takeDamage(bullet.damage);
            bullet.recycle();
        }
    }
}
