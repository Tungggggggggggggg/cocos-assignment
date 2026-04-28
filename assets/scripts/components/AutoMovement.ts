import { _decorator, Component, Vec3 } from "cc";
import { GameConfig } from "../configs/GameConfig";
const { ccclass } = _decorator;

@ccclass("AutoMovement")
export class AutoMovement extends Component {
    private _speed: number = 0;
    private _direction: Vec3 = new Vec3(-1, 0, 0);
    private _isMoving: boolean = false;

    private readonly _tempMoveStep: Vec3 = new Vec3();
    private readonly _tempNextPos: Vec3 = new Vec3();

    public init(speed: number, dir: Vec3) {
        this._speed = speed;
        this._direction = dir.normalize();
        this._isMoving = true;
    }

    public stop() {
        this._isMoving = false;
    }

    protected update(dt: number) {
        if (!this._isMoving) return;

        const currentPos = this.node.position;
        Vec3.multiplyScalar(
            this._tempMoveStep,
            this._direction,
            this._speed * dt,
        );
        Vec3.add(this._tempNextPos, currentPos, this._tempMoveStep);

        this.node.setPosition(this._tempNextPos);

        if (this._tempNextPos.x < GameConfig.ENEMY.DESPAWN_X) {
            this._isMoving = false;
            this.node.emit("out-of-bounds");
        }
    }
}
