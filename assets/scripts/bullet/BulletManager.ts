import {
    _decorator,
    Component,
    Node,
    Prefab,
    NodePool,
    instantiate,
    Vec3,
    UITransform,
} from "cc";
import { Bullet } from "./Bullet";
import { BulletRegistry } from "../data/BulletData";
import { GameBus } from "../core/events/EventEmitter";

const { ccclass, property } = _decorator;

@ccclass("BulletManager")
export class BulletManager extends Component {

    public static instance: BulletManager | null = null;

    @property(Prefab)
    private readonly bulletPrefab: Prefab | null = null;

    @property(Node)
    private readonly bulletContainer: Node | null = null;

    private readonly _pool = new NodePool("recycle");

    protected onLoad(): void {
        if (BulletManager.instance) {
            this.node.destroy();
            return;
        }
        BulletManager.instance = this;
    }

    protected onEnable(): void {
        GameBus.on("bullet:return", this._onReturn, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    protected onDestroy(): void {
        if (BulletManager.instance === this) BulletManager.instance = null;
        this._pool.clear();
    }

    spawn(bulletId: string, worldPos: Vec3, dir: Vec3): void {
        const data = BulletRegistry[bulletId];
        if (!data) {
            return;
        }
        if (!this.bulletPrefab || !this.bulletContainer) return;

        const node =
            this._pool.size() > 0
                ? this._pool.get()
                : instantiate(this.bulletPrefab);

        this.bulletContainer.addChild(node);

        const ui = this.bulletContainer.getComponent(UITransform)!;
        const localPos = ui.convertToNodeSpaceAR(worldPos);

        node.getComponent(Bullet)?.init(data, localPos, dir);
    }

    private _onReturn(node: Node): void {
        if (node?.isValid) this._pool.put(node);
    }
}
