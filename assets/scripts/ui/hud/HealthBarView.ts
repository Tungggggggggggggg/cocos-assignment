import { _decorator, Component, ProgressBar, Label, math } from "cc";
const { ccclass, property } = _decorator;

@ccclass("HealthBarView")
export class HealthBarView extends Component {
    @property(ProgressBar)
    private readonly bar: ProgressBar | null = null;

    /** Optional label to show "current/max" above the bar */
    @property(Label)
    private readonly hpLabel: Label | null = null;

    refresh(current: number, max: number): void {
        if (this.bar) {
            this.bar.progress = math.clamp01(current / max);
        }
        if (this.hpLabel) {
            this.hpLabel.string = `${Math.max(0, Math.ceil(current))}/${max}`;
        }
    }
}