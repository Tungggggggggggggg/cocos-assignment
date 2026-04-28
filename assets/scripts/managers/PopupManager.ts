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
import { PopupGameOver } from "../components/PopupGameOver";
const { ccclass, property } = _decorator;

@ccclass("PopupManager")
export class PopupManager extends Component {
    public static instance: PopupManager = null;

    @property(Prefab)
    private readonly pfbSettings: Prefab | null = null;

    @property(Prefab)
    private readonly pfbGameOver: Prefab | null = null;

    private _settingsNode: Node = null;
    private _gameOverNode: Node = null;

    protected onLoad() {
        if (PopupManager.instance === null) {
            PopupManager.instance = this;
        } else {
            this.node.destroy();
            return;
        }

        if (!this.pfbSettings) {
            throw new Error(
                "[PopupManager] Missing popupContainer or pfbSettings!",
            );
        }
    }

    public showSettings() {
        const canvas = director.getScene().getComponentInChildren(Canvas);
        if (!canvas) {
            throw new Error("[PopupManager]");
        }
        if (this._settingsNode && isValid(this._settingsNode)) {
            this._settingsNode.parent = canvas.node;
            this._settingsNode.active = true;
            return;
        }
        this._settingsNode = instantiate(this.pfbSettings);
        canvas.node.addChild(this._settingsNode);
        this._settingsNode.active = true;
    }

    public showGameOver(score: number) {
        const canvas = director.getScene().getComponentInChildren(Canvas);
        if (!canvas) return;
        if (!this._gameOverNode || !isValid(this._gameOverNode)) {
            this._gameOverNode = instantiate(this.pfbGameOver!);
            canvas.node.addChild(this._gameOverNode);
        }
        this._gameOverNode.parent = canvas.node;
        this._gameOverNode.getComponent(PopupGameOver)?.show(score);
    }
}
