import { _decorator, Component, Node, Vec3, game } from "cc";
import { BulletManager } from "../managers/BulletManager";
import { GameConfig } from "../configs/GameConfig";
const { ccclass, property } = _decorator;

@ccclass("PlayerWeapon")
export class PlayerWeapon extends Component {
    @property(Node)
    private readonly muzzleNode: Node | null = null;

    private _lastFireTime: number = 0;
    private _fireRateMs: number = GameConfig.PLAYER.FIRE_RATE_MS;
    private readonly _spawnDir: Vec3 = new Vec3();

    protected onEnable() {
        this.node.on("input-shoot", this.onShootInput, this);
    }

    protected onDisable() {
        this.node.off("input-shoot", this.onShootInput, this);
    }

    private onShootInput() {
        const now = game.totalTime;
        if (now - this._lastFireTime < this._fireRateMs) {
            return;
        }
        this._lastFireTime = now;

        const muzzlePos = this.muzzleNode
            ? this.muzzleNode.worldPosition
            : this.node.worldPosition;
        const dirX = this.node.scale.x > 0 ? 1 : -1;
        this._spawnDir.set(dirX, 0, 0);

        if (BulletManager.instance) {
            BulletManager.instance.spawnBullet(muzzlePos, this._spawnDir);
        }
    }
}
