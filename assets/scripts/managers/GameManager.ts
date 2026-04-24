import { _decorator, Component, Node } from "cc";
import { EventManager } from "./EventManager";
import { EventName } from "../configs/GameConfig";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
    @property(Node)
    private lobbyLayer: Node = null;

    @property(Node)
    private gameLayer: Node = null;

    private _score: number = 0;

    start() {
        this.initGameState();
    }

    onEnable() {
        EventManager.on(EventName.ADD_SCORE, this.onAddScore, this);
        EventManager.on(EventName.GAME_OVER, this.onGameOver, this);
    }

    onDisable() {
        EventManager.off(EventName.ADD_SCORE, this.onAddScore, this);
        EventManager.off(EventName.GAME_OVER, this.onGameOver, this);
    }

    private initGameState() {
        if (this.lobbyLayer) this.lobbyLayer.active = true;
        if (this.gameLayer) this.gameLayer.active = false;
        this._score = 0;
    }

    public onPlayButtonClick() {
        if (this.lobbyLayer) this.lobbyLayer.active = false;
        if (this.gameLayer) this.gameLayer.active = true;

        EventManager.emit(EventName.GAME_START);
    }

    private onAddScore(points: number) {
        this._score += points;
    }

    private onGameOver() {
        this.initGameState();
    }
}
