import { _decorator, Component, Node, Prefab, instantiate } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PopupManager")
export class PopupManager extends Component {
    public static instance: PopupManager = null;

    @property(Node)
    private readonly popupContainer: Node | null = null;

    @property(Prefab)
    private readonly pfbSettings: Prefab | null = null;

    private _settingsNode: Node = null;

    protected onLoad() {
        if (PopupManager.instance === null) {
            PopupManager.instance = this;
        } else {
            this.node.destroy();
            return;
        }

        if (!this.popupContainer || !this.pfbSettings) {
            throw new Error("[PopupManager] Missing popupContainer or pfbSettings!");
        }
    }

    public showSettings() {
        if (this._settingsNode) {
            this._settingsNode.active = true;
            return;
        }

        this._settingsNode = instantiate(this.pfbSettings);
        this.popupContainer.addChild(this._settingsNode);
    }
}
