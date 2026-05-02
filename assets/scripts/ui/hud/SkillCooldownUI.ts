import { _decorator, Component, Label, Sprite, Color, ProgressBar } from "cc";
import { GameBus } from "../../core/events/EventEmitter";

const { ccclass, property } = _decorator;

@ccclass("SkillCooldownUI")
export class SkillCooldownUI extends Component {
    /** Skill id to track (e.g. "bomb") */
    @property
    public skillId: string = "bomb";

    /** Label that shows countdown seconds, e.g. "3.2s" */
    @property(Label)
    public countdownLabel: Label | null = null;

    /** Optional radial/bar fill to show cooldown progress */
    @property(Sprite)
    public cooldownOverlay: Sprite | null = null;

    private _cooldownMs = 0;

    protected onEnable(): void {
        GameBus.on("skill:cooldown-update" as any, this._onUpdate, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    private _onUpdate(p: { skillId: string; ratio: number; cooldownMs: number }): void {
        if (p.skillId !== this.skillId) return;

        this._cooldownMs = p.cooldownMs;
        const onCooldown = p.ratio > 0;

        if (this.countdownLabel) {
            if (onCooldown) {
                const remaining = (p.ratio * p.cooldownMs / 1000).toFixed(1);
                this.countdownLabel.string = `${remaining}s`;
                this.countdownLabel.node.active = true;
            } else {
                this.countdownLabel.node.active = false;
            }
        }

        if (this.cooldownOverlay) {
            this.cooldownOverlay.node.active = onCooldown;
            // Use fillRange for radial fill (set sprite to FILLED type in editor)
            this.cooldownOverlay.fillRange = p.ratio;
        }
    }
}