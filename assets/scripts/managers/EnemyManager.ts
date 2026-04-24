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
import { EnemyBrain } from "../controllers/EnemyBrain";
import { EventManager } from "./EventManager";
import { EventName, GameConfig } from "../configs/GameConfig";
const { ccclass, property } = _decorator;

@ccclass("EnemyManager")
export class EnemyManager extends Component {
    @property(Prefab)
    private enemyPrefab: Prefab = null;

    @property(Node)
    private enemyContainer: Node = null;

    private _enemyPool: NodePool = new NodePool();
    private _isSpawning: boolean = false;

    onEnable() {
        EventManager.on(EventName.GAME_START, this.startGame, this);
        EventManager.on(EventName.GAME_OVER, this.stopGame, this);
        EventManager.on(EventName.RETURN_ENEMY, this.onReturnEnemy, this);
    }

    onDisable() {
        EventManager.off(EventName.GAME_START, this.startGame, this);
        EventManager.off(EventName.GAME_OVER, this.stopGame, this);
        EventManager.off(EventName.RETURN_ENEMY, this.onReturnEnemy, this);
    }

    start() {
        this.startGame();
    }

    private startGame() {
        if (this._isSpawning) return;
        this._isSpawning = true;
        this.schedule(this.spawnEnemy, GameConfig.ENEMY.SPAWN_INTERVAL);
    }

    private stopGame() {
        this._isSpawning = false;
        this.unschedule(this.spawnEnemy);
    }

    private spawnEnemy() {
        if (!this._isSpawning || !this.enemyPrefab || !this.enemyContainer)
            return;

        const enemyNode =
            this._enemyPool.size() > 0
                ? this._enemyPool.get()
                : instantiate(this.enemyPrefab);
        this.enemyContainer.addChild(enemyNode);

        const visibleSize = view.getVisibleSize();
        const spawnX = visibleSize.width / 2 + 100;
        const spawnY = (Math.random() - 0.5) * (visibleSize.height - 200);

        const enemyBrain = enemyNode.getComponent(EnemyBrain);
        if (enemyBrain) {
            const minSpeed = GameConfig.ENEMY.SPEED_MIN;
            const maxSpeed = GameConfig.ENEMY.SPEED_MAX;
            const randomSpeed =
                minSpeed + Math.random() * (maxSpeed - minSpeed);

            enemyBrain.spawn(new Vec3(spawnX, spawnY, 0), randomSpeed);
        }
    }

    private onReturnEnemy(enemyNode: Node) {
        if (enemyNode && enemyNode.isValid) {
            this._enemyPool.put(enemyNode);
        }
    }
}
