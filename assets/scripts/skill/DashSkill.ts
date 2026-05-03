import { Node, Vec3, tween } from "cc";
import { SkillBase } from "./SkillBase";
import { GameBus } from "../core/events/EventEmitter";

export class DashSkill extends SkillBase {
    readonly skillId = "dash";
    readonly cooldownMs = 2000;
    readonly isPassive = false;

    private readonly DASH_DISTANCE = 200;
    private readonly DASH_DURATION = 0.15;

    private _playerNode: Node;
    private _isDashing = false;

    constructor(playerNode: Node) {
        super();
        this._playerNode = playerNode;
    }

    protected onActivate(): void {
        if (this._isDashing) return;
        this._isDashing = true;

        const dirX = this._playerNode.scale.x > 0 ? 1 : -1;
        const current = this._playerNode.position.clone();
        const target = new Vec3(
            current.x + dirX * this.DASH_DISTANCE,
            current.y,
            0,
        );

        tween(this._playerNode)
            .to(this.DASH_DURATION, { position: target }, { easing: "quadOut" })
            .call(() => {
                this._isDashing = false;
                GameBus.emit("sound:play-sfx");
            })
            .start();
    }

    protected onCooldownEnd(): void {}
}
