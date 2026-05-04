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

const { ccclass, property } = _decorator;

@ccclass("PopupManager")
export class PopupManager extends Component {
    public static instance: PopupManager | null = null;

    @property(Prefab)
    private readonly pfbSettings: Prefab | null = null;

    @property(Prefab)
    private readonly pfbGameOver: Prefab | null = null;

    private _settingsNode: Node | null = null;
    private _gameOverNode: Node | null = null;

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

    public showSettings(): void {
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

    public showGameOver(score: number): void {
        const canvas = this._getCanvas();
        if (!canvas || !this.pfbGameOver) return;

        if (!this._gameOverNode || !isValid(this._gameOverNode)) {
            this._gameOverNode = instantiate(this.pfbGameOver);
        }
        this._gameOverNode.parent = canvas;
        this._gameOverNode.getComponent(PopupGameOver)?.show(score);
    }

    private _getCanvas(): Node | null {
        return (
            director.getScene()?.getComponentInChildren(Canvas)?.node ?? null
        );
    }
}
