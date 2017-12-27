package nexus

// part event
type LobbyPartEvent struct {
    Lobby  *Lobby
    Player *Player

    *LobbyEvent
    LobbyEventPleb
}

// execute player part
func (e *LobbyPartEvent) Execute() {
    isLeader := e.Player.IsLeader()
    playersCount := len(e.Lobby.Players)

    // check if we need to handle assigning a new leader
    if (isLeader && playersCount > 1) {
        e.Lobby.AssignNewLeaderExcept(e.Player)
    }

    // close player connection
    e.Lobby.PlayerClose(e.Player)
}
