package nexus

import (
	"log"
)

// LobbyLockEvent announces when the locked state of the lobby changes.
type LobbyLockEvent struct {
	Lobby *Lobby

	*LobbyEvent
	LobbyEventLeader
	LobbyEventBroadcastable
}

// LobbyLockData contains the locked state of the lobby.
type LobbyLockData struct {
	Locked bool `json:"locked"`
}

// Execute runs the LobbyLockEvent.
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
		log.Printf("[ERROR] lobby lock event: %s", err)
	}
}
