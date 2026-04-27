import { _decorator, Component, ProgressBar, math } from "cc";
const { ccclass, property } = _decorator;

@ccclass("HealthBar")
export class HealthBar extends Component {
    @property(ProgressBar)
    public readonly healthBar: ProgressBar | null = null;

    public updateHealth(currentHealth: number, maxHealth: number) {
        if (!this.healthBar) return;
        const healthRatio = math.clamp(currentHealth / maxHealth, 0, 1);
        this.healthBar.progress = healthRatio;
    }
}
