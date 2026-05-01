import {
    _decorator,
    Component,
    Prefab,
    Node,
    instantiate,
    Vec3,
    view,
    math,
} from "cc";
import { EnemyController } from "./EnemyController";
import { EnemyData, EnemyRegistry } from "../data/EnemyData";
import { GameBus } from "../core/events/EventEmitter";
import { GameConfig } from "../data/GameConfig";

const { ccclass, property } = _decorator;

@ccclass("EnemySpawner")
export class EnemySpawner extends Component {
    @property(Prefab)
    private readonly enemyPrefab: Prefab | null = null;

    @property(Node)
    private readonly container: Node | null = null;

    private readonly _pool: EnemyController[] = [];
    private _active = false;
    private _interval = 0;
    private _timer = 0;

    private readonly _spawnPos = new Vec3();

    protected onEnable(): void {
        GameBus.on("player:ready", this._onPlayerReady, this);
        GameBus.on("game:over", this._onGameOver, this);
        GameBus.on("game:paused", this._pause, this);
        GameBus.on("game:resumed", this._resume, this);
        GameBus.on("enemy:return", this._onReturnEnemy, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
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

    private _onGameOver(): void {
        this._active = false;
    }

    private _pause = (): void => {
        this._active = false;
    };
    private _resume = (): void => {
        this._active = true;
    };

    private _spawnOne(): void {
        const data = this._pickEnemyData();
        const ctrl = this._borrow();
        if (!ctrl) return;

        const vis = view.getVisibleSize();
        this._spawnPos.set(
            vis.width / 2 + GameConfig.ENEMY.SPAWN_OFFSET,
            math.randomRange(
                -(vis.height / 2 - GameConfig.ENEMY.SPAWN_OFFSET),
                vis.height / 2 - GameConfig.ENEMY.SPAWN_OFFSET,
            ),
            0,
        );

        ctrl.spawn(data, this._spawnPos);
    }

    private _pickEnemyData(): EnemyData {
        const total = EnemyRegistry.reduce((s, e) => s + e.spawnWeight, 0);
        let roll = Math.random() * total;
        for (const entry of EnemyRegistry) {
            roll -= entry.spawnWeight;
            if (roll <= 0) return entry;
        }
        return EnemyRegistry[0];
    }

    private _borrow(): EnemyController | null {
        if (this._pool.length > 0) {
            const ctrl = this._pool.pop()!;
            ctrl.onBorrow();
            this.container?.addChild(ctrl.node);
            return ctrl;
        }
        if (!this.enemyPrefab || !this.container) return null;
        const node = instantiate(this.enemyPrefab);
        this.container.addChild(node);
        return node.getComponent(EnemyController);
    }

    private _onReturnEnemy(node: Node): void {
        if (!node?.isValid) return;
        const ctrl = node.getComponent(EnemyController);
        if (!ctrl) return;
        ctrl.onReturn();
        this._pool.push(ctrl);
    }
}
