import { _decorator, Component, AudioSource, director } from "cc";
import { GameBus } from "../core/events/EventEmitter";
const { ccclass, property } = _decorator;

@ccclass("SoundManager")
export class SoundManager extends Component {
    public static instance: SoundManager | null = null;

    @property(AudioSource)
    private readonly bgmSource: AudioSource | null = null;

    @property(AudioSource)
    private readonly sfxSource: AudioSource | null = null;

    @property(AudioSource)
    private readonly coinSource: AudioSource | null = null;

    private _bgmVolume = 1.0;
    private _sfxVolume = 1.0;
    private _bgmMuted = false;
    private _sfxMuted = false;

    protected onLoad(): void {
        if (SoundManager.instance) {
            throw new Error("[SoundManager] Duplicate instance detected.");
        }
        SoundManager.instance = this;
        director.addPersistRootNode(this.node);
    }

    protected onDestroy(): void {
        if (SoundManager.instance === this) SoundManager.instance = null;
    }

    protected onEnable(): void {
        GameBus.on(
            "sound:bgm-volume",
            (p) => this._setBgmVolume(p.volume),
            this,
        );
        GameBus.on(
            "sound:sfx-volume",
            (p) => this._setSfxVolume(p.volume),
            this,
        );
        GameBus.on("sound:bgm-mute", (p) => this._muteBgm(p.muted), this);
        GameBus.on("sound:sfx-mute", (p) => this._muteSfx(p.muted), this);
        GameBus.on("sound:play-sfx", () => this._playSfx(), this);
        GameBus.on("sound:play-coin", () => this._playCoin(), this);
        GameBus.on("enemy:died", () => GameBus.emit("sound:play-coin"), this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    protected start(): void {
        this.bgmSource?.play();
    }

    private _setBgmVolume(v: number): void {
        this._bgmVolume = Math.max(0, Math.min(1, v));
        this._syncBgm();
    }

    private _setSfxVolume(v: number): void {
        this._sfxVolume = Math.max(0, Math.min(1, v));
    }

    private _muteBgm(muted: boolean): void {
        this._bgmMuted = muted;
        this._syncBgm();
    }

    private _muteSfx(muted: boolean): void {
        this._sfxMuted = muted;
    }

    private _syncBgm(): void {
        if (!this.bgmSource) return;
        this.bgmSource.volume = this._bgmMuted ? 0 : this._bgmVolume;
    }

    private _playSfx(): void {
        if (this._sfxMuted || !this.sfxSource) return;
        this.sfxSource.volume = this._sfxVolume;
        this.sfxSource.play();
    }

    private _playCoin(): void {
        if (this._sfxMuted || !this.coinSource) return;
        this.coinSource.volume = this._sfxVolume;
        this.coinSource.play();
    }
}
