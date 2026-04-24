import { _decorator, Component, Node, Vec3 } from "cc";
import { BulletManager } from "../managers/BulletManager";
const { ccclass, property } = _decorator;

@ccclass("PlayerWeapon")
export class PlayerWeapon extends Component {
    @property(Node)
    private muzzleNode: Node = null;

    onEnable() {
        this.node.on("input-shoot", this.onShootInput, this);
    }

    onDisable() {
        this.node.off("input-shoot", this.onShootInput, this);
    }

    private onShootInput() {
        const muzzlePos = this.muzzleNode
            ? this.muzzleNode.worldPosition
            : this.node.worldPosition;
        const dirX = this.node.scale.x > 0 ? 1 : -1;

        if (BulletManager.instance) {
            BulletManager.instance.spawnBullet(muzzlePos, new Vec3(dirX, 0, 0));
        }
    }
}
