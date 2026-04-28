import { _decorator, Component, Label } from "cc";
import { GlobalManager } from "../managers/GlobalManager";
const { ccclass, property } = _decorator;

@ccclass("PopupGameOver")
export class PopupGameOver extends Component {
    @property(Label)
    private readonly scoreLabel: Label | null = null;

    public show(finalScore: number): void {
        this.node.active = true;
        if (this.scoreLabel) {
            this.scoreLabel.string = `SCORE: ${finalScore}`;
        }
    }

    public onLobbyButtonClicked(): void {
        if (GlobalManager.instance) {
            GlobalManager.instance.loadLobby();
        }
    }

    public onRestartButtonClicked(): void {
        if (GlobalManager.instance) {
            GlobalManager.instance.loadGame();
        }
    }
}