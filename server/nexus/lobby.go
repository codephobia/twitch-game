package nexus

import (
    "log"
    
    database "github.com/codephobia/twitch-game/server/database"
)

type Lobby struct {
    database *database.Database
    
    ID       string
    Name     string
    Game     *Game
    LeaderID string
    
    Locked bool
    
    Players    map[*Player]bool
    Broadcast  chan []byte
    Register   chan *Player
    Unregister chan *Player
}

type Game struct {
    ID    string `json:"id"`
    Name  string `json:"name"`
    Slots int    `json:"slots"`
}

// create new lobby
func NewLobby(db *database.Database, lobbyID string, lobbyName string, userID string, gameID string, gameName string, gameSlots int) *Lobby {
    // create game
    game := &Game{
        ID: gameID,
        Name: gameName,
        Slots: gameSlots,
    }
    
    // return new lobby
    return &Lobby{
        database: db,
        
        ID: lobbyID,
        Name: lobbyName,
        Game: game,
        LeaderID: userID,
        
        Locked: false,
        
        Players:    make(map[*Player]bool),
        Broadcast:  make(chan []byte),
        Register:   make(chan *Player),
        Unregister: make(chan *Player),
    }
}

// run the lobby
func (l *Lobby) Run() {
    for {
        select {
            // register player with lobby
            case player := <-l.Register:
                l.RegisterPlayer(player)
            
            // unregister player with lobby
            case player := <-l.Unregister:
                l.UnregisterPlayer(player)
            
            // broadcast event to lobby
            case message := <-l.Broadcast:
                l.SendPlayers(message)
        }
    }
}

// register a player with the lobby
func (l *Lobby) RegisterPlayer(player *Player) {
    l.Players[player] = true

    // send new player lobby state
    initEvent, err := l.NewLobbyInitEvent()
    if err != nil {
        // close player connection
        close(player.Send)
        delete(l.Players, player)

        // log error
        log.Printf("[ERROR] init lobby event: ", err)
        return
    }

    // send event to player
    player.Send <- initEvent
    
    
    // create join event for existing players
    joinEvent, err := l.NewLobbyJoinEvent(player)
    if err != nil {
        // log error
        log.Printf("[ERROR] join lobby event: ", err)
        return
    }
    
    // send join event to existing players in lobby
    l.SendPlayersExcept(player, joinEvent)
}

// unregister a player with lobby
func (l *Lobby) UnregisterPlayer(player *Player) {
    if _, ok := l.Players[player]; ok {
        close(player.Send)
        delete(l.Players, player)
    }    
}

// send all players an event
func (l *Lobby) SendPlayers(message []byte) {
    for player := range l.Players {
        select {
            case player.Send <- message:
            default:
                close(player.Send)
                delete(l.Players, player)
        }
    }
}

// send all players except a player an event
func (l *Lobby) SendPlayersExcept(p *Player, message []byte) {
    for player := range l.Players {
        // skip excepted player
        if player == p {
            break
        }
        // send message to players
        select {
            case player.Send <- message:
            default:
                close(player.Send)
                delete(l.Players, player)
        }
    }
}