import { _decorator, Component, input, Input, EventKeyboard, KeyCode, Node, Prefab } from "cc";
import { ISkill } from "./ISkill";
import { BombSkill } from "./BombSkill";
import { GameBus } from "../core/events/EventEmitter";

const { ccclass, property } = _decorator;

@ccclass("SkillController")
export class SkillController extends Component {
    @property(Node)
    public bulletContainer: Node | null = null;

    @property(Node)
    public enemyContainer: Node | null = null;

    @property(Prefab)
    public bombPrefab: Prefab | null = null;

    private readonly _skills: Map<KeyCode, ISkill> = new Map();
    private _alive = false;

    protected onLoad(): void {
        if (this.bulletContainer && this.enemyContainer && this.bombPrefab) {
            this._skills.set(
                KeyCode.KEY_Q,
                new BombSkill(
                    this.node,
                    this.bulletContainer,
                    this.enemyContainer,
                    this.bombPrefab,
                )
            );
        }
    }

    protected onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        GameBus.on("player:ready", () => (this._alive = true), this);
        GameBus.on("game:over", () => (this._alive = false), this);
        GameBus.on("game:won", () => (this._alive = false), this);
        GameBus.on("game:paused", () => (this._alive = false), this);
        GameBus.on("game:resumed", () => (this._alive = true), this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        GameBus.offAll(this);
    }

    protected update(_dt: number): void {
        for (const skill of this._skills.values()) {
            skill.update(_dt);
        }

        const bomb = this._skills.get(KeyCode.KEY_Q);
        if (bomb) {
            GameBus.emit("skill:cooldown-update", {
                skillId: bomb.skillId,
                ratio: bomb.cooldownRatio,
                cooldownMs: bomb.cooldownMs,
            });
        }
    }

    public equipSkill(key: KeyCode, skill: ISkill): void {
        this._skills.set(key, skill);
    }

    private _onKeyDown(e: EventKeyboard): void {
        if (!this._alive) return;
        const skill = this._skills.get(e.keyCode);
        skill?.activate();
    }
}