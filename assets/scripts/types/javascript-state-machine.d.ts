declare module "javascript-state-machine" {
    interface TransitionConfig {
        name: string;
        from: string | string[];
        to: string | ((...args: unknown[]) => string);
    }

    interface LifecycleObject {
        transition: string;
        from: string;
        to: string;
    }

    type LifecycleMethod = (
        lifecycle: LifecycleObject,
        ...args: unknown[]
    ) => void;

    interface StateMachineConfig {
        init?: string;
        transitions?: TransitionConfig[];
        data?: Record<string, unknown>;
        methods?: Record<
            string,
            LifecycleMethod | ((...args: unknown[]) => unknown)
        >;
    }

    class StateMachine {
        constructor(config: StateMachineConfig);

        state: string;

        is(state: string): boolean;
        can(transition: string): boolean;
        cannot(transition: string): boolean;
        allStates(): string[];
        allTransitions(): string[];
        transitions(): string[];

        [key: string]: unknown;
    }

    export default StateMachine;
}
