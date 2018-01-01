package nexus

// event to promote a new player to leader
type LobbyPromoteEvent struct {
    Lobby  *Lobby
    Player *Player

    *LobbyEvent
    LobbyEventLeader
    LobbyEventBroadcastable
}

// promote event data
type LobbyPromoteData struct {
    UserID string `json:"userId"`
}

// create new lobby promote event
func (l *Lobby) NewLobbyPromoteEvent(userID string) ([]byte, error) {
    // create event
    event := &LobbyPromoteEvent{
        LobbyEvent: &LobbyEvent{
            Name: "LOBBY_PROMOTE",
            Data: &LobbyPromoteData{
                UserID: userID,
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

// execute player promote
func (e *LobbyPromoteEvent) Execute() {
    data := e.Event().Data.(map[string]interface{})
    e.Lobby.LeaderID = data["userId"].(string)
}