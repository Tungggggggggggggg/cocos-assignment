import { _decorator, Component, Vec3 } from "cc";
import { GameConfig } from "../configs/GameConfig";
const { ccclass } = _decorator;

@ccclass("AutoMovement")
export class AutoMovement extends Component {
    private _speed: number = 0;
    private _direction: Vec3 = new Vec3(-1, 0, 0);
    private _isMoving: boolean = false;

    public init(speed: number, dir: Vec3) {
        this._speed = speed;
        this._direction = dir.normalize();
        this._isMoving = true;
    }

    public stop() {
        this._isMoving = false;
    }

    update(dt: number) {
        if (!this._isMoving) return;

        const currentPos = this.node.position;
        const moveStep = new Vec3();
        Vec3.multiplyScalar(moveStep, this._direction, this._speed * dt);

        const nextPos = new Vec3();
        Vec3.add(nextPos, currentPos, moveStep);
        this.node.setPosition(nextPos);

        if (nextPos.x < GameConfig.ENEMY.DESPAWN_X) {
            this._isMoving = false;
            this.node.emit("out-of-bounds");
        }
    }
}
