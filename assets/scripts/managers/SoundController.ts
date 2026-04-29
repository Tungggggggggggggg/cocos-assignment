import { _decorator, Component, AudioSource, director } from "cc";
import { EventName } from "../configs/GameConfig";
import { EventManager } from "./EventManager";
import { DEBUG } from "cc/env";
const { ccclass, property } = _decorator;

@ccclass("SoundController")
export class SoundController extends Component {
    public static instance: SoundController | null = null;

    @property(AudioSource)
    private readonly bgmSource: AudioSource | null = null;

    @property(AudioSource)
    private readonly clickSource: AudioSource | null = null;

    @property(AudioSource)
    private readonly coinCountingSource: AudioSource | null = null;

    private _currentBgmVolume: number = 1.0;
    private _currentSfxVolume: number = 1.0;
    private _isBgmMuted: boolean = false;
    private _isSfxMuted: boolean = false;

    protected onLoad(): void {
        if (SoundController.instance) {
            throw new Error("SoundController: instance already exists");
        }

        SoundController.instance = this;
        director.addPersistRootNode(this.node);
        this._validateReferences();
    }

    protected onEnable(): void {
        EventManager.on(EventName.CHANGE_BGM_VOLUME, this._setBgmVolume, this);
        EventManager.on(EventName.CHANGE_SFX_VOLUME, this._setSfxVolume, this);
        EventManager.on(EventName.MUTE_BGM, this._toggleBgm, this);
        EventManager.on(EventName.MUTE_SFX, this._toggleSfx, this);
        EventManager.on(EventName.PLAY_SFX, this._playClickSFX, this);
        EventManager.on(EventName.ADD_SCORE, this._playCoinCountingSFX, this);
    }

    protected onDisable(): void {
        EventManager.off(EventName.CHANGE_BGM_VOLUME, this._setBgmVolume, this);
        EventManager.off(EventName.CHANGE_SFX_VOLUME, this._setSfxVolume, this);
        EventManager.off(EventName.MUTE_BGM, this._toggleBgm, this);
        EventManager.off(EventName.MUTE_SFX, this._toggleSfx, this);
        EventManager.off(EventName.PLAY_SFX, this._playClickSFX, this);
        EventManager.off(EventName.ADD_SCORE, this._playCoinCountingSFX, this);
    }

    protected start(): void {
        this._playBGM();
    }

    private _validateReferences(): void {
        if (!this.bgmSource || !this.clickSource || !this.coinCountingSource) {
            if (DEBUG) {
                console.warn(
                    "SoundController: Missing Audio components in Inspector. Please re-assign them due to property renaming.",
                );
            }
        }
    }

    private _playBGM(): void {
        if (!this.bgmSource?.playing) {
            this.bgmSource?.play();
        }
    }

    private _playClickSFX(): void {
        if (this._isSfxMuted || !this.clickSource) {
            return;
        }
        this.clickSource.volume = this._currentSfxVolume;
        this.clickSource.play();
    }

    private _playCoinCountingSFX(): void {
        if (this._isSfxMuted || !this.coinCountingSource) {
            return;
        }
        this.coinCountingSource.volume = this._currentSfxVolume;
        this.coinCountingSource.play();
    }

    private _setBgmVolume(volume: number): void {
        this._currentBgmVolume = Math.max(0, Math.min(1, volume));
        this._updateBgmState();
    }

    private _setSfxVolume(volume: number): void {
        this._currentSfxVolume = Math.max(0, Math.min(1, volume));
    }

    private _toggleBgm(isMuted: boolean): void {
        this._isBgmMuted = isMuted;
        this._updateBgmState();
    }

    private _toggleSfx(isMuted: boolean): void {
        this._isSfxMuted = isMuted;
    }

    private _updateBgmState(): void {
        if (!this.bgmSource) {
            return;
        }
        this.bgmSource.volume = this._isBgmMuted ? 0 : this._currentBgmVolume;
    }
}
