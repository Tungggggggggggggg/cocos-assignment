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
    private _moveDir: Vec2 = new Vec2(0, 0);
    private _isAlive: boolean = true;

    protected onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    public setAlive(state: boolean) {
        this._isAlive = state;
        if (!state) {
            this._moveDir.set(0, 0);
            this.node.emit("input-move", this._moveDir);
        }
    }

    private onKeyDown(event: EventKeyboard) {
        if (!this._isAlive) return;
        this.updateDirection(event.keyCode, 1);

        if (event.keyCode === KeyCode.SPACE) {
            this.node.emit("input-shoot");
        }
    }

    private onKeyUp(event: EventKeyboard) {
        if (!this._isAlive) return;
        this.updateDirection(event.keyCode, 0);
    }

    private updateDirection(keyCode: KeyCode, scale: number) {
        let changed = false;
        switch (keyCode) {
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
            this.node.emit("input-move", this._moveDir);
        }
    }
}
