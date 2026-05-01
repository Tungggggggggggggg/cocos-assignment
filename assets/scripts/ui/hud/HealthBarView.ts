import { _decorator, Component, ProgressBar, math } from "cc";
const { ccclass, property } = _decorator;

@ccclass("HealthBarView")
export class HealthBarView extends Component {
    @property(ProgressBar)
    private readonly bar: ProgressBar | null = null;

    refresh(current: number, max: number): void {
        if (!this.bar) return;
        this.bar.progress = math.clamp01(current / max);
    }
}
