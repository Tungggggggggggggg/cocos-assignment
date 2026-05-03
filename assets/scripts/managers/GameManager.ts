import { _decorator, Component, director } from "cc";
import { GameBus } from "../core/events/EventEmitter";
import { GameConfig } from "../data/GameConfig";
import { PopupManager } from "./PopupManager";
import { ScoreManager } from "./ScoreManager";
import { PopupPause } from "../ui/popups/PopupPause";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
    @property(PopupPause)
    private readonly popupPause: PopupPause | null = null;

    @property(ScoreManager)
    private readonly scoreManager: ScoreManager | null = null;

    private _timeLeft = 0;
    private _lastDisplay = -1;
    private _active = false;

    protected start(): void {
        this._timeLeft = GameConfig.GAME.TIME_LIMIT_SECONDS;
        this._lastDisplay = this._timeLeft;
        this._active = false;

        GameBus.emit("game:start");
        GameBus.emit("timer:tick", { secondsLeft: this._timeLeft });
    }

    protected onEnable(): void {
        GameBus.on("game:over", this._onGameOver, this);
        GameBus.on("game:won", this._onGameWon, this);
        GameBus.on("game:paused", this._onPaused, this);
        GameBus.on("game:resumed", this._onResumed, this);
        GameBus.on("player:ready", this._onPlayerReady, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    protected update(dt: number): void {
        if (!this._active) return;

        this._timeLeft -= dt;

        if (this._timeLeft <= 0) {
            this._timeLeft = 0;
            this._active = false;
            GameBus.emit("timer:tick", { secondsLeft: 0 });
            GameBus.emit("game:won");
            return;
        }

        const ceil = Math.ceil(this._timeLeft);
        if (ceil !== this._lastDisplay) {
            this._lastDisplay = ceil;
            GameBus.emit("timer:tick", { secondsLeft: ceil });
        }
    }

    private _onPlayerReady(): void {
        this._active = true;
    }

    private _onPaused(): void {
        this._active = false;
        this.popupPause?.show();
        director.pause();
    }

    private _onResumed(): void {
        this._active = true;
        director.resume();
    }

    private _onGameOver(): void {
        this._active = false;
        director.pause();
        PopupManager.instance?.showGameOver(this.scoreManager?.score ?? 0);
    }

    private _onGameWon(): void {
        this._active = false;
        director.pause();
        PopupManager.instance?.showGameOver(this.scoreManager?.score ?? 0);
    }
}
