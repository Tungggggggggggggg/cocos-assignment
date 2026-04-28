import { _decorator, Component, director } from "cc";
import { EventManager } from "../managers/EventManager";
import { EventName } from "../configs/GameConfig";
import { PopupManager } from "../managers/PopupManager";
import { GlobalManager } from "../managers/GlobalManager";
const { ccclass } = _decorator;

@ccclass("PopupPause")
export class PopupPause extends Component {
    public show(): void {
        this.node.active = true;
    }

    public hide(): void {
        this.node.active = false;
    }

    public onResumeButtonClicked(): void {
        this.hide();
        EventManager.emit(EventName.GAME_RESUMED);
    }

    public onSettingsButtonClicked(): void {
        if (PopupManager.instance) {
            PopupManager.instance.showSettings();
        }
    }

    public onQuitButtonClicked(): void {
        director.resume();
        if (GlobalManager.instance) {
            GlobalManager.instance.loadLobby();
        }
    }
}
