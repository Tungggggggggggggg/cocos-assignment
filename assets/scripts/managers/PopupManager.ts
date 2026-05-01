import {
    _decorator,
    Component,
    Node,
    Prefab,
    instantiate,
    director,
    Canvas,
    isValid,
} from "cc";
import { PopupGameOver } from "../ui/popups/PopupGameOver";
import { PopupWinner } from "../ui/popups/PopupWinner";

const { ccclass, property } = _decorator;

@ccclass("PopupManager")
export class PopupManager extends Component {
    public static instance: PopupManager | null = null;

    @property(Prefab)
    private readonly pfbSettings: Prefab | null = null;

    @property(Prefab)
    private readonly pfbGameOver: Prefab | null = null;

    @property(Prefab)
    private readonly pfbWinner: Prefab | null = null;

    private _settingsNode: Node | null = null;
    private _gameOverNode: Node | null = null;
    private _winnerNode: Node | null = null;

    protected onLoad(): void {
        if (PopupManager.instance) {
            this.node.destroy();
            return;
        }
        PopupManager.instance = this;
        director.addPersistRootNode(this.node);
    }

    protected onDestroy(): void {
        if (PopupManager.instance === this) PopupManager.instance = null;
    }

    showSettings(): void {
        const canvas = this._getCanvas();
        if (!canvas) return;

        if (this._settingsNode && isValid(this._settingsNode)) {
            this._settingsNode.parent = canvas;
            this._settingsNode.active = true;
            return;
        }
        if (!this.pfbSettings) return;
        this._settingsNode = instantiate(this.pfbSettings);
        canvas.addChild(this._settingsNode);
    }

    showGameOver(score: number): void {
        const canvas = this._getCanvas();
        if (!canvas || !this.pfbGameOver) return;

        if (!this._gameOverNode || !isValid(this._gameOverNode)) {
            this._gameOverNode = instantiate(this.pfbGameOver);
        }
        this._gameOverNode.parent = canvas;
        this._gameOverNode.getComponent(PopupGameOver)?.show(score);
    }

    showWinner(score: number): void {
        const canvas = this._getCanvas();
        if (!canvas || !this.pfbWinner) return;

        if (!this._winnerNode || !isValid(this._winnerNode)) {
            this._winnerNode = instantiate(this.pfbWinner);
        }
        this._winnerNode.parent = canvas;
        this._winnerNode.getComponent(PopupWinner)?.show(score);
    }

    private _getCanvas(): Node | null {
        return (
            director.getScene()?.getComponentInChildren(Canvas)?.node ?? null
        );
    }
}
