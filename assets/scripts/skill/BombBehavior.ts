import { _decorator, Component, Node, Vec3, tween } from "cc";

const { ccclass } = _decorator;

@ccclass("BombBehavior")
export class BombBehavior extends Component {
    private _explodeCallback: (() => void) | null = null;
    private _fuseTime = 2.0;

    public setup(fuseTime: number, onExplode: () => void): void {
        this._fuseTime = fuseTime;
        this._explodeCallback = onExplode;

        tween(this.node)
            .to(0.2, { scale: new Vec3(1.2, 1.2, 1) })
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .union()
            .repeatForever()
            .start();

        this.scheduleOnce(() => {
            this._explodeCallback?.();
            this.node.destroy();
        }, this._fuseTime);
    }
}
