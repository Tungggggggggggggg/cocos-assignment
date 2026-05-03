import { _decorator, Label, director } from "cc";
import { PopupBase } from "./PopupBase";
import { GlobalManager } from "../../managers/GlobalManager";

const { ccclass, property } = _decorator;

@ccclass("PopupWinner")
export class PopupWinner extends PopupBase {
    @property(Label)
    private readonly scoreLabel: Label | null = null;

    show(finalScore?: number): void {
        if (this.scoreLabel && finalScore !== undefined) {
            this.scoreLabel.string = `SCORE: ${finalScore}`;
        }
        super.show();
    }

    protected onShow(): void {}

    onRestartButtonClicked(): void {
        director.resume();
        GlobalManager.instance?.loadGame();
    }

    onLobbyButtonClicked(): void {
        director.resume();
        GlobalManager.instance?.loadLobby();
    }
}
