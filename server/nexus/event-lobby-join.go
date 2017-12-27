package nexus

// join event
type LobbyJoinEvent struct {
    Lobby *Lobby

    *LobbyEvent
    LobbyEventPleb
}

// join data
type LobbyJoinData struct {
    Player *LobbyPlayer `json:"player"`
}

// create new lobby init event
func (l *Lobby) NewLobbyJoinEvent(player *Player) ([]byte, error) {
    // create event
    event := &LobbyJoinEvent{
        LobbyEvent: &LobbyEvent{
            Name: "LOBBY_JOIN",
            Data: &LobbyJoinData{
                Player: &LobbyPlayer{
                    UserID:   player.ID,
                    Username: player.Username,
                    IsLeader: false,
                },
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
