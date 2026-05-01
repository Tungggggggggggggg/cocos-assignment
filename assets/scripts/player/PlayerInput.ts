import {
    _decorator,
    Component,
    input,
    Input,
    EventKeyboard,
    KeyCode,
    Vec2,
} from "cc";
const { ccclass } = _decorator;

@ccclass("PlayerInput")
export class PlayerInput extends Component {
    private _moveDir = new Vec2(0, 0);
    private _alive = true;

    protected onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    setAlive(state: boolean): void {
        this._alive = state;
        if (!state) {
            this._moveDir.set(0, 0);
            this.node.emit("input:move", false);
            this.node.emit("input:move-dir", this._moveDir);
        }
    }

    private _onKeyDown(e: EventKeyboard): void {
        if (!this._alive) return;
        this._updateDir(e.keyCode, 1);
        if (e.keyCode === KeyCode.SPACE) {
            this.node.emit("input:shoot");
        }
        if (e.keyCode === KeyCode.KEY_E) {
            this.node.emit("input:weapon-swap");
        }
    }

    private _onKeyUp(e: EventKeyboard): void {
        if (!this._alive) return;
        this._updateDir(e.keyCode, 0);
    }

    private _updateDir(key: KeyCode, scale: number): void {
        let changed = false;

        switch (key) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this._moveDir.y = scale;
                changed = true;
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this._moveDir.y = -scale;
                changed = true;
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this._moveDir.x = scale;
                changed = true;
                break;
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this._moveDir.x = -scale;
                changed = true;
                break;
        }

        if (changed) {
            const isMoving = this._moveDir.x !== 0 || this._moveDir.y !== 0;
            this.node.emit("input:move", isMoving);
            this.node.emit("input:move-dir", this._moveDir);
        }
    }
}
