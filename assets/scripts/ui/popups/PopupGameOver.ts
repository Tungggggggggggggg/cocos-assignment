import { _decorator, Label, director } from "cc";
import { PopupBase } from "./PopupBase";
import { GlobalManager } from "../../managers/GlobalManager";
const { ccclass, property } = _decorator;

@ccclass("PopupGameOver")
export class PopupGameOver extends PopupBase {
    @property(Label)
    private readonly scoreLabel: Label | null = null;

    protected onShow(): void {}

    show(finalScore?: number): void {
        if (this.scoreLabel && finalScore !== undefined) {
            this.scoreLabel.string = `SCORE: ${finalScore}`;
        }
        super.show();
    }

    onRestartButtonClicked(): void {
        director.resume();
        GlobalManager.instance?.loadGame();
    }

    onLobbyButtonClicked(): void {
        director.resume();
        GlobalManager.instance?.loadLobby();
    }
}
