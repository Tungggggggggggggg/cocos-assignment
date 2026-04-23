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
const { ccclass, property } = _decorator;

@ccclass("BulletManager")
export class BulletManager extends Component {
    public static instance: BulletManager = null;

    @property(Prefab)
    private bulletPrefab: Prefab = null;

    @property(Node)
    private bulletContainer: Node = null;

    private _bulletPool: NodePool = new NodePool();

    onLoad() {
        BulletManager.instance = this;
    }

    public spawnBullet(worldPos: Vec3, dir: Vec3) {
        let bulletNode =
            this._bulletPool.get() || instantiate(this.bulletPrefab);

        this.bulletContainer.addChild(bulletNode);

        const uiTransform = this.bulletContainer.getComponent(UITransform);
        const localPos = uiTransform.convertToNodeSpaceAR(worldPos);

        const bulletComp = bulletNode.getComponent(Bullet);
        if(bulletComp){
            bulletComp.init(localPos, dir, 800);
        }
    }

    public returnBullet(bulletNode: Node) {
        this._bulletPool.put(bulletNode);
    }
}
