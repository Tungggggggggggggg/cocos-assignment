import { GameEventMap, GameEventKey } from "./GameEvents";

type Listener<K extends GameEventKey> = (
    payload: GameEventMap[K]
) => void;

type ListenerEntry = {
    fn: Function;
    ctx: unknown;
    once: boolean;
};

export class TypedEventEmitter {
    private readonly _listeners = new Map<string, ListenerEntry[]>();

    on<K extends GameEventKey>(
        event: K,
        fn: Listener<K>,
        ctx?: unknown
    ): this {
        const list = this._listeners.get(event) ?? [];
        list.push({ fn, ctx, once: false });
        this._listeners.set(event, list);
        return this;
    }

    once<K extends GameEventKey>(
        event: K,
        fn: Listener<K>,
        ctx?: unknown
    ): this {
        const list = this._listeners.get(event) ?? [];
        list.push({ fn, ctx, once: true });
        this._listeners.set(event, list);
        return this;
    }

    off<K extends GameEventKey>(
        event: K,
        fn: Listener<K>,
        ctx?: unknown
    ): this {
        const list = this._listeners.get(event);
        if (!list) return this;
        this._listeners.set(
            event,
            list.filter(e => e.fn !== fn || e.ctx !== ctx)
        );
        return this;
    }

    emit<K extends GameEventKey>(
        event: K,
        ...args: GameEventMap[K] extends void ? [] : [GameEventMap[K]]
    ): this {
        const list = this._listeners.get(event);
        if (!list) return this;

        const payload = args[0];
        const remaining: ListenerEntry[] = [];

        for (const entry of list) {
            entry.fn.call(entry.ctx, payload);
            if (!entry.once) remaining.push(entry);
        }

        this._listeners.set(event, remaining);
        return this;
    }

    // Dùng khi component bị destroy — xóa toàn bộ listener của một context
    offAll(ctx: unknown): this {
        for (const [event, list] of this._listeners) {
            this._listeners.set(
                event,
                list.filter(e => e.ctx !== ctx)
            );
        }
        return this;
    }
}

// Singleton export — dùng như EventManager cũ nhưng có type
export const GameBus = new TypedEventEmitter();