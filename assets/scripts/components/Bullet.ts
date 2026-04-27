import { _decorator, Component, Vec3, view, RigidBody2D, Vec2 } from "cc";
import { GameConfig, EventName } from "../configs/GameConfig";
import { EventManager } from "../managers/EventManager";
const { ccclass } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
    private baseDamage: number = GameConfig.BULLET.DAMAGE;

    private _isRecycled: boolean = false;
    private _rb: RigidBody2D | null = null;
    private readonly _spawnWorldPos: Vec3 = new Vec3(); 
    private _maxDistance: number = 0;
    private readonly _tempDir: Vec3 = new Vec3();

    public get damage(): number {
        return this.baseDamage;
    }

    protected onLoad() {
        this._rb = this.getComponent(RigidBody2D);
        if (!this._rb) {
            throw new Error(`[Bullet] Thiếu RigidBody2D trên prefab đạn!`);
        }
        this._rb.bullet = true; 
    }

    public init(localPos: Vec3, dir: Vec3) {
        this._isRecycled = false;
        
        this.baseDamage = GameConfig.BULLET.DAMAGE;

        this.node.setPosition(localPos);
        this.node.updateWorldTransform(); 
        this._spawnWorldPos.set(this.node.worldPosition);

        this._maxDistance = view.getVisibleSize().width * GameConfig.BULLET.MAX_DISTANCE_MULTIPLIER;

        if (this._rb) {
            this._rb.wakeUp();
            
            Vec3.normalize(this._tempDir, dir);

            const velocityX = this._tempDir.x * GameConfig.BULLET.SPEED;
            const velocityY = this._tempDir.y * GameConfig.BULLET.SPEED;
            this._rb.linearVelocity = new Vec2(velocityX, velocityY);
        }
    }

    protected update(dt: number) {
        if (this._isRecycled) return;

        const currentWorldPos = this.node.worldPosition;
        const distance = Vec3.distance(this._spawnWorldPos, currentWorldPos);

        if (distance > this._maxDistance) {
            this.recycle();
        }
    }

    public recycle() {
        if (this._isRecycled) return;
        this._isRecycled = true;
        
        if (this._rb) {
            this._rb.linearVelocity = Vec2.ZERO;
        }

        EventManager.emit(EventName.RETURN_BULLET, this.node);
    }
}