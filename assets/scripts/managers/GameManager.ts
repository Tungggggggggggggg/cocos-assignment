import { _decorator, Component, director } from "cc";
import { EventManager } from "./EventManager";
import { EventName, GameConfig } from "../configs/GameConfig";
import { PopupPause } from "../components/PopupPause";
import { PopupManager } from "./PopupManager";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
    private _score: number = 0;

    private _timeLeft: number = 0;
    private _lastDisplayTime: number = -1;
    private _isGameActive: boolean = false;

    @property(PopupPause)
    private readonly popupPause: PopupPause | null = null;

    protected start() {
        this._score = 0;
        this._timeLeft = GameConfig.GAME.TIME_LIMIT_SECONDS;
        this._lastDisplayTime = this._timeLeft;
        this._isGameActive = false;
        EventManager.emit(EventName.GAME_START);
        EventManager.emit(EventName.TIME_TICK, this._timeLeft);
    }

    protected onEnable() {
        EventManager.on(EventName.ADD_SCORE, this._onAddScore, this);
        EventManager.on(EventName.GAME_OVER, this._onGameOver, this);
        EventManager.on(EventName.GAME_PAUSED, this._onGamePaused, this);
        EventManager.on(EventName.GAME_RESUMED, this._onGameResumed, this);
        EventManager.on(EventName.PLAYER_READY, this._onPlayerReady, this);
    }

    protected onDisable() {
        EventManager.off(EventName.ADD_SCORE, this._onAddScore, this);
        EventManager.off(EventName.GAME_OVER, this._onGameOver, this);
        EventManager.off(EventName.GAME_PAUSED, this._onGamePaused, this);
        EventManager.off(EventName.GAME_RESUMED, this._onGameResumed, this);
        EventManager.off(EventName.PLAYER_READY, this._onPlayerReady, this);
    }

    protected update(dt: number): void {
        if (!this._isGameActive) return;

        this._timeLeft -= dt;

        if (this._timeLeft <= 0) {
            this._timeLeft = 0;
            this._isGameActive = false;
            EventManager.emit(EventName.TIME_TICK, 0);
            EventManager.emit(EventName.GAME_OVER);
            return;
        }

        const currentIntTime = Math.ceil(this._timeLeft);
        if (currentIntTime !== this._lastDisplayTime) {
            this._lastDisplayTime = currentIntTime;
            EventManager.emit(EventName.TIME_TICK, currentIntTime);
        }
    }

    private _onAddScore(points: number): void {
        this._score += points;
    }

    private _onPlayerReady(): void {
        this._isGameActive = true;
    }

    private _onGamePaused(): void {
        this._isGameActive = false;
        if (this.popupPause) {
            this.popupPause.show();
        }
        director.pause();
    }

    private _onGameResumed(): void {
        this._isGameActive = true;
        director.resume();
    }

    private _onGameOver(): void {
        this._isGameActive = false;

        director.pause();
        if (PopupManager.instance) {
            PopupManager.instance.showGameOver(this._score);
        }
    }
}