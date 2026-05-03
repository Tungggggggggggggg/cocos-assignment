import { _decorator, Component } from "cc";
import { GlobalManager } from "./GlobalManager";
import { PopupManager } from "./PopupManager";

const { ccclass } = _decorator;

@ccclass("LobbyManager")
export class LobbyManager extends Component {

    public onPlayButtonClicked(): void {
        const gm = GlobalManager.instance;
        if (!gm) {
            return;
        }
        gm.onPlayRequested();
    }

    public onSettingsButtonClicked(): void {
        PopupManager.instance?.showSettings();
    }
}