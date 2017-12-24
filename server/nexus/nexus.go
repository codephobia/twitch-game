package nexus

import (
    "fmt"
    
    database "github.com/codephobia/twitch-game/server/database"
)

type Nexus struct {
    database *database.Database
    
    Lobbies map[string]*Lobby
}

// create a new nexus
func NewNexus(db *database.Database) *Nexus {
    return &Nexus{
        database: db,
        
        Lobbies: make(map[string]*Lobby, 0),
    }
}

// init a new lobby in the nexus
func (n *Nexus) InitNewLobby(lobbyID string, lobbyName string, lobbyCode string, userID string, gameID string, gameName string, gameSlots int) {
    n.Lobbies[lobbyID] = NewLobby(n.database, n, lobbyID, lobbyName, lobbyCode, userID, gameID, gameName, gameSlots)
    go n.Lobbies[lobbyID].Run()
}

// find a lobby in the nexus by id
func (n *Nexus) FindLobbyByID(lobbyID string) (*Lobby, error) {
    if lobby, ok := n.Lobbies[lobbyID]; !ok {
        return nil, fmt.Errorf("unable to find lobby id: %s", lobbyID)
    } else {
        return lobby, nil
    }
}

// close a lobby in the nexus
func (n *Nexus) LobbyClose(l *Lobby) {
    // remove lobby from database
    n.database.RemoveLobby(l.ID)
    
    // remove lobby from nexus
    delete(n.Lobbies, l.ID)
}