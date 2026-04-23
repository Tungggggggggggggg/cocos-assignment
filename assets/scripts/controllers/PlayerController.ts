import {
    _decorator,
    Component,
    Node,
    input,
    Input,
    EventKeyboard,
    KeyCode,
    Vec3,
    Vec2,
    sp,
    math,
    view,
} from "cc";
import { BulletManager } from "../managers/BulletManager";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
    @property(Number)
    public speed: number = 300;

    @property(sp.Skeleton)
    private spineAnim: sp.Skeleton = null;

    @property(Node)
    private muzzleNode: Node = null;

    private _moveDir: Vec2 = new Vec2(0, 0);
    private _isMoving: boolean = false;
    private _minBound: Vec3 = new Vec3();
    private _maxBound: Vec3 = new Vec3();

    start() {
        this._calculaterBoundaries();
    }

    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private onKeyDown(event: EventKeyboard) {
        this._updateDirection(event.keyCode, 1);

        if (event.keyCode === KeyCode.SPACE) {
            this.shoot();
        }
    }

    private onKeyUp(event: EventKeyboard) {
        this._updateDirection(event.keyCode, 0);
    }

    private _updateDirection(keyCode: KeyCode, scale: number) {
        switch (keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this._moveDir.y = scale;
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this._moveDir.y = -scale;
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this._moveDir.x = scale;
                break;
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this._moveDir.x = -scale;
                break;
        }

        this._isMoving = this._moveDir.x !== 0 || this._moveDir.y !== 0;
        this._updateAnimation();
    }

    private _updateAnimation() {
        if (!this.spineAnim) return;

        const animName = this._isMoving ? "run" : "idle";
        if (this.spineAnim.animation !== animName) {
            this.spineAnim.setAnimation(0, animName, true);
        }
    }

    private _calculaterBoundaries() {
        const visibleSize = view.getVisibleSize();
        const halfWidth = visibleSize.width / 2;
        const halfHeight = visibleSize.height / 2;
        const padding = 50;
        this._minBound.set(-halfWidth + padding, -halfHeight + padding, 0);
        this._maxBound.set(halfWidth - padding, halfHeight - padding, 0);
    }

    private shoot() {
        const muzzlePos = this.muzzleNode
            ? this.muzzleNode.worldPosition
            : this.node.worldPosition;

        const dirX = this.node.scale.x > 0 ? 1 : -1;
        const shootDir = new Vec3(dirX, 0, 0);
        BulletManager.instance.spawnBullet(muzzlePos, shootDir);
        this._playShootAnimation();
    }

    private _playShootAnimation() {
        this.spineAnim.setAnimation(1, "shoot", false);
    }
    update(dt: number) {
        if (!this._isMoving) return;

        const currentPos = this.node.position;
        let newX = currentPos.x + this._moveDir.x * this.speed * dt;
        let newY = currentPos.y + this._moveDir.y * this.speed * dt;

        newX = math.clamp(newX, this._minBound.x, this._maxBound.x);
        newY = math.clamp(newY, this._minBound.y, this._maxBound.y);

        this.node.setPosition(new Vec3(newX, newY, 0));
        if (this._moveDir.x !== 0) {
            this.node.setScale(
                new Vec3(this._moveDir.x > 0 ? 0.3 : -0.3, 0.3, 1),
            );
        }
    }
}
