import { _decorator, Component, Vec2, Vec3, math, view } from "cc";
import { GameConfig } from "../data/GameConfig";
const { ccclass } = _decorator;

@ccclass("PlayerMovement")
export class PlayerMovement extends Component {
    private _moveDir = new Vec2(0, 0);
    private _minBound = new Vec3();
    private _maxBound = new Vec3();
    private _tempPos = new Vec3();
    private _tempScale = new Vec3();

    protected start(): void {
        this._calcBounds();
    }

    protected onEnable(): void {
        this.node.on("input:move-dir", this._onMoveDir, this);
    }

    protected onDisable(): void {
        this.node.off("input:move-dir", this._onMoveDir, this);
    }

    private _onMoveDir(dir: Vec2): void {
        this._moveDir.set(dir);
    }

    protected update(dt: number): void {
        if (this._moveDir.x === 0 && this._moveDir.y === 0) return;

        const pos = this.node.position;
        const dist = GameConfig.PLAYER.BASE_SPEED * dt;

        const newX = math.clamp(
            pos.x + this._moveDir.x * dist,
            this._minBound.x,
            this._maxBound.x,
        );
        const newY = math.clamp(
            pos.y + this._moveDir.y * dist,
            this._minBound.y,
            this._maxBound.y,
        );

        this._tempPos.set(newX, newY, 0);
        this.node.setPosition(this._tempPos);

        if (this._moveDir.x !== 0) {
            const sx =
                this._moveDir.x > 0
                    ? GameConfig.PLAYER.SCALE
                    : -GameConfig.PLAYER.SCALE;
            this._tempScale.set(sx, GameConfig.PLAYER.SCALE, 1);
            this.node.setScale(this._tempScale);
        }
    }

    private _calcBounds(): void {
        const v = view.getVisibleSize();
        const pad = GameConfig.PLAYER.BOUNDARY_PADDING;
        this._minBound.set(-v.width / 2 + pad, -v.height / 2 + pad, 0);
        this._maxBound.set(v.width / 2 - pad, v.height / 2 - pad, 0);
    }
}
