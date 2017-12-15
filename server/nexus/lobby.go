package nexus

import (
    "gopkg.in/mgo.v2/bson"
)

type Lobby struct {
    ID      bson.ObjectId
    Name    string
    GameID  bson.ObjectId
    OwnerID bson.ObjectId
    
    Players    map[*Player]bool
    Broadcast  chan []byte
    Register   chan *Player
    Unregister chan *Player
}

func NewLobby() *Lobby {
    return &Lobby{
        Players:    make(map[*Player]bool),
        Broadcast:  make(chan []byte),
        Register:   make(chan *Player),
        Unregister: make(chan *Player),
    }
}

func (l *Lobby) Run() {
    for {
        select {
            case player := <-l.Register:
                l.Players[player] = true
            case player := <-l.Unregister:
                if _, ok := l.Players[player]; ok {
                    close(player.Send)
                    delete(l.Players, player)
                }
            case message := <-l.Broadcast:
                for player := range l.Players {
                    select {
                        case player.Send <- message:
                        default:
                            close(player.Send)
                            delete(l.Players, player)
                    }
                }
        }
    }
}