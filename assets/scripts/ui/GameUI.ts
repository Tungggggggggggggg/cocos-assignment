import { _decorator, Component, Label, ProgressBar } from "cc";
import { GameBus } from "../core/events/EventEmitter";
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
            throw new Error("[GameUI] Missing required UI references in Inspector.");
        }
    }

    protected onEnable(): void {
        GameBus.on("timer:tick",             this._onTimeTick,      this);
        GameBus.on("player:health-changed",  this._onHealthChanged, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    public onPauseButtonClicked(): void {
        GameBus.emit("game:paused");
    }

    private _onHealthChanged(p: { current: number; max: number }): void {
        if (this.healthLabel) {
            this.healthLabel.string = `HP: ${p.current}/${p.max}`;
        }
        if (this.healthBar) {
            this.healthBar.progress = p.current / p.max;
        }
    }

    private _onTimeTick(p: { secondsLeft: number }): void {
        if (!this.timerLabel) return;
        const m = Math.floor(p.secondsLeft / 60);
        const s = Math.floor(p.secondsLeft % 60);
        this.timerLabel.string =
            `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
}