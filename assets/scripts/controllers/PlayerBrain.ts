import { _decorator, Component, sp, Vec2 } from "cc";
import { PlayerInput } from "../components/PlayerInput";
import { EventManager } from "../managers/EventManager";
import { EventName } from "../configs/GameConfig";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("PlayerBrain")
@requireComponent(PlayerInput)
export class PlayerBrain extends Component {
    @property(sp.Skeleton)
    private readonly spineAnim: sp.Skeleton | null = null;

    private _input: PlayerInput = null;

    protected onLoad() {
        this._input = this.getComponent(PlayerInput);
        if (!this._input) {
            throw new Error("[PlayerBrain] Missing PlayerInput component!");
        }
        this._input.setAlive(false);
    }

    protected onEnable() {
        this.node.on("input-move", this.onMoveStatus, this);
        this.node.on("input-shoot", this.onShootStatus, this);

        EventManager.on(EventName.GAME_START, this.onGameStart, this);
        EventManager.on(EventName.GAME_OVER, this.onGameOver, this);
    }

    protected onDisable() {
        this.node.off("input-move", this.onMoveStatus, this);
        this.node.off("input-shoot", this.onShootStatus, this);

        EventManager.off(EventName.GAME_START, this.onGameStart, this);
        EventManager.off(EventName.GAME_OVER, this.onGameOver, this);
    }

    private onGameStart() {
        this._input.setAlive(true);
    }

    private onGameOver() {
        this._input.setAlive(false);
    }

    private onMoveStatus(dir: Vec2) {
        if (!this.spineAnim) return;
        const isMoving = dir.x !== 0 || dir.y !== 0;
        const animName = isMoving ? "run" : "idle";

        if (this.spineAnim.animation !== animName) {
            this.spineAnim.setAnimation(0, animName, true);
        }
    }

    private onShootStatus() {
        if (this.spineAnim) {
            this.spineAnim.setAnimation(1, "shoot", false);
        }
    }
}
