import { _decorator, Component } from "cc";
const { ccclass } = _decorator;

@ccclass("Health")
export class Health extends Component {
    private _maxHealth = 0;
    private _currentHealth = 0;
    private _isAlive = false;

    get currentHealth(): number {
        return this._currentHealth;
    }
    get maxHealth(): number {
        return this._maxHealth;
    }
    get isAlive(): boolean {
        return this._isAlive;
    }

    init(maxHealth: number): void {
        this._maxHealth = maxHealth;
        this._currentHealth = maxHealth;
        this._isAlive = true;
        this.node.emit("health-changed", this._currentHealth, this._maxHealth);
    }

    takeDamage(amount: number): void {
        if (!this._isAlive) return;
        this._currentHealth = Math.max(0, this._currentHealth - amount);
        this.node.emit("health-changed", this._currentHealth, this._maxHealth);
        if (this._currentHealth <= 0) {
            this._isAlive = false;
            this.node.emit("died");
        }
    }

    heal(amount: number): void {
        if (!this._isAlive) return;
        this._currentHealth = Math.min(
            this._maxHealth,
            this._currentHealth + amount,
        );
        this.node.emit("health-changed", this._currentHealth, this._maxHealth);
    }
}
