import {
    _decorator,
    Component,
    Label,
    Vec3,
    tween,
    UIOpacity,
    UITransform,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("DamageNumber")
export class DamageNumber extends Component {
    @property(Label)
    private readonly label: Label | null = null;

    private _onComplete: (() => void) | null = null;

    init(amount: number, worldPos: Vec3, onComplete: () => void): void {
        this._onComplete = onComplete;

        if (this.label) {
            this.label.string = `-${amount}`;
        }

        const parent = this.node.parent;
        if (parent) {
            const ui = parent.getComponent(UITransform);
            if (ui) {
                const localPos = ui.convertToNodeSpaceAR(worldPos);
                this.node.setPosition(localPos);
            } else {
                this.node.setWorldPosition(worldPos);
            }
        } else {
            this.node.setWorldPosition(worldPos);
        }

        const opacity = this.node.getComponent(UIOpacity);
        if (opacity) opacity.opacity = 255;

        const startPos = this.node.position.clone();
        const endPos = new Vec3(startPos.x, startPos.y + 80, startPos.z);

        tween(this.node)
            .to(0.6, { position: endPos }, { easing: "quadOut" })
            .call(() => {
                if (opacity) {
                    tween(opacity)
                        .to(0.3, { opacity: 0 })
                        .call(() => this._recycle())
                        .start();
                } else {
                    this._recycle();
                }
            })
            .start();
    }

    private _recycle(): void {
        this._onComplete?.();
    }
}
