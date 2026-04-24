import { _decorator, Component } from "cc";
const { ccclass } = _decorator;

@ccclass("Health")
export class Health extends Component {
    private _maxHealth: number = 100;
    private _currentHealth: number = 0;
    private _isAlive: boolean = false;

    public init(maxHealth: number) {
        this._maxHealth = maxHealth;
        this._currentHealth = maxHealth;
        this._isAlive = true;
    }

    public takeDamage(amount: number) {
        if (!this._isAlive) return;

        this._currentHealth -= amount;

        this.node.emit("health-changed", this._currentHealth, this._maxHealth);

        if (this._currentHealth <= 0) {
            this._isAlive = false;
            this.node.emit("died");
        }
    }
}
