import { _decorator, Component } from "cc";
const { ccclass } = _decorator;

@ccclass("PopupBase")
export abstract class PopupBase extends Component {
    show(): void {
        this.node.active = true;
        this.onShow();
    }

    hide(): void {
        this.onHide();
        this.node.active = false;
    }

    protected onShow(): void {}
    protected onHide(): void {}
}
