import { _decorator, Component, Vec3 } from "cc";
const { ccclass } = _decorator;

@ccclass("Movement")
export class Movement extends Component {
    private _speed = 0;
    private _direction = new Vec3(-1, 0, 0);
    private _active = false;

    private readonly _step = new Vec3();
    private readonly _nextPos = new Vec3();

    init(speed: number, direction: Vec3): void {
        this._speed = speed;
        this._active = true;
        Vec3.normalize(this._direction, direction);
    }

    stop(): void {
        this._active = false;
    }

    resume(): void {
        this._active = true;
    }

    get currentDirection(): Readonly<Vec3> {
        return this._direction;
    }

    protected update(dt: number): void {
        if (!this._active) return;

        Vec3.multiplyScalar(this._step, this._direction, this._speed * dt);
        Vec3.add(this._nextPos, this.node.position, this._step);
        this.node.setPosition(this._nextPos);
    }
}
