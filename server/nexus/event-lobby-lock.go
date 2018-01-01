package nexus

import (
    "log"
)

// lock event
type LobbyLockEvent struct {
    Lobby  *Lobby

    *LobbyEvent
    LobbyEventLeader
    LobbyEventBroadcastable
}

// locked event data
type LobbyLockData struct {
    Locked bool `json:"locked"`
}

// execute lock event
func (e *LobbyLockEvent) Execute() {
    // toggle lobby lock
    e.Lobby.Locked = !e.Lobby.Locked
    
    // update event data to reflect locked state
    e.Event().Data = &LobbyLockData{
        Locked: e.Lobby.Locked,
    }
    
    // update lobby locked on database
    err := e.Lobby.database.UpdateLobbyLocked(e.Lobby.ID, e.Lobby.Locked)
    if err != nil {
        log.Printf("[ERROR] lobby lock event: ", err)
    }
}