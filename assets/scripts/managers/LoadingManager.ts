import { _decorator, Component, ProgressBar, Label, math, Color } from "cc";
import { GlobalManager } from "./GlobalManager";
const { ccclass, property } = _decorator;

@ccclass("LoadingManager")
export class LoadingManager extends Component {
    @property(ProgressBar)
    private readonly loadingBar: ProgressBar | null = null;

    @property(Label)
    private readonly loadingText: Label | null = null;

    @property(Label)
    private readonly statusText: Label | null = null;

    private _progress: number = 0;
    private _displayProgress: number = 0;
    private readonly _loadSpeed: number = 0.5;

    private readonly _messages: string[] = [
        "Đang triệu hồi tài nguyên...",
        "Đang rèn vũ khí...",
        "Đang chuẩn bị thế giới...",
        "Sẵn sàng chiến đấu!",
    ];

    protected start(): void {
        if (!this.loadingBar || !this.loadingText) {
            throw new Error("[LoadingManager] Missing UI references!");
        }
        this._progress = 0;
        this._displayProgress = 0;
    }

    protected update(dt: number): void {
        if (this._progress < 1) {
            this._progress = math.clamp01(
                this._progress + dt * this._loadSpeed,
            );
        }

        this._displayProgress = math.lerp(
            this._displayProgress,
            this._progress,
            dt * 8,
        );

        if (this.loadingBar) {
            this.loadingBar.progress = this._displayProgress;

            const barSprite = this.loadingBar.barSprite;
            if (barSprite) {
                const alpha = 180 + Math.sin(Date.now() / 150) * 75;
                const color = barSprite.color.clone();
                color.a = alpha;
                barSprite.color = color;
            }
        }

        if (this.loadingText) {
            this.loadingText.string = `${Math.floor(this._displayProgress * 100)}%`;
        }

        if (this.statusText) {
            const msgIndex = Math.min(
                Math.floor(this._displayProgress * this._messages.length),
                this._messages.length - 1,
            );
            this.statusText.string = this._messages[msgIndex];
        }

        if (this._displayProgress >= 0.99 && this._progress >= 1) {
            this.onLoadingComplete();
        }
    }

    private onLoadingComplete(): void {
        this.enabled = false;
        this.scheduleOnce(() => {
            if (GlobalManager.instance) {
                GlobalManager.instance.loadLobby();
            }
        }, 0.5);
    }
}
