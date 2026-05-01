import { _decorator, Component } from "cc";
import { GameBus } from "../core/events/EventEmitter";

const { ccclass } = _decorator;

@ccclass("ScoreManager")
export class ScoreManager extends Component {
    private _score = 0;

    get score(): number {
        return this._score;
    }

    protected onEnable(): void {
        GameBus.on("score:add", this._onAdd, this);
        GameBus.on("game:start", this._onReset, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    private _onAdd(payload: { points: number }): void {
        this._score += payload.points;
    }

    private _onReset(): void {
        this._score = 0;
    }
}
