import {
    Node,
    Vec3,
    Vec2,
    instantiate,
    Prefab,
    UITransform,
    Collider2D,
    Contact2DType,
    RigidBody2D,
} from "cc";
import { SkillBase } from "./SkillBase";
import { GameBus } from "../core/events/EventEmitter";
import { EnemyController } from "../enemy/EnemyController";

export class BombSkill extends SkillBase {
    readonly skillId = "bomb";
    readonly cooldownMs = 5_000;
    readonly isPassive = false;

    private static readonly BOMB_DAMAGE = 80;
    private static readonly BLAST_RADIUS = 200;
    private static readonly BOMB_SPEED = 500;
    private static readonly FUSE_TIME_S = 2.0;

    private readonly _playerNode: Node;
    private readonly _container: Node;
    private readonly _enemyContainer: Node;
    private readonly _bombPrefab: Prefab;

    constructor(
        playerNode: Node,
        bulletContainer: Node,
        enemyContainer: Node,
        bombPrefab: Prefab,
    ) {
        super();
        this._playerNode = playerNode;
        this._container = bulletContainer;
        this._enemyContainer = enemyContainer;
        this._bombPrefab = bombPrefab;
    }

    protected onActivate(): void {
        const bombNode = instantiate(this._bombPrefab);
        if (!bombNode) {
            return;
        }

        this._container.addChild(bombNode);
        bombNode.active = true;

        const playerWorld = this._playerNode.worldPosition.clone();
        const ui = this._container.getComponent(UITransform);
        const localPos = ui
            ? ui.convertToNodeSpaceAR(playerWorld)
            : playerWorld.clone();
        bombNode.setPosition(localPos);

        const dirX = this._playerNode.scale.x >= 0 ? 1 : -1;

        const rb = bombNode.getComponent(RigidBody2D);
        if (rb) {
            rb.wakeUp();
            rb.linearVelocity = new Vec2(dirX * BombSkill.BOMB_SPEED, 0);
        }

        GameBus.emit("sound:play-sfx");

        let exploded = false;
        const explode = () => {
            if (exploded || !bombNode.isValid) return;
            exploded = true;
            if (rb) rb.linearVelocity = Vec2.ZERO;
            const worldPos = bombNode.worldPosition.clone();
            bombNode.destroy();
            this._doExplosion(worldPos);
        };

        const timer = setTimeout(explode, BombSkill.FUSE_TIME_S * 1_000);
        bombNode.once(Node.EventType.NODE_DESTROYED, () => clearTimeout(timer));

        const col = bombNode.getComponent(Collider2D);
        if (col) {
            col.on(Contact2DType.BEGIN_CONTACT, explode, bombNode);
        }
    }

    protected onCooldownEnd(): void {}

    private _doExplosion(worldPos: Vec3): void {
        const radiusSq = BombSkill.BLAST_RADIUS * BombSkill.BLAST_RADIUS;
        let hitCount = 0;

        for (const child of this._enemyContainer.children) {
            if (!child.isValid || !child.active) continue;

            const ctrl = child.getComponent(EnemyController);
            if (!ctrl) continue;

            const distSq = Vec3.squaredDistance(worldPos, child.worldPosition);
            if (distSq > radiusSq) continue;

            const ratio = 1 - Math.sqrt(distSq) / BombSkill.BLAST_RADIUS;
            const dmg = Math.round(BombSkill.BOMB_DAMAGE * (0.5 + ratio * 0.5));

            ctrl.takeDamageExternal(dmg);
            GameBus.emit("enemy:damage-taken", {
                amount: dmg,
                worldPosition: child.worldPosition.clone(),
            });
            hitCount++;
        }

        GameBus.emit("sound:play-sfx");
    }
}
