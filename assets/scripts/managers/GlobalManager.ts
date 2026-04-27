import { _decorator, Component, director } from "cc";
const { ccclass } = _decorator;

@ccclass("GlobalManager")
export class GlobalManager extends Component {
    public static instance: GlobalManager | null = null;

    protected onLoad(): void {
        if (GlobalManager.instance !== null) {
            this.node.destroy();
            return;
        }

        GlobalManager.instance = this;
        director.addPersistRootNode(this.node);
    }

    public loadLobby(): void {
        director.loadScene("Lobby");
    }

    public loadGame(): void {
        director.loadScene("Game");
    }
}
