package nexus

import (
	"log"
)

// LobbyPublicEvent changes the public state of the lobby.
type LobbyPublicEvent struct {
	Lobby *Lobby

	*LobbyEvent
	LobbyEventLeader
	LobbyEventBroadcastable
}

// LobbyPublicData contains the public state of the lobby.
type LobbyPublicData struct {
	Public bool `json:"public"`
}

// Execute runs the LobbyPublicEvent.
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
		log.Printf("[ERROR] lobby public event: %s", err)
	}
}
