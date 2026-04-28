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
import { Bullet } from "../components/Bullet";
import { EventManager } from "./EventManager";
import { EventName } from "../configs/GameConfig";

const { ccclass, property } = _decorator;

@ccclass("BulletManager")
export class BulletManager extends Component {
    public static instance: BulletManager | null = null;

    @property(Prefab)
    private readonly bulletPrefab: Prefab | null = null;

    @property(Node)
    private readonly bulletContainer: Node | null = null;

    private _bulletPool: NodePool = new NodePool("recycle");

    protected onLoad() {
        if (BulletManager.instance !== null) {
            this.node.destroy();
            return;
        }
        BulletManager.instance = this;

        if (!this.bulletPrefab || !this.bulletContainer) {
            throw new Error(
                "[BulletManager] Missing bulletPrefab or bulletContainer!",
            );
        }
    }

    protected onEnable() {
        EventManager.on(EventName.RETURN_BULLET, this._onReturnBullet, this);
    }

    protected onDisable() {
        EventManager.off(EventName.RETURN_BULLET, this._onReturnBullet, this);
    }

    protected onDestroy() {
        if (BulletManager.instance === this) {
            BulletManager.instance = null;
        }
        this._bulletPool.clear();
    }

    public spawnBullet(worldPos: Vec3, dir: Vec3): void {
        if (!this.bulletPrefab || !this.bulletContainer) {
            return;
        }

        const bulletNode =
            this._bulletPool.size() > 0
                ? this._bulletPool.get()
                : instantiate(this.bulletPrefab);

        this.bulletContainer.addChild(bulletNode);

        const uiTransform = this.bulletContainer.getComponent(UITransform);
        const localPos = uiTransform.convertToNodeSpaceAR(worldPos);

        bulletNode.getComponent(Bullet)?.init(localPos, dir);
    }

    private _onReturnBullet(bulletNode: Node): void {
        if (bulletNode?.isValid) {
            this._bulletPool.put(bulletNode);
        }
    }
}
