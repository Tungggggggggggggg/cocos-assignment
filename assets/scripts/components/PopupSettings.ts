import { _decorator, Component } from "cc";
const { ccclass } = _decorator;

@ccclass("PopupSettings")
export class PopupSettings extends Component {
    public hide() {
        this.node.active = false;
    }
}
