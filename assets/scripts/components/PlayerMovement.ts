import { _decorator, Component, Vec2, Vec3, math, view } from "cc";
import { GameConfig } from "../configs/GameConfig";
const { ccclass } = _decorator;

@ccclass("PlayerMovement")
export class PlayerMovement extends Component {
    private _moveDir: Vec2 = new Vec2(0, 0);
    private readonly _minBound: Vec3 = new Vec3();
    private readonly _maxBound: Vec3 = new Vec3();
    private readonly _tempPos: Vec3 = new Vec3();
    private readonly _tempScale: Vec3 = new Vec3();

    protected start() {
        this.calculateBoundaries();
    }

    protected onEnable() {
        this.node.on("input-move", this.onMoveInput, this);
    }

    protected onDisable() {
        this.node.off("input-move", this.onMoveInput, this);
    }

    private calculateBoundaries() {
        const visibleSize = view.getVisibleSize();
        const halfWidth = visibleSize.width / 2;
        const halfHeight = visibleSize.height / 2;
        const pad = GameConfig.PLAYER.BOUNDARY_PADDING;

        this._minBound.set(-halfWidth + pad, -halfHeight + pad, 0);
        this._maxBound.set(halfWidth - pad, halfHeight - pad, 0);
    }

    private onMoveInput(dir: Vec2) {
        this._moveDir.set(dir);
    }

    protected update(dt: number) {
        if (this._moveDir.x === 0 && this._moveDir.y === 0) return;

        const currentPos = this.node.position;
        const moveDist = GameConfig.PLAYER.BASE_SPEED * dt;

        let newX = currentPos.x + this._moveDir.x * moveDist;
        let newY = currentPos.y + this._moveDir.y * moveDist;

        newX = math.clamp(newX, this._minBound.x, this._maxBound.x);
        newY = math.clamp(newY, this._minBound.y, this._maxBound.y);

        this._tempPos.set(newX, newY, 0);
        this.node.setPosition(this._tempPos);

        if (this._moveDir.x !== 0) {
            const scaleX =
                this._moveDir.x > 0
                    ? GameConfig.PLAYER.SCALE
                    : -GameConfig.PLAYER.SCALE;
            this._tempScale.set(scaleX, GameConfig.PLAYER.SCALE, 1);
            this.node.setScale(this._tempScale);
        }
    }
}
