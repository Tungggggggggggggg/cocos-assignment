import { _decorator, Component, sp, Color } from "cc";

const { ccclass, property } = _decorator;

@ccclass("PlayerAnimator")
export class PlayerAnimator extends Component {
    @property(sp.Skeleton)
    private readonly spine: sp.Skeleton | null = null;

    public playAnimation(
        name: string,
        loop: boolean = true,
        track: number = 0,
    ): number {
        if (!this.spine) return 0;
        const entry = this.spine.setAnimation(track, name, loop);
        return entry?.animation.duration ?? 0;
    }

    public addAnimation(
        name: string,
        loop: boolean = true,
        track: number = 0,
        delay: number = 0,
    ): void {
        if (!this.spine) return;
        this.spine.addAnimation(track, name, loop, delay);
    }

    public setFlash(color: Color, duration: number): void {
        if (!this.spine) return;
        this.spine.color = color;
        this.scheduleOnce(() => {
            if (this.spine?.isValid) this.spine.color = Color.WHITE;
        }, duration);
    }

    public get animationName(): string | undefined {
        return this.spine?.animation;
    }
}
