package nexus

// game start event
type LobbyGameStartEvent struct {
    Lobby  *Lobby

    *LobbyEvent
    LobbyEventLeader
    LobbyEventBroadcastable
}

// execute game start event
func (e *LobbyGameStartEvent) Execute() {
    // set game to started
    e.Lobby.Game.Started = true
}