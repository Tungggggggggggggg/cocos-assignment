import { _decorator, Component, Slider, Toggle } from "cc";
import { EventName } from "../configs/GameConfig";
import { EventManager } from "../managers/EventManager";
import { DEBUG } from "cc/env";

const { ccclass, property } = _decorator;

@ccclass("PopupSettings")
export class PopupSettings extends Component {
    @property(Slider)
    private readonly bgmSlider: Slider | null = null;

    @property(Slider)
    private readonly sfxSlider: Slider | null = null;

    @property(Toggle)
    private readonly bgmToggle: Toggle | null = null;

    @property(Toggle)
    private readonly sfxToggle: Toggle | null = null;

    public hide(): void {
        this.node.active = false;
    }

    protected onLoad(): void {
        this._validateReferences();
    }

    protected onEnable(): void {
        this.bgmSlider?.node.on("slide", this._onBgmSliderChanged, this);
        this.sfxSlider?.node.on("slide", this._onSfxSliderChanged, this);
        this.bgmToggle?.node.on("toggle", this._onBgmToggleChanged, this);
        this.sfxToggle?.node.on("toggle", this._onSfxToggleChanged, this);
    }

    protected onDisable(): void {
        this.bgmSlider?.node.off("slide", this._onBgmSliderChanged, this);
        this.sfxSlider?.node.off("slide", this._onSfxSliderChanged, this);
        this.bgmToggle?.node.off("toggle", this._onBgmToggleChanged, this);
        this.sfxToggle?.node.off("toggle", this._onSfxToggleChanged, this);
    }

    private _validateReferences(): void {
        if (
            !this.bgmSlider ||
            !this.sfxSlider ||
            !this.bgmToggle ||
            !this.sfxToggle
        ) {
            if (DEBUG) {
                console.warn(
                    "PopupSettings: Missing UI components in Inspector. Please re-assign them due to property renaming.",
                );
            }
        }
    }

    private _onBgmSliderChanged(slider: Slider): void {
        EventManager.emit(EventName.CHANGE_BGM_VOLUME, slider.progress);
    }

    private _onSfxSliderChanged(slider: Slider): void {
        EventManager.emit(EventName.CHANGE_SFX_VOLUME, slider.progress);
        EventManager.emit(EventName.PLAY_SFX);
    }

    private _onBgmToggleChanged(toggle: Toggle): void {
        const isMuted = !toggle.isChecked;
        EventManager.emit(EventName.MUTE_BGM, isMuted);
        EventManager.emit(EventName.PLAY_SFX);
    }

    private _onSfxToggleChanged(toggle: Toggle): void {
        const isMuted = !toggle.isChecked;
        EventManager.emit(EventName.MUTE_SFX, isMuted);
        EventManager.emit(EventName.PLAY_SFX);
    }

    public onCloseButtonClicked(): void {
        EventManager.emit(EventName.PLAY_SFX);
        this.hide();
    }
}
