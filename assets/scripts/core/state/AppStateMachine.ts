import StateMachine from "javascript-state-machine";
import { AppState } from "./AppState";

export const AppTransition = {
    BOOT_TO_LOBBY: "bootToLobby",
    PLAY: "play",
    ENTER_LOBBY: "enterLobby",
    ENTER_GAME: "enterGame",
    REPLAY: "replay",
    QUIT_TO_LOBBY: "quitToLobby",
} as const;

export type AppTransitionKey =
    (typeof AppTransition)[keyof typeof AppTransition];

export interface AppFsmCallbacks {
    onEnterLoading(
        transition: AppTransitionKey,
        from: AppState,
        to: AppState,
    ): void;
    onEnterLobby(
        transition: AppTransitionKey,
        from: AppState,
        to: AppState,
    ): void;
    onEnterGame(
        transition: AppTransitionKey,
        from: AppState,
        to: AppState,
    ): void;
}

interface InternalFsm {
    state: string;
    bootToLobby(): void;
    play(): void;
    enterLobby(): void;
    enterGame(): void;
    replay(): void;
    quitToLobby(): void;
    can(transition: string): boolean;
    is(state: string): boolean;
}

export class AppStateMachine {
    private readonly _fsm: InternalFsm;

    constructor(callbacks: AppFsmCallbacks) {
        this._fsm = new StateMachine({
            init: AppState.Boot,

            transitions: [
                {
                    name: AppTransition.BOOT_TO_LOBBY,
                    from: AppState.Boot,
                    to: AppState.Loading,
                },
                {
                    name: AppTransition.ENTER_LOBBY,
                    from: AppState.Loading,
                    to: AppState.Lobby,
                },
                {
                    name: AppTransition.PLAY,
                    from: AppState.Lobby,
                    to: AppState.Loading,
                },
                {
                    name: AppTransition.ENTER_GAME,
                    from: AppState.Loading,
                    to: AppState.Game,
                },
                {
                    name: AppTransition.REPLAY,
                    from: AppState.Game,
                    to: AppState.Loading,
                },
                {
                    name: AppTransition.QUIT_TO_LOBBY,
                    from: AppState.Game,
                    to: AppState.Loading,
                },
            ],

            methods: {
                onEnterLoading: (lifecycle: {
                    transition: AppTransitionKey;
                    from: AppState;
                    to: AppState;
                }) => {
                    callbacks.onEnterLoading(
                        lifecycle.transition,
                        lifecycle.from,
                        lifecycle.to,
                    );
                },
                onEnterLobby: (lifecycle: {
                    transition: AppTransitionKey;
                    from: AppState;
                    to: AppState;
                }) => {
                    callbacks.onEnterLobby(
                        lifecycle.transition,
                        lifecycle.from,
                        lifecycle.to,
                    );
                },
                onEnterGame: (lifecycle: {
                    transition: AppTransitionKey;
                    from: AppState;
                    to: AppState;
                }) => {
                    callbacks.onEnterGame(
                        lifecycle.transition,
                        lifecycle.from,
                        lifecycle.to,
                    );
                },
            },
        }) as unknown as InternalFsm;
    }

    get currentState(): AppState {
        return this._fsm.state as AppState;
    }

    bootToLobby(): void {
        if (this._fsm.can(AppTransition.BOOT_TO_LOBBY)) this._fsm.bootToLobby();
    }

    enterLobby(): void {
        if (this._fsm.can(AppTransition.ENTER_LOBBY)) this._fsm.enterLobby();
    }

    play(): void {
        if (this._fsm.can(AppTransition.PLAY)) this._fsm.play();
    }

    enterGame(): void {
        if (this._fsm.can(AppTransition.ENTER_GAME)) this._fsm.enterGame();
    }

    replay(): void {
        if (this._fsm.can(AppTransition.REPLAY)) this._fsm.replay();
    }

    quitToLobby(): void {
        if (this._fsm.can(AppTransition.QUIT_TO_LOBBY)) this._fsm.quitToLobby();
    }

    is(state: AppState): boolean {
        return this._fsm.is(state);
    }
}
