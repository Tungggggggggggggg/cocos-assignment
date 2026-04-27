import { _decorator, Component } from "cc";
import { EventManager } from "./EventManager";
import { EventName } from "../configs/GameConfig";
import { GlobalManager } from "./GlobalManager";
const { ccclass } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
    private _score: number = 0;

    protected start() {
        this._score = 0;
        EventManager.emit(EventName.GAME_START);
    }

    protected onEnable() {
        EventManager.on(EventName.ADD_SCORE, this.onAddScore, this);
        EventManager.on(EventName.GAME_OVER, this.onGameOver, this);
    }

    protected onDisable() {
        EventManager.off(EventName.ADD_SCORE, this.onAddScore, this);
        EventManager.off(EventName.GAME_OVER, this.onGameOver, this);
    }

    private onAddScore(points: number) {
        this._score += points;
    }

    private onGameOver() {
        if (GlobalManager.instance) {
            GlobalManager.instance.loadLobby();
        } else {
            throw new Error("[GameManager] GlobalManager is missing!");
        }
    }
}
