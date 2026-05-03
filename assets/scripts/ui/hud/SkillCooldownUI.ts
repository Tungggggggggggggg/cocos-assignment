import { _decorator, Component, Label, Sprite } from "cc";
import { GameBus } from "../../core/events/EventEmitter";

const { ccclass, property } = _decorator;

@ccclass("SkillCooldownUI")
export class SkillCooldownUI extends Component {
    @property
    public skillId: string = "bomb";

    @property(Label)
    public countdownLabel: Label | null = null;

    @property(Sprite)
    public cooldownOverlay: Sprite | null = null;

    protected onEnable(): void {
        if (this.cooldownOverlay) {
            this.cooldownOverlay.node.active = false;
            this.cooldownOverlay.fillStart = 0.75;
            this.cooldownOverlay.fillRange = 0;
        }
        if (this.countdownLabel) {
            this.countdownLabel.node.active = false;
        }

        GameBus.on("skill:cooldown-update", this._onUpdate, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    private _onUpdate(p: {
        skillId: string;
        ratio: number;
        cooldownMs: number;
    }): void {
        if (p.skillId !== this.skillId) return;

        const onCooldown = p.ratio > 0;

        if (this.countdownLabel) {
            if (onCooldown) {
                const remaining = ((p.ratio * p.cooldownMs) / 1000).toFixed(1);
                this.countdownLabel.string = `${remaining}s`;
                this.countdownLabel.node.active = true;
            } else {
                this.countdownLabel.node.active = false;
            }
        }

        if (this.cooldownOverlay) {
            this.cooldownOverlay.node.active = onCooldown;
            if (onCooldown) {
                this.cooldownOverlay.fillStart = 0.75;
                this.cooldownOverlay.fillRange = p.ratio;
            }
        }
    }
}
