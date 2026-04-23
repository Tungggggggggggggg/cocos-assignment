import { _decorator, Component, Node, Vec3 } from "cc";
import { EnemyManager } from "../managers/EnemyManager";
const { ccclass, property } = _decorator;

@ccclass("Enemy")
export class Enemy extends Component {
    private _speed: number = 200;
    private _isAlive: boolean = false;
    private _direction: Vec3 = new Vec3(-1, 0, 0);

    public init(startPos: Vec3, speed: number) {
        this.node.setPosition(startPos);
        this._speed = speed;
        this._isAlive = true;
    }

    update(dt: number) {
        if (!this._isAlive) return;

        const currentPos = this.node.position;
        const moveStep = new Vec3();
        Vec3.multiplyScalar(moveStep, this._direction, this._speed * dt);

        const nextPos = new Vec3();
        Vec3.add(nextPos, currentPos, moveStep);

        if (nextPos.x < -1200) {
            this.die();
        }
    }
    public die() {
        this._isAlive = false;
        EnemyManager.instance.returnEnemy(this.node);
    }
}
