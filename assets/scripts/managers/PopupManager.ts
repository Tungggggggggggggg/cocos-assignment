import { _decorator, Component, Node, Prefab, instantiate } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PopupManager")
export class PopupManager extends Component {
    public static instance: PopupManager = null;

    @property(Node)
    private popupContainer: Node = null;

    @property(Prefab)
    private pfbSettings: Prefab = null;

    private _settingsNode: Node = null;

    onLoad() {
        if (PopupManager.instance === null) {
            PopupManager.instance = this;
        } else {
            this.node.destroy();
            return;
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
