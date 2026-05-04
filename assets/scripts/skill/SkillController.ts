import {
    _decorator,
    Component,
    input,
    Input,
    EventKeyboard,
    KeyCode,
    Node,
    Prefab,
} from "cc";
import { ISkill } from "./ISkill";
import { BombSkill } from "./BombSkill";
import { GameBus } from "../core/events/EventEmitter";
import { InputConfig } from "../data/InputConfig";

const { ccclass, property } = _decorator;

@ccclass("SkillController")
export class SkillController extends Component {
    @property(Node)
    private readonly playerNode: Node | null = null;

    @property(Node)
    private readonly bulletContainer: Node | null = null;

    @property(Node)
    private readonly enemyContainer: Node | null = null;

    @property(Prefab)
    private readonly bombPrefab: Prefab | null = null;

    private readonly _skills = new Map<KeyCode, ISkill>();
    private _alive = false;

    protected onLoad(): void {
        this._buildSkills();
    }

    protected onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);

        GameBus.on(
            "player:ready",
            () => {
                this._alive = true;
            },
            this,
        );
        GameBus.on(
            "game:over",
            () => {
                this._alive = false;
            },
            this,
        );
        GameBus.on(
            "game:won",
            () => {
                this._alive = false;
            },
            this,
        );
        GameBus.on(
            "game:paused",
            () => {
                this._alive = false;
            },
            this,
        );
        GameBus.on(
            "game:resumed",
            () => {
                this._alive = true;
            },
            this,
        );
    }

    protected onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        GameBus.offAll(this);
    }

    protected update(dt: number): void {
        for (const skill of this._skills.values()) {
            skill.update(dt);
        }

        const bomb = this._skills.get(InputConfig.SKILL_BOMB);
        if (bomb) {
            GameBus.emit("skill:cooldown-update", {
                skillId: bomb.skillId,
                ratio: bomb.cooldownRatio,
                cooldownMs: bomb.cooldownMs,
            });
        }
    }

    private _buildSkills(): void {
        if (
            !this.playerNode ||
            !this.bulletContainer ||
            !this.enemyContainer ||
            !this.bombPrefab
        ) {
            return;
        }

        this._skills.set(
            InputConfig.SKILL_BOMB,
            new BombSkill(
                this.playerNode,
                this.bulletContainer,
                this.enemyContainer,
                this.bombPrefab,
            ),
        );
    }

    private _onKeyDown(e: EventKeyboard): void {
        if (!this._alive) return;
        this._skills.get(e.keyCode)?.activate();
    }
}
