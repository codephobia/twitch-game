package nexus

// part event
type LobbyPartEvent struct {
    Lobby  *Lobby
    Player *Player

    *LobbyEvent
    LobbyEventPleb
    LobbyEventNotBroadcastable
}

// part event data
type LobbyPartData struct {
    UserID string `json:"userId"`
}

// create new lobby part event
func (l *Lobby) NewLobbyPartEvent(p *Player) ([]byte, error) {
    // create event
    event := &LobbyPartEvent{
        Lobby: l,
        Player: p,
        LobbyEvent: &LobbyEvent{
            Name: "LOBBY_PART",
            Data: &LobbyPartData{
                UserID: p.ID,
            },
        },
    }
    
    // execute the event
    event.Execute()
    
    // generate message
    message, err := event.Event().Generate()
    if err != nil {
        return nil, err
    }
    
    // return event string
    return message, nil
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
}

