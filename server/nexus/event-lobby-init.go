package nexus

// init event
type LobbyInitEvent struct {
    Lobby *Lobby
    
    *LobbyEvent
    LobbyEventApp
}

// lobby init data
type LobbyInitData struct {
    LobbyName string        `json:"lobbyName"`
    LobbyCode string        `json:"lobbyCode"`
    Players  []*LobbyPlayer `json:"players"`
    Locked   bool           `json:"locked"`
    Public   bool           `json:"public"`
    Game     *Game          `json:"game"`
}

// create new lobby init event
func (l *Lobby) NewLobbyInitEvent() ([]byte, error) {
    // get players
    players := l.GetPlayersData()
    
    // create event
    event := &LobbyInitEvent{
        LobbyEvent: &LobbyEvent{
            Name: "LOBBY_INIT",
            Data: &LobbyInitData{
                LobbyName: l.Name,
                LobbyCode: l.Code,
                Players: players,
                Locked: l.Locked,
                Public: l.Public,
                Game: l.Game,
            },
        },
    }
    
    // generate message
    message, err := event.Event().Generate()
    if err != nil {
        return nil, err
    }
    
    // return event string
    return message, nil
}