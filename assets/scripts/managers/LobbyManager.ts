import { _decorator, Component } from "cc";
import { GlobalManager } from "./GlobalManager";
import { PopupManager } from "./PopupManager";
const { ccclass } = _decorator;

@ccclass("LobbyManager")
export class LobbyManager extends Component {
    public onPlayButtonClicked(): void {
        if (!GlobalManager.instance) {
            throw new Error(
                "[LobbyManager] GlobalManager is missing. Did you start from the Loading scene?",
            );
        }
        GlobalManager.instance.loadGame();
    }

    public onSettingsButtonClicked(): void {
        if (PopupManager.instance) {
            PopupManager.instance.showSettings();
        }
    }
}
