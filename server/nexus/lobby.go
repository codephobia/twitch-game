package nexus

import (
    "encoding/json"
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

func (l *Lobby) Run() {
    for {
        select {
            case player := <-l.Register:
                l.Players[player] = true
                
                event, err := l.Event()
                if err != nil {
                    log.Printf("[ERROR] %s", err);
                    return
                }
                player.Send <- event
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

type LobbyInitData struct {
    LobbyName string       `json:"lobbyName"`
    Players  []LobbyPlayer `json:"players"`
    Locked   bool          `json:"locked"`
    Game     *Game         `json:"game"`
}

type LobbyPlayer struct {
    Username string `json:"username"`
    IsLeader bool   `json:"isLeader"`
    UserID   string `json:"userId"`
}

func (l *Lobby) Event() ([]byte, error) {
    players := make([]LobbyPlayer, 0)
    
    for player, _ := range l.Players {
        players = append(players, LobbyPlayer{
            Username: player.Username,
            IsLeader: l.LeaderID == player.ID,
            UserID: player.ID,
        })
    }
    
    data := []interface{}{"LOBBY_INIT", &LobbyInitData{
        Players: players,
        Game: l.Game,
        Locked: l.Locked,
    }}
    
    event, err := json.Marshal(data);
    if err != nil {
        return nil, err
    }
    
    return event, nil
}