import { _decorator, Component, Slider, Toggle } from "cc";
import { PopupBase } from "./PopupBase";
import { GameBus }   from "../../core/events/EventEmitter";
const { ccclass, property } = _decorator;

@ccclass("PopupSettings")
export class PopupSettings extends PopupBase {
    @property(Slider)
    private readonly bgmSlider: Slider | null = null;

    @property(Slider)
    private readonly sfxSlider: Slider | null = null;

    @property(Toggle)
    private readonly bgmToggle: Toggle | null = null;

    @property(Toggle)
    private readonly sfxToggle: Toggle | null = null;

    protected onEnable(): void {
        this.bgmSlider?.node.on("slide",  this._onBgmSlide,   this);
        this.sfxSlider?.node.on("slide",  this._onSfxSlide,   this);
        this.bgmToggle?.node.on("toggle", this._onBgmToggle,  this);
        this.sfxToggle?.node.on("toggle", this._onSfxToggle,  this);
    }

    protected onDisable(): void {
        this.bgmSlider?.node.off("slide",  this._onBgmSlide,  this);
        this.sfxSlider?.node.off("slide",  this._onSfxSlide,  this);
        this.bgmToggle?.node.off("toggle", this._onBgmToggle, this);
        this.sfxToggle?.node.off("toggle", this._onSfxToggle, this);
    }

    hide(): void {
        GameBus.emit("sound:play-sfx");
        super.hide();
    }

    private _onBgmSlide(slider: Slider): void {
        GameBus.emit("sound:bgm-volume", { volume: slider.progress });
    }

    private _onSfxSlide(slider: Slider): void {
        GameBus.emit("sound:sfx-volume", { volume: slider.progress });
        GameBus.emit("sound:play-sfx");
    }

    private _onBgmToggle(toggle: Toggle): void {
        GameBus.emit("sound:bgm-mute", { muted: !toggle.isChecked });
    }

    private _onSfxToggle(toggle: Toggle): void {
        GameBus.emit("sound:sfx-mute", { muted: !toggle.isChecked });
    }
}