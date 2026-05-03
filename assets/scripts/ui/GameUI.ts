import { _decorator, Component, Label, ProgressBar } from "cc";
import { GameBus } from "../core/events/EventEmitter";
import { GameConfig } from "../data/GameConfig";

const { ccclass, property } = _decorator;

@ccclass("GameUI")
export class GameUI extends Component {
    @property(Label)
    public timerLabel: Label | null = null;

    @property(Label)
    public healthLabel: Label | null = null;

    @property(ProgressBar)
    public healthBar: ProgressBar | null = null;

    @property(Label)
    public scoreLabel: Label | null = null;

    private _currentScore = 0;

    protected onLoad(): void {
        this._validateRefs();
        this._initDisplay();
    }

    protected onEnable(): void {
        GameBus.on("timer:tick", this._onTimeTick, this);
        GameBus.on("player:health-changed", this._onHealthChanged, this);
        GameBus.on("score:add", this._onScoreAdd, this);
        GameBus.on("game:start", this._onGameStart, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    public onPauseButtonClicked(): void {
        GameBus.emit("game:paused");
    }

    private _validateRefs(): void {
        if (!this.timerLabel)
            console.error("[GameUI] timerLabel is not assigned.");
        if (!this.healthLabel)
            console.error("[GameUI] healthLabel is not assigned.");
        if (!this.healthBar)
            console.error("[GameUI] healthBar is not assigned.");
        if (!this.scoreLabel)
            console.error("[GameUI] scoreLabel is not assigned.");
    }

    private _initDisplay(): void {
        this._currentScore = 0;
        this._refreshScore();
        this._refreshHealth(
            GameConfig.PLAYER.MAX_HEALTH,
            GameConfig.PLAYER.MAX_HEALTH,
        );
        this._refreshTimer(GameConfig.GAME.TIME_LIMIT_SECONDS);
    }

    private _onGameStart(): void {
        this._currentScore = 0;
        this._refreshScore();
        this._refreshHealth(
            GameConfig.PLAYER.MAX_HEALTH,
            GameConfig.PLAYER.MAX_HEALTH,
        );
        this._refreshTimer(GameConfig.GAME.TIME_LIMIT_SECONDS);
    }

    private _onScoreAdd(p: { points: number }): void {
        this._currentScore += p.points;
        this._refreshScore();
    }

    private _onHealthChanged(p: { current: number; max: number }): void {
        this._refreshHealth(p.current, p.max);
    }

    private _onTimeTick(p: { secondsLeft: number }): void {
        this._refreshTimer(p.secondsLeft);
    }

    private _refreshScore(): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = `SCORE: ${this._currentScore}`;
        }
    }

    private _refreshHealth(current: number, max: number): void {
        if (this.healthLabel) {
            this.healthLabel.string = `HP: ${Math.max(0, current)}/${max}`;
        }
        if (this.healthBar) {
            this.healthBar.progress = max > 0 ? current / max : 0;
        }
    }

    private _refreshTimer(seconds: number): void {
        if (!this.timerLabel) return;
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        this.timerLabel.string = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
}
