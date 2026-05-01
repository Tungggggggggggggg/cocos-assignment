import { game } from "cc";
import { ISkill } from "./ISkill";

export abstract class SkillBase implements ISkill {
    abstract readonly skillId: string;
    abstract readonly cooldownMs: number;
    abstract readonly isPassive: boolean;

    private _lastUsedTime = -Infinity;
    private _isOnCooldown = false;

    get cooldownRatio(): number {
        if (!this._isOnCooldown) return 0;
        const elapsed = game.totalTime - this._lastUsedTime;
        return Math.max(0, 1 - elapsed / this.cooldownMs);
    }

    activate(): boolean {
        if (this._isOnCooldown) return false;
        this._lastUsedTime = game.totalTime;
        this._isOnCooldown = true;
        this.onActivate();
        return true;
    }

    update(dt: number): void {
        if (this._isOnCooldown) {
            const elapsed = game.totalTime - this._lastUsedTime;
            if (elapsed >= this.cooldownMs) {
                this._isOnCooldown = false;
                this.onCooldownEnd();
            }
        }
        if (this.isPassive) this.onPassiveTick(dt);
    }

    protected abstract onActivate(): void;
    protected onCooldownEnd(): void {}
    protected onPassiveTick(_dt: number): void {}
}