package nexus

import (
    "fmt"
)

type Nexus struct {
    Lobbies map[string]*Lobby
}

func NewNexus() *Nexus {
    return &Nexus{
        Lobbies: make(map[string]*Lobby, 0),
    }
}

func (n *Nexus) InitNewLobby(lobbyID string, userID string) {
    n.Lobbies[lobbyID] = NewLobby()
    go n.Lobbies[lobbyID].Run()
}

func (n *Nexus) FindLobbyByID(lobbyID string) (*Lobby, error) {
    if lobby, ok := n.Lobbies[lobbyID]; !ok {
        return nil, fmt.Errorf("unable to find lobby id: %s", lobbyID)
    } else {
        return lobby, nil
    }
}