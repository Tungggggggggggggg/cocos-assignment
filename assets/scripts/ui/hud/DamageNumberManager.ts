import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from "cc";
import { GameBus } from "../../core/events/EventEmitter";
import { DamageNumber } from "./DamageNumber";

const { ccclass, property } = _decorator;

@ccclass("DamageNumberManager")
export class DamageNumberManager extends Component {
    @property(Prefab)
    public damageNumberPrefab: Prefab | null = null;

    @property(Node)
    public container: Node | null = null;

    private readonly _pool: Node[] = [];

    protected onEnable(): void {
        GameBus.on("enemy:damage-taken", this._onDamageTaken, this);
    }

    protected onDisable(): void {
        GameBus.offAll(this);
    }

    protected onDestroy(): void {
        this._pool.length = 0;
    }

    private _onDamageTaken(p: { amount: number; worldPosition: Vec3 }): void {
        if (!this.damageNumberPrefab || !this.container) return;

        const node = this._borrow();
        this.container.addChild(node);
        node.active = true;

        const comp = node.getComponent(DamageNumber);
        if (!comp) {
            return;
        }

        comp.init(p.amount, p.worldPosition, () => {
            node.removeFromParent();
            node.active = false;
            this._pool.push(node);
        });
    }

    private _borrow(): Node {
        return this._pool.pop() ?? instantiate(this.damageNumberPrefab!);
    }
}
