import { _decorator, Component, Label, ProgressBar } from "cc";
import { EventManager } from "../managers/EventManager";
import { EventName } from "../configs/GameConfig";
const { ccclass, property } = _decorator;

@ccclass("GameUI")
export class GameUI extends Component {
    @property(Label)
    private readonly timerLabel: Label | null = null;

    @property(Label)
    private readonly healthLabel: Label | null = null;

    @property(ProgressBar)
    private readonly healthBar: ProgressBar | null = null;

    protected onLoad(): void {
        if (!this.timerLabel || !this.healthLabel || !this.healthBar) {
            throw new Error("[GameUI] timerLabel");
        }
    }

    protected onEnable(): void {
        EventManager.on(EventName.TIME_TICK, this._onTimeTick, this);
        EventManager.on(
            EventName.PLAYER_HEALTH_CHANGED,
            this._onHealthChanged,
            this,
        );
    }

    protected onDisable(): void {
        EventManager.off(EventName.TIME_TICK, this._onTimeTick, this);
        EventManager.off(
            EventName.PLAYER_HEALTH_CHANGED,
            this._onHealthChanged,
            this,
        );
    }

    private _onHealthChanged(currentHp: number, maxHp: number): void {
        if (this.healthLabel) {
            this.healthLabel.string = `HP: ${currentHp}/${maxHp}`;
        }

        if (this.healthBar) {
            this.healthBar.progress = currentHp / maxHp;
        }
    }

    private _onTimeTick(secondsLeft: number): void {
        if (!this.timerLabel) return;
        this.timerLabel.string = this._formatTime(secondsLeft);
    }

    public onPauseButtonClicked(): void {
        EventManager.emit(EventName.GAME_PAUSED);
    }

    private _formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const mStr = m < 10 ? `0${m}` : `${m}`;
        const sStr = s < 10 ? `0${s}` : `${s}`;
        return `${mStr}:${sStr}`;
    }
}
