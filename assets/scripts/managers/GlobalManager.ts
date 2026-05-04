import { _decorator, Component, director } from "cc";
import {
    AppFsmCallbacks,
    AppStateMachine,
    AppTransition,
    AppTransitionKey,
} from "../core/state/AppStateMachine";
import { AppState } from "../core/state/AppState";
import { SceneName } from "../core/state/SceneName";

const { ccclass } = _decorator;

@ccclass("GlobalManager")
export class GlobalManager extends Component implements AppFsmCallbacks {
    public static instance: GlobalManager | null = null;

    private _pendingScene: string = SceneName.Lobby;
    private _targetScene: string = "";
    private _isLoadingCompleteHandled = false;

    private _fsm!: AppStateMachine;

    protected onLoad(): void {
        if (GlobalManager.instance !== null) {
            this.node.destroy();
            return;
        }

        GlobalManager.instance = this;
        director.addPersistRootNode(this.node);

        this._fsm = new AppStateMachine(this);

        this._fsm.bootToLobby();
    }

    protected onDestroy(): void {
        if (GlobalManager.instance === this) {
            GlobalManager.instance = null;
        }
    }

    onEnterLoading(
        transition: AppTransitionKey,
        _from: AppState,
        _to: AppState,
    ): void {
        switch (transition) {
            case AppTransition.BOOT_TO_LOBBY:
            case AppTransition.QUIT_TO_LOBBY:
                this._pendingScene = SceneName.Lobby;
                break;
            case AppTransition.PLAY:
            case AppTransition.REPLAY:
                this._pendingScene = SceneName.Game;
                break;
            default:
                this._pendingScene = SceneName.Lobby;
        }
        if (this._targetScene === SceneName.Loading) return;
        if (director.getScene()?.name !== SceneName.Loading) {
            this._targetScene = SceneName.Loading;
            director.loadScene(SceneName.Loading);
        }
    }

    onEnterLobby(
        _transition: AppTransitionKey,
        _from: AppState,
        _to: AppState,
    ): void {
        if (this._targetScene === SceneName.Lobby) return;
        if (director.getScene()?.name !== SceneName.Lobby) {
            this._targetScene = SceneName.Lobby;
            director.loadScene(SceneName.Lobby);
        }
    }

    onEnterGame(
        _transition: AppTransitionKey,
        _from: AppState,
        _to: AppState,
    ): void {
        if (this._targetScene === SceneName.Game) return;
        if (director.getScene()?.name !== SceneName.Game) {
            this._targetScene = SceneName.Game;
            director.loadScene(SceneName.Game);
        }
    }

    public onLoadingComplete(): void {
        if (this._isLoadingCompleteHandled) return;
        this._isLoadingCompleteHandled = true;

        if (this._pendingScene === SceneName.Lobby) {
            this._fsm.enterLobby();
        } else {
            this._fsm.enterGame();
        }
    }

    public onPlayRequested(): void {
        this._isLoadingCompleteHandled = false;
        this._fsm.play();
    }

    public onReplayRequested(): void {
        this._isLoadingCompleteHandled = false;
        this._fsm.replay();
    }

    public onQuitToLobbyRequested(): void {
        this._isLoadingCompleteHandled = false;
        this._fsm.quitToLobby();
    }

    public get pendingScene(): string {
        return this._pendingScene;
    }

    public get appState(): AppState {
        return this._fsm.currentState;
    }
}
