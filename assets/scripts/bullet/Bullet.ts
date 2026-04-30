import { _decorator, Component, Vec3, view, RigidBody2D, Vec2 } from "cc";
import { GameBus } from "../core/events/EventEmitter";
import { BulletData } from "../data/BulletData";
const { ccclass } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
    private _data:       BulletData | null = null;
    private _recycled    = false;
    private _rb:         RigidBody2D | null = null;

    private readonly _spawnWorldPos      = new Vec3();
    private readonly _tempVelocity       = new Vec2();   // fix: không new Vec2 trong update
    private _maxDistSq = 0;

    get damage():     number  { return this._data?.damage     ?? 0; }
    get isPiercing(): boolean { return this._data?.piercing    ?? false; }

    protected onLoad(): void {
        this._rb = this.getComponent(RigidBody2D);
    }

    init(data: BulletData, localPos: Vec3, dir: Vec3): void {
        this._data     = data;
        this._recycled = false;

        this.node.setPosition(localPos);
        this.node.updateWorldTransform();
        this._spawnWorldPos.set(this.node.worldPosition);

        const maxDist = view.getVisibleSize().width * data.maxDistanceMultiplier;
        this._maxDistSq = maxDist * maxDist;

        if (this._rb) {
            this._rb.wakeUp();
            // fix: reuse _tempVelocity thay vì new Vec2()
            this._tempVelocity.set(dir.x * data.speed, dir.y * data.speed);
            this._rb.linearVelocity = this._tempVelocity;
        }
    }

    protected update(_dt: number): void {
        if (this._recycled) return;
        const distSq = Vec3.squaredDistance(this._spawnWorldPos, this.node.worldPosition);
        if (distSq > this._maxDistSq) this.recycle();
    }

    recycle(): void {
        if (this._recycled) return;
        this._recycled = true;
        if (this._rb) this._rb.linearVelocity = Vec2.ZERO;
        GameBus.emit("bullet:return", this.node);
    }
}