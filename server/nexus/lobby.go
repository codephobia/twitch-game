package nexus

import (
    "fmt"
    "log"
    
    database "github.com/codephobia/twitch-game/server/database"
)

type Lobby struct {
    database *database.Database
    nexus    *Nexus
    
    ID       string
    Name     string
    Code     string
    
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
func NewLobby(db *database.Database, nexus *Nexus, lobbyID string, lobbyName string, lobbyCode string, userID string, gameID string, gameName string, gameSlots int) *Lobby {
    // create game
    game := &Game{
        ID: gameID,
        Name: gameName,
        Slots: gameSlots,
    }
    
    // return new lobby
    return &Lobby{
        database: db,
        nexus: nexus,
        
        ID: lobbyID,
        Name: lobbyName,
        Code: lobbyCode,
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
        l.PlayerClose(player)

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
        l.PlayerClose(player)
    }    
}

// send all players an event
func (l *Lobby) SendPlayers(message []byte) {
    for player := range l.Players {
        select {
            case player.Send <- message:
            default:
                l.PlayerClose(player)
        }
    }
}

// send all players except a player an event
func (l *Lobby) SendPlayersExcept(p *Player, message []byte) {
    for player := range l.Players {
        // skip excepted player
        if player == p {
            continue
        }
        // send message to players
        select {
            case player.Send <- message:
            default:
                l.PlayerClose(player)
        }
    }
}

// get player in lobby by id
func (l *Lobby) GetPlayerByID(userID string) (*Player, error) {
    for player := range l.Players {
        if player.ID == userID {
            return player, nil
        }
    }
    
    return nil, fmt.Errorf("unable to find player by id: %s", userID)
}

// close a player connection on the lobby
func (l *Lobby) PlayerClose(player *Player) {
    log.Printf("[INFO] closing player: %+v", player)
    
    // close player connection
    close(player.Send)

    // remove player from lobby
    delete(l.Players, player)
    
    // remove lobby from nexus if no more players
    if len(l.Players) == 0 {
        l.nexus.LobbyClose(l)
    }
}

// assign a new player to lobby leader
func (l *Lobby) AssignNewLeaderExcept(p *Player) {
    currentLeaderID := l.LeaderID
    
    for player := range l.Players {
        if player.ID != currentLeaderID {
            l.LeaderID = player.ID
            
            // create promote event for remaining players
            promoteEvent, err := l.NewLobbyPromoteEvent(player.ID)
            if err != nil {
                // log error
                log.Printf("[ERROR] promote leader event: ", err)
                return
            }

            // send join event to existing players in lobby
            l.SendPlayersExcept(p, promoteEvent)
            break
        }
    }
}

// lobby player data
type LobbyPlayer struct {
    Username string `json:"username"`
    IsLeader bool   `json:"isLeader"`
    UserID   string `json:"userId"`
}

// get all players data in the lobby
func (l *Lobby) GetPlayersData() []*LobbyPlayer {
    players := make([]*LobbyPlayer, 0)
    
    for player, _ := range l.Players {
        players = append(players, &LobbyPlayer{
            Username: player.Username,
            IsLeader: l.LeaderID == player.ID,
            UserID: player.ID,
        })
    }
    
    return players
}