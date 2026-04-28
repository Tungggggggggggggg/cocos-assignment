import { _decorator, Component } from "cc";
const { ccclass } = _decorator;

@ccclass("Health")
export class Health extends Component {
    private _maxHealth: number = 0;
    private _currentHealth: number = 0;
    private _isAlive: boolean = false;

    public get currentHealth(): number {
        return this._currentHealth;
    }
    public get maxHealth(): number {
        return this._maxHealth;
    }
    public get isAlive(): boolean {
        return this._isAlive;
    }

    public init(maxHealth: number): void {
        this._maxHealth = maxHealth;
        this._currentHealth = maxHealth;
        this._isAlive = true;
        this.node.emit("health-changed", this._currentHealth, this._maxHealth);
    }

    public takeDamage(amount: number): void {
        if (!this._isAlive) return;

        this._currentHealth = Math.max(0, this._currentHealth - amount);
        this.node.emit("health-changed", this._currentHealth, this._maxHealth);

        if (this._currentHealth <= 0) {
            this._isAlive = false;
            this.node.emit("died");
        }
    }

    public heal(amount: number): void {
        if (!this._isAlive) return;

        this._currentHealth = Math.min(
            this._maxHealth,
            this._currentHealth + amount,
        );
        this.node.emit("health-changed", this._currentHealth, this._maxHealth);
    }
}
