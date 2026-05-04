import { _decorator, Component, sp, Color } from "cc";

const { ccclass } = _decorator;

@ccclass("PlayerAnimator")
export class PlayerAnimator extends Component {
    private _spine: sp.Skeleton | null = null;

    protected onLoad(): void {
        this._spine = this.getComponent(sp.Skeleton);
        if (!this._spine) {
            this._spine = this.node.getComponentInChildren(sp.Skeleton);
        }
    }

    public playAnimation(
        name: string,
        loop: boolean = true,
        track: number = 0,
    ): number {
        if (!this._spine) return 0;
        try {
            const entry = this._spine.setAnimation(track, name, loop);
            return entry?.animation?.duration ?? 0;
        } catch (e) {
            return 0;
        }
    }

    public addAnimation(
        name: string,
        loop: boolean = true,
        track: number = 0,
        delay: number = 0,
    ): void {
        if (!this._spine) return;
        try {
            this._spine.addAnimation(track, name, loop, delay);
        } catch (e) {}
    }

    public setFlash(color: Color, duration: number): void {
        if (!this._spine) return;
        this._spine.color = color;
        this.scheduleOnce(() => {
            if (this._spine?.isValid) this._spine.color = Color.WHITE;
        }, duration);
    }

    public get animationName(): string | undefined {
        return this._spine?.animation;
    }
}
