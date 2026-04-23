import {
    _decorator,
    Component,
    Node,
    Prefab,
    NodePool,
    instantiate,
    Vec3,
    view,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("EnemyManager")
export class EnemyManager extends Component {
    public static instance: EnemyManager = null;

    @property(Prefab)
    private enemyPrefab: Prefab = null;

    @property(Node)
    private enemyContainer: Node = null;

    @property(Number)
    private spawnInterval: number = 2;

    private _enemyPool: NodePool = new NodePool();

    onLoad() {
        EnemyManager.instance = this;
    }

    start() {
        this.schedule(this.spawnEnemy, this.spawnInterval);
    }

    private spawnEnemy() {
        if (!this.enemyPrefab || !this.enemyContainer) return;

        let enemyNode: Node = null;
        if (this._enemyPool.size() > 0) {
            enemyNode = this._enemyPool.get();
        } else {
            enemyNode = instantiate(this.enemyPrefab);
        }

        this.enemyContainer.addChild(enemyNode);

        const visibleSize = view.getVisibleSize();
        const spawnX = visibleSize.width / 2 + 500;
        const spawnY = (Math.random() - 0.5) * (visibleSize.height - 200);

        const enemyComp = enemyNode.getComponent("Enemy") as any;

        if (enemyComp) {
            enemyComp.init(
                new Vec3(spawnX, spawnY, 0),
                150 + Math.random() * 100,
            );
        }
    }
    public returnEnemy(enemyNode: Node) {
        this._enemyPool.put(enemyNode);
    }
}
