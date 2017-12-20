package nexus

import (
    "fmt"
    
    database "github.com/codephobia/twitch-game/server/database"
)

type Nexus struct {
    database *database.Database
    
    Lobbies map[string]*Lobby
}

func NewNexus(db *database.Database) *Nexus {
    return &Nexus{
        database: db,
        
        Lobbies: make(map[string]*Lobby, 0),
    }
}

func (n *Nexus) InitNewLobby(lobbyID string, lobbyName string, userID string, gameID string, gameName string, gameSlots int) {
    n.Lobbies[lobbyID] = NewLobby(n.database, lobbyID, lobbyName, userID, gameID, gameName, gameSlots)
    go n.Lobbies[lobbyID].Run()
}

func (n *Nexus) FindLobbyByID(lobbyID string) (*Lobby, error) {
    if lobby, ok := n.Lobbies[lobbyID]; !ok {
        return nil, fmt.Errorf("unable to find lobby id: %s", lobbyID)
    } else {
        return lobby, nil
    }
}