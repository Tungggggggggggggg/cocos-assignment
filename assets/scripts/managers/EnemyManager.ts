import {
    _decorator,
    Component,
    Node,
    Prefab,
    NodePool,
    instantiate,
    Vec3,
    view,
    math,
} from "cc";
import { EnemyBrain } from "../controllers/EnemyBrain";
import { EventManager } from "./EventManager";
import { EventName, GameConfig } from "../configs/GameConfig";

const { ccclass, property } = _decorator;

@ccclass("EnemyManager")
export class EnemyManager extends Component {
    @property(Prefab)
    private readonly enemyPrefab: Prefab | null = null;

    @property(Node)
    private readonly enemyContainer: Node | null = null;

    private _enemyPool: NodePool = new NodePool("recycle");
    private _isSpawning: boolean = false;

    protected onLoad() {
        if (!this.enemyPrefab || !this.enemyContainer) {
            throw new Error("[EnemyManager] Missing enemyPrefab or enemyContainer!");
        }
    }

    protected onEnable() {
        EventManager.on(EventName.GAME_START, this._startGame, this);
        EventManager.on(EventName.GAME_OVER, this._stopGame, this);
        EventManager.on(EventName.RETURN_ENEMY, this._onReturnEnemy, this);
    }

    protected onDisable() {
        EventManager.off(EventName.GAME_START, this._startGame, this);
        EventManager.off(EventName.GAME_OVER, this._stopGame, this);
        EventManager.off(EventName.RETURN_ENEMY, this._onReturnEnemy, this);
    }

    protected onDestroy() {
        this._stopGame();
        this._enemyPool.clear();
    }

    private _startGame(): void {
        if (this._isSpawning) return;
        this._isSpawning = true;
        this.schedule(this._spawnEnemy, GameConfig.ENEMY.SPAWN_INTERVAL);
    }

    private _stopGame(): void {
        this._isSpawning = false;
        this.unschedule(this._spawnEnemy);
    }

    private _spawnEnemy(): void {
        if (!this._isSpawning || !this.enemyPrefab || !this.enemyContainer) return;

        const enemyNode = this._enemyPool.size() > 0
            ? this._enemyPool.get()
            : instantiate(this.enemyPrefab);

        this.enemyContainer.addChild(enemyNode);

        const visibleSize = view.getVisibleSize();
        const spawnX = visibleSize.width / 2 + GameConfig.ENEMY.SPAWN_OFFSET;
        const spawnY = math.randomRange(
            -(visibleSize.height / 2 - GameConfig.ENEMY.SPAWN_OFFSET),
             (visibleSize.height / 2 - GameConfig.ENEMY.SPAWN_OFFSET),
        );

        const speed = math.randomRange(GameConfig.ENEMY.SPEED_MIN, GameConfig.ENEMY.SPEED_MAX);
        enemyNode.getComponent(EnemyBrain)?.spawn(new Vec3(spawnX, spawnY, 0), speed);
    }

    private _onReturnEnemy(enemyNode: Node): void {
        if (enemyNode?.isValid) {
            this._enemyPool.put(enemyNode);
        }
    }
}