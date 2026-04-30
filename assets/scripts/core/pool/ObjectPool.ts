export interface Poolable {
    onBorrow(): void;   // Gọi khi lấy ra khỏi pool
    onReturn(): void;   // Gọi khi trả về pool
}

export class ObjectPool<T extends Poolable> {
    private readonly _pool: T[] = [];
    private readonly _factory: () => T;
    private readonly _maxSize: number;

    constructor(factory: () => T, maxSize = 50) {
        this._factory = factory;
        this._maxSize = maxSize;
    }

    borrow(): T {
        const obj = this._pool.pop() ?? this._factory();
        obj.onBorrow();
        return obj;
    }

    return(obj: T): void {
        if (this._pool.length >= this._maxSize) return;
        obj.onReturn();
        this._pool.push(obj);
    }

    get size(): number {
        return this._pool.length;
    }

    clear(): void {
        this._pool.length = 0;
    }
}