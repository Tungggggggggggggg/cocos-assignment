import { _decorator, Component, Vec3, view } from "cc";
import { GameConfig, EventName } from "../configs/GameConfig";
import { EventManager } from "../managers/EventManager";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
    @property(Number)
    private baseDamage: number = GameConfig.BULLET.DAMAGE;

    private _direction: Vec3 = new Vec3(1, 0, 0);
    private _isMoving: boolean = false;
    private _maxDistance: number = 0;

    public get damage(): number {
        return this.baseDamage;
    }

    public init(startPos: Vec3, dir: Vec3) {
        this.node.setPosition(startPos);
        this._direction = dir.normalize();
        this._isMoving = true;

        const visibleSize = view.getVisibleSize();
        this._maxDistance =
            Math.max(visibleSize.width, visibleSize.height) + 200;
    }

    update(dt: number) {
        if (!this._isMoving) return;

        const currentPos = this.node.position;
        const moveStep = new Vec3();
        Vec3.multiplyScalar(
            moveStep,
            this._direction,
            GameConfig.BULLET.SPEED * dt,
        );

        const nextPos = new Vec3();
        Vec3.add(nextPos, currentPos, moveStep);
        this.node.setPosition(nextPos);

        if (
            Math.abs(nextPos.x) > this._maxDistance ||
            Math.abs(nextPos.y) > this._maxDistance
        ) {
            this.recycle();
        }
    }

    public recycle() {
        this._isMoving = false;
        EventManager.emit(EventName.RETURN_BULLET, this.node);
    }
}
