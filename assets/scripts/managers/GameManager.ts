import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
    public static instance: GameManager = null;

    @property(Node)
    private lobbyNode: Node = null;

    @property(Node)
    private gameLayer: Node = null;

    onLoad() {
        if (GameManager.instance === null) {
            GameManager.instance = this;
        } else {
            this.node.destroy();
            return;
        }
        this._initGameState();
    }

    private _initGameState() {
        if (this.lobbyNode) this.lobbyNode.active = true;
        if (this.gameLayer) this.gameLayer.active = false;
    }

    public onPlayButtonClick() {
        if (!this.lobbyNode || !this.gameLayer) {
            return;
        }

        this.lobbyNode.active = false;
        this.gameLayer.active = true;
    }
}
