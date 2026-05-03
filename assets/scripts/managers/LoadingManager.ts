import { _decorator, Component, ProgressBar, Label, math, Color, director } from "cc";
import { GlobalManager } from "./GlobalManager";
import { SceneName } from "../core/state/SceneName";

const { ccclass, property } = _decorator;

@ccclass("LoadingManager")
export class LoadingManager extends Component {
    @property(ProgressBar)
    private readonly loadingBar: ProgressBar | null = null;

    @property(Label)
    private readonly loadingText: Label | null = null;

    @property(Label)
    private readonly statusText: Label | null = null;

    private _progress = 0;
    private _displayProgress = 0;
    private _completed = false;

    private readonly _loadSpeed = 0.5;
    private readonly _tempColor = new Color();

    private readonly _messages: readonly string[] = [
        "Đang triệu hồi tài nguyên...",
        "Đang rèn vũ khí...",
        "Đang chuẩn bị thế giới...",
        "Sẵn sàng chiến đấu!",
    ];

    protected start(): void {
        if (!this.loadingBar || !this.loadingText) {
            return;
        }
        this._progress = 0;
        this._displayProgress = 0;
        this._completed = false;
    }

    protected update(dt: number): void {
        if (this._completed) return;

        this._progress = math.clamp01(this._progress + dt * this._loadSpeed);

        this._displayProgress = math.lerp(
            this._displayProgress,
            this._progress,
            dt * 8,
        );

        this._updateBar();
        this._updateText();

        if (this._displayProgress >= 0.99 && this._progress >= 1) {
            this._onComplete();
        }
    }

    private _updateBar(): void {
        if (!this.loadingBar) return;

        this.loadingBar.progress = this._displayProgress;

        const barSprite = this.loadingBar.barSprite;
        if (barSprite) {
            const alpha = 180 + Math.sin(Date.now() / 150) * 75;
            this._tempColor.set(barSprite.color);
            this._tempColor.a = alpha;
            barSprite.color = this._tempColor;
        }
    }

    private _updateText(): void {
        if (this.loadingText) {
            this.loadingText.string = `${Math.floor(this._displayProgress * 100)}%`;
        }

        if (this.statusText) {
            const idx = Math.min(
                Math.floor(this._displayProgress * this._messages.length),
                this._messages.length - 1,
            );
            this.statusText.string = this._messages[idx];
        }
    }

    private _onComplete(): void {
        this._completed = true;
        this.enabled = false;

        this.scheduleOnce(() => {
            const gm = GlobalManager.instance;
            if (!gm) {
                director.loadScene(SceneName.Lobby);
                return;
            }
            gm.onLoadingComplete();
        }, 0.5);
    }
}
