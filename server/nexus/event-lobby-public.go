package nexus

import (
    "log"
)

// public event
type LobbyPublicEvent struct {
    Lobby  *Lobby

    *LobbyEvent
    LobbyEventLeader
}

// public event data
type LobbyPublicData struct {
    Public bool `json:"public"`
}

// execute public event
func (e *LobbyPublicEvent) Execute() {
    // toggle lobby public
    e.Lobby.Public = !e.Lobby.Public
    
    // update event data to reflect public state
    e.Event().Data = &LobbyPublicData{
        Public: e.Lobby.Public,
    }
    
    // update lobby public on database
    err := e.Lobby.database.UpdateLobbyPublic(e.Lobby.ID, e.Lobby.Public)
    if err != nil {
        log.Printf("[ERROR] lobby public event: ", err)
    }
}