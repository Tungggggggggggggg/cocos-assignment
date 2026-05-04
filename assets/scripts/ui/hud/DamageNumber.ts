import {
    _decorator,
    Component,
    Label,
    Vec3,
    tween,
    Tween,
    UIOpacity,
    UITransform,
} from "cc";

const { ccclass, property } = _decorator;

@ccclass("DamageNumber")
export class DamageNumber extends Component {
    @property(Label)
    public label: Label | null = null;

    private _onComplete: (() => void) | null = null;
    private _uiOpacity: UIOpacity | null = null;

    protected onLoad(): void {
        this._uiOpacity = this.getComponent(UIOpacity);
        if (!this.label) {
            this.label = this.getComponent(Label);
        }
    }

    public init(amount: number, worldPos: Vec3, onComplete: () => void): void {
        this._onComplete = onComplete;

        if (this.label) {
            this.label.string = `-${amount}`;
        }

        this._placeAtWorldPos(worldPos);
        this._playAnimation();
    }

    private _placeAtWorldPos(worldPos: Vec3): void {
        const parent = this.node.parent;
        if (!parent) {
            this.node.setWorldPosition(worldPos);
            return;
        }

        const ui = parent.getComponent(UITransform);
        if (ui) {
            const local = ui.convertToNodeSpaceAR(worldPos);
            this.node.setPosition(local);
        } else {
            this.node.setWorldPosition(worldPos);
        }
    }

    private _playAnimation(): void {
        const opacity = this._uiOpacity;
        if (opacity) opacity.opacity = 255;

        Tween.stopAllByTarget(this.node);

        const startPos = this.node.position.clone();
        const endPos = new Vec3(startPos.x, startPos.y + 80, startPos.z);

        tween(this.node)
            .to(0.5, { position: endPos }, { easing: "quadOut" })
            .call(() => {
                if (!opacity) {
                    this._recycle();
                    return;
                }
                tween(opacity)
                    .to(0.3, { opacity: 0 })
                    .call(() => this._recycle())
                    .start();
            })
            .start();
    }

    private _recycle(): void {
        const cb = this._onComplete;
        this._onComplete = null;
        cb?.();
    }
}
