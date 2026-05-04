export interface ISkill {
    readonly skillId: string;
    readonly cooldownMs: number;
    readonly isPassive: boolean;
    activate(): boolean;
    update(dt: number): void;
    readonly cooldownRatio: number;
}
