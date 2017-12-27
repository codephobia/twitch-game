package nexus

// lock event
type LobbyLockEvent struct {
    Lobby  *Lobby

    *LobbyEvent
    LobbyEventLeader
}

// execute lock event
func (e *LobbyLockEvent) Execute() {
    data := e.Event().Data.(map[string]interface{})
    e.Lobby.Locked = data["locked"].(bool)
}