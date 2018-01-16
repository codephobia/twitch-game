package nexus

import (
	"fmt"

	database "github.com/codephobia/twitch-game/server/database"
)

// Nexus contains all of the lobbies.
type Nexus struct {
	database *database.Database

	Lobbies map[string]*Lobby
}

// NewNexus returns a new Nexus.
func NewNexus(db *database.Database) *Nexus {
	return &Nexus{
		database: db,

		Lobbies: make(map[string]*Lobby, 0),
	}
}

// InitNewLobby initializes a new lobby in the nexus.
func (n *Nexus) InitNewLobby(lobbyID string, lobbyName string, lobbyCode string, public bool, userID string, gameID string, gameName string, gameSlotsMin int, gameSlotsMax int) {
	n.Lobbies[lobbyID] = NewLobby(n.database, n, lobbyID, lobbyName, lobbyCode, public, userID, gameID, gameName, gameSlotsMin, gameSlotsMax)
	go n.Lobbies[lobbyID].Run()
}

// FindLobbyByID returns a lobby in the nexus by id.
func (n *Nexus) FindLobbyByID(lobbyID string) (*Lobby, error) {
	lobby, ok := n.Lobbies[lobbyID]
	if !ok {
		return nil, fmt.Errorf("unable to find lobby id: %s", lobbyID)
	}

	return lobby, nil
}

// LobbyClose closes a lobby in the nexus.
func (n *Nexus) LobbyClose(l *Lobby) {
	// remove lobby from database
	n.database.RemoveLobby(l.ID)

	// remove lobby from nexus
	delete(n.Lobbies, l.ID)
}
