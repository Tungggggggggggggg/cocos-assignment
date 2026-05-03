import { _decorator, director } from "cc";
import { PopupBase } from "./PopupBase";
import { GameBus } from "../../core/events/EventEmitter";
import { GlobalManager } from "../../managers/GlobalManager";
import { PopupManager } from "../../managers/PopupManager";

const { ccclass } = _decorator;

@ccclass("PopupPause")
export class PopupPause extends PopupBase {

    protected onLoad(): void {
        GameBus.on("game:paused", this._onGamePaused, this);
    }

    protected onDestroy(): void {
        GameBus.offAll(this);
    }

    private _onGamePaused(): void {
        this.show();
    }

    onResumeButtonClicked(): void {
        this.hide();
        GameBus.emit("game:resumed");
    }

    onSettingsButtonClicked(): void {
        PopupManager.instance?.showSettings();
    }

    onQuitButtonClicked(): void {
        director.resume();
        GlobalManager.instance?.onQuitToLobbyRequested();
    }
}