import {
    _decorator,
    Component,
    Prefab,
    Node,
    NodePool,
    instantiate,
    Vec3,
    view,
    math,
} from "cc";
import { EnemyController } from "./EnemyController";
import { EnemyData, EnemyRegistry } from "../data/EnemyData";
import { GameBus } from "../core/events/EventEmitter";
import { GameConfig } from "../data/GameConfig";
import { MathUtils } from "../core/utils/MathUtils";

const { ccclass, property } = _decorator;

@ccclass("EnemyPrefabEntry")
class EnemyPrefabEntry {
    @property
    public id: string = "";

    @property(Prefab)
    public prefab: Prefab | null = null;
}

@ccclass("EnemySpawner")
export class EnemySpawner extends Component {
    @property({ type: [EnemyPrefabEntry] })
    private readonly enemyEntries: EnemyPrefabEntry[] = [];

    @property(Node)
    private readonly container: Node | null = null;

    private readonly _pools = new Map<string, NodePool>();
    private readonly _nodeIdMap = new Map<string, string>();

    private _active = false;
    private _interval = 0;
    private _timer = 0;

    private readonly _spawnPos = new Vec3();

    protected onLoad(): void {
        for (const entry of this.enemyEntries) {
            if (entry.id && entry.prefab) {
                this._pools.set(entry.id, new NodePool(`enemy_${entry.id}`));
            }
        }
    }

    protected onEnable(): void {
        GameBus.on("player:ready", this._onPlayerReady, this);
        GameBus.on("game:over", this._onStop, this);
        GameBus.on("game:won", this._onStop, this);
        GameBus.on("game:paused", this._onStop, this);
        GameBus.on("game:resumed", this._onResume, this);
        GameBus.on("enemy:return", this._onReturnEnemy, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    protected onDestroy(): void {
        for (const pool of this._pools.values()) {
            pool.clear();
        }
        this._pools.clear();
        this._nodeIdMap.clear();
    }

    protected update(dt: number): void {
        if (!this._active) return;

        this._timer -= dt;
        if (this._timer > 0) return;

        this._spawnOne();

        this._interval = Math.max(
            GameConfig.ENEMY.MIN_SPAWN_INTERVAL,
            this._interval - GameConfig.ENEMY.SPAWN_DECREASE_RATE,
        );
        this._timer = this._interval;
    }

    private _onPlayerReady(): void {
        this._active = true;
        this._interval = GameConfig.ENEMY.INITIAL_SPAWN_INTERVAL;
        this._timer = this._interval;
    }

    private _onStop(): void {
        this._active = false;
    }

    private _onResume(): void {
        this._active = true;
    }

    private _spawnOne(): void {
        const data = MathUtils.weightedRandom(EnemyRegistry as EnemyData[]);
        const node = this._borrow(data.id);
        if (!node) return;

        const vis = view.getVisibleSize();
        this._spawnPos.set(
            vis.width / 2 + GameConfig.ENEMY.SPAWN_OFFSET,
            math.randomRange(
                -(vis.height / 2 - GameConfig.ENEMY.SPAWN_OFFSET),
                vis.height / 2 - GameConfig.ENEMY.SPAWN_OFFSET,
            ),
            0,
        );

        node.getComponent(EnemyController)?.spawn(data, this._spawnPos);
    }

    private _borrow(enemyId: string): Node | null {
        const pool = this._pools.get(enemyId);
        const entry = this.enemyEntries.find((e) => e.id === enemyId);
        if (!pool || !entry?.prefab || !this.container) return null;

        const node = pool.size() > 0 ? pool.get()! : instantiate(entry.prefab);

        this._nodeIdMap.set(node.uuid, enemyId);
        this.container.addChild(node);
        node.getComponent(EnemyController)?.onBorrow();
        return node;
    }

    private _onReturnEnemy(node: Node): void {
        if (!node?.isValid) return;

        node.getComponent(EnemyController)?.onReturn();

        const enemyId = this._nodeIdMap.get(node.uuid);
        if (!enemyId) return;

        const pool = this._pools.get(enemyId);
        pool?.put(node);
    }
}
