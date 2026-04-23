import { _decorator, Component, Vec3, view } from "cc";
import { BulletManager } from "../managers/BulletManager";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
    @property(Number)
    public damage: number = 20;

    private _speed: number = 800;
    private _direction: Vec3 = new Vec3(1, 0, 0);
    private _isMoving: boolean = false;
    private _maxDistance: number = 0;

    public init(startPos: Vec3, dir: Vec3, speed: number) {
        this.node.setPosition(startPos);
        this._direction = dir.normalize();
        this._speed = speed;
        this._isMoving = true;

        const screenSize = view.getVisibleSize();
        this._maxDistance =
            Math.max(screenSize.width, screenSize.height) / 2 + 500;
        this.unscheduleAllCallbacks();
    }

    update(dt: number) {
        if (!this._isMoving) return;

        const currentPos = this.node.position;
        const offset = new Vec3();
        Vec3.multiplyScalar(offset, this._direction, this._speed * dt);

        const nextPos = new Vec3();
        Vec3.add(nextPos, currentPos, offset);

        this.node.setPosition(nextPos);

        if (
            Math.abs(nextPos.x) > this._maxDistance ||
            Math.abs(nextPos.y) > this._maxDistance
        ) {
            this.recycle();
        }
    }

    private recycle() {
        this._isMoving = false;
        BulletManager.instance.returnBullet(this.node);
    }
}
