package nexus

// LobbyGameStartEvent is an event for starting a game.
type LobbyGameStartEvent struct {
	Lobby *Lobby

	*LobbyEvent
	LobbyEventLeader
	LobbyEventBroadcastable
}

// Execute runs the GameLobbyStartEvent.
func (e *LobbyGameStartEvent) Execute() {
	// set game to started
	e.Lobby.Game.Started = true
}
