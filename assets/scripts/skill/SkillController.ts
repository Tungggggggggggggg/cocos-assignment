import { _decorator, Component, input, Input, EventKeyboard, KeyCode } from "cc";
import { ISkill } from "./ISkill";
import { DashSkill } from "./DashSkill";
import { GameBus } from "../core/events/EventEmitter";

const { ccclass } = _decorator;

@ccclass("SkillController")
export class SkillController extends Component {
    private readonly _skills: Map<KeyCode, ISkill> = new Map();
    private _alive = false;

    protected onLoad(): void {
        this._skills.set(KeyCode.KEY_Q, new DashSkill(this.node));
    }

    protected onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        GameBus.on("player:ready", () => (this._alive = true), this);
        GameBus.on("game:over", () => (this._alive = false), this);
        GameBus.on("game:won", () => (this._alive = false), this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        GameBus.offAll(this);
    }

    protected update(dt: number): void {
        if (!this._alive) return;
        for (const skill of this._skills.values()) {
            skill.update(dt);
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