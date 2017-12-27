package nexus

// part event
type LobbyPartEvent struct {
    Lobby  *Lobby
    Player *Player

    *LobbyEvent
    LobbyEventPleb
}

// part event data
type LobbyPartData struct {
    UserID string `json:"userId"`
}

// execute player part
func (e *LobbyPartEvent) Execute() {
    isLeader := e.Player.IsLeader()
    playersCount := len(e.Lobby.Players)

    // check if we need to handle assigning a new leader
    if (isLeader && playersCount > 1) {
        e.Lobby.AssignNewLeaderExcept(e.Player)
    }

    // update event data to include user id
    e.Event().Data = &LobbyPartData{
        UserID: e.Player.ID,
    }
    
    // close player connection
    e.Lobby.PlayerClose(e.Player)
}
