package nexus

// game draw event
type LobbyGameDrawEvent struct {
    Lobby  *Lobby
    Player *Player

    *LobbyEvent
    LobbyEventPleb
    LobbyEventBroadcastable
}

type LobbyGameDrawData struct {
    UserID string      `json:"userId"`
    Click  interface{} `json:"click"`
}

// execute game draw event
func (e *LobbyGameDrawEvent) Execute() {
    // get draw event click data
    click := e.Event().Data
    
    // extend draw event to include user id
    e.Event().Data = &LobbyGameDrawData{
        UserID: e.Player.ID,
        Click: click,
    }
}