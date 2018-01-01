package nexus

import (
    "log"
)

// kick event
type LobbyKickEvent struct {
    Lobby  *Lobby
    Player *Player
    
    *LobbyEvent
    LobbyEventLeader
    LobbyEventBroadcastable
}

// kick event data
type LobbyKickData struct {
    UserID string `json:"userId"`
}

// create new lobby promote event
func (l *Lobby) NewLobbyKickEvent(userID string) ([]byte, error) {
    // create event
    event := &LobbyKickEvent{
        LobbyEvent: &LobbyEvent{
            Name: "LOBBY_KICK",
            Data: &LobbyKickData{
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

// execute kick event
func (e *LobbyKickEvent) Execute() {
    // get kick data
    data := e.Event().Data.(map[string]interface{})
    userID := data["userId"].(string)
    
    // find player to kick
    player, err := e.Lobby.GetPlayerByID(userID)
    if err != nil {
        // log error
        log.Printf("[ERROR] lobby kick event: ", err)
        return
    }
    
    // set player to kicked
    player.Kicked = true
    
    // create kick event
    kickEvent, err := e.Lobby.NewLobbyKickEvent(player.ID)
    if err != nil {
        // log error
        log.Printf("[ERROR] lobby kick event: ", err)
        return
    }
    
    // send player kick message
    player.Send <- kickEvent
    
    // close player connection
    e.Lobby.PlayerClose(player)
}