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

    private readonly _enemyPool: NodePool = new NodePool("recycle");
    private _isSpawning: boolean = false;
    private _isGameActive: boolean = false;
    
    private _currentSpawnInterval: number = 0;
    private _spawnTimer: number = 0;

    protected onLoad(): void {
        if (!this.enemyPrefab || !this.enemyContainer) {
            throw new Error(
                "[EnemyManager] Missing enemyPrefab or enemyContainer!",
            );
        }
    }

    protected onEnable(): void {
        EventManager.on(EventName.PLAYER_READY, this._startGame, this);
        EventManager.on(EventName.GAME_OVER, this._stopGame, this);
        EventManager.on(EventName.RETURN_ENEMY, this._onReturnEnemy, this);
        EventManager.on(EventName.GAME_PAUSED, this._onGamePaused, this);
        EventManager.on(EventName.GAME_RESUMED, this._onGameResumed, this);
    }

    protected onDisable(): void {
        EventManager.off(EventName.PLAYER_READY, this._startGame, this);
        EventManager.off(EventName.GAME_OVER, this._stopGame, this);
        EventManager.off(EventName.RETURN_ENEMY, this._onReturnEnemy, this);
        EventManager.off(EventName.GAME_PAUSED, this._onGamePaused, this);
        EventManager.off(EventName.GAME_RESUMED, this._onGameResumed, this);
    }

    protected onDestroy(): void {
        this._stopGame();
        this._enemyPool.clear();
    }

    protected update(dt: number): void {
        if (!this._isSpawning || !this._isGameActive) return;

        this._spawnTimer -= dt;
        if (this._spawnTimer <= 0) {
            this._spawnEnemy();
            
            this._currentSpawnInterval = Math.max(
                GameConfig.ENEMY.MIN_SPAWN_INTERVAL,
                this._currentSpawnInterval - GameConfig.ENEMY.SPAWN_DECREASE_RATE
            );
            
            this._spawnTimer = this._currentSpawnInterval;
        }
    }

    private _startGame(): void {
        if (this._isSpawning) return;
        this._isSpawning = true;
        this._isGameActive = true;
        this._currentSpawnInterval = GameConfig.ENEMY.SPAWN_INTERVAL;
        this._spawnTimer = this._currentSpawnInterval;
    }

    private _stopGame(): void {
        this._isSpawning = false;
        this._isGameActive = false;
    }

    private _onGamePaused(): void {
        this._isGameActive = false;
    }

    private _onGameResumed(): void {
        this._isGameActive = true;
    }

    private _spawnEnemy(): void {
        if (!this.enemyPrefab || !this.enemyContainer) return;

        const enemyNode =
            this._enemyPool.size() > 0
                ? this._enemyPool.get()!
                : instantiate(this.enemyPrefab);

        this.enemyContainer.addChild(enemyNode);

        const visibleSize = view.getVisibleSize();
        const spawnX = visibleSize.width / 2 + GameConfig.ENEMY.SPAWN_OFFSET;
        const spawnY = math.randomRange(
            -(visibleSize.height / 2 - GameConfig.ENEMY.SPAWN_OFFSET),
            visibleSize.height / 2 - GameConfig.ENEMY.SPAWN_OFFSET,
        );

        const speed = math.randomRange(
            GameConfig.ENEMY.SPEED_MIN,
            GameConfig.ENEMY.SPEED_MAX,
        );
        enemyNode
            .getComponent(EnemyBrain)
            ?.spawn(new Vec3(spawnX, spawnY, 0), speed);
    }

    private _onReturnEnemy(enemyNode: Node): void {
        if (enemyNode?.isValid) {
            this._enemyPool.put(enemyNode);
        }
    }
}
