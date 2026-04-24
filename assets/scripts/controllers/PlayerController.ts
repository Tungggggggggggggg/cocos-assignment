import {
    _decorator,
    Component,
    Node,
    input,
    Input,
    EventKeyboard,
    KeyCode,
    Vec2,
    Vec3,
    sp,
    math,
    view,
} from "cc";
import { GameConfig } from "../configs/GameConfig";
import { BulletManager } from "../managers/BulletManager";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
    @property(sp.Skeleton)
    private spineAnim: sp.Skeleton = null;

    @property(Node)
    private muzzleNode: Node = null;

    private _moveDir: Vec2 = new Vec2(0, 0);
    private _isMoving: boolean = false;
    private _isAlive: boolean = true;
    private _minBound: Vec3 = new Vec3();
    private _maxBound: Vec3 = new Vec3();

    start() {
        this.calculateBoundaries();
    }

    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private calculateBoundaries() {
        const visibleSize = view.getVisibleSize();
        const halfWidth = visibleSize.width / 2;
        const halfHeight = visibleSize.height / 2;
        const pad = GameConfig.PLAYER.BOUNDARY_PADDING;

        this._minBound.set(-halfWidth + pad, -halfHeight + pad, 0);
        this._maxBound.set(halfWidth - pad, halfHeight - pad, 0);
    }

    private onKeyDown(event: EventKeyboard) {
        if (!this._isAlive) return;

        this.updateDirection(event.keyCode, 1);
        if (event.keyCode === KeyCode.SPACE) {
            this.shoot();
        }
    }

    private onKeyUp(event: EventKeyboard) {
        if (!this._isAlive) return;
        this.updateDirection(event.keyCode, 0);
    }

    private updateDirection(keyCode: KeyCode, scale: number) {
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
        this.updateAnimation();
    }

    private updateAnimation() {
        if (!this.spineAnim) return;

        const animName = this._isMoving ? "run" : "idle";
        if (this.spineAnim.animation !== animName) {
            this.spineAnim.setAnimation(0, animName, true);
        }
    }

    private shoot() {
        const muzzlePos = this.muzzleNode
            ? this.muzzleNode.worldPosition
            : this.node.worldPosition;
        const dirX = this.node.scale.x > 0 ? 1 : -1;

        if (BulletManager.instance) {
            BulletManager.instance.spawnBullet(muzzlePos, new Vec3(dirX, 0, 0));
        }

        if (this.spineAnim) {
            this.spineAnim.setAnimation(1, "shoot", false);
        }
    }

    update(dt: number) {
        if (!this._isMoving || !this._isAlive) return;

        const currentPos = this.node.position;
        const moveDist = GameConfig.PLAYER.BASE_SPEED * dt;

        let newX = currentPos.x + this._moveDir.x * moveDist;
        let newY = currentPos.y + this._moveDir.y * moveDist;

        newX = math.clamp(newX, this._minBound.x, this._maxBound.x);
        newY = math.clamp(newY, this._minBound.y, this._maxBound.y);

        this.node.setPosition(new Vec3(newX, newY, 0));

        if (this._moveDir.x !== 0) {
            const scaleX =
                this._moveDir.x > 0
                    ? GameConfig.PLAYER.SCALE
                    : -GameConfig.PLAYER.SCALE;
            this.node.setScale(new Vec3(scaleX, GameConfig.PLAYER.SCALE, 1));
        }
    }
}
