export const SceneName = {
    Loading: "Loading",
    Lobby: "Lobby",
    Game: "Game",
} as const;

export type SceneNameKey = (typeof SceneName)[keyof typeof SceneName];
