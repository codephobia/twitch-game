package nexus

import (
    "encoding/json"
    "fmt"
    "log"
)

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

type LobbyEventProvider interface {
    Event() *LobbyEvent
    LeaderOnly() bool
    Execute()
}

type LobbyEvent struct {
    Name string
    Data interface{}
}

func (e *LobbyEvent) Event() *LobbyEvent {
	return e
}

func (e *LobbyEvent) Generate() ([]byte, error) {
    // generate event string
    eventString := []interface{}{e.Name, e.Data}
    
    // marshal event string into bytes
    data, err := json.Marshal(eventString)
    if err != nil {
        return nil, err
    }
    
    // return event bytes
    return data, nil
}

type LobbyEventApp struct {}
type LobbyEventLeader struct {}
type LobbyEventPleb struct {}

func (l *LobbyEventApp) LeaderOnly() bool {
    return false
}

func (l *LobbyEventLeader) LeaderOnly() bool {
    return true
}

func (l *LobbyEventPleb) LeaderOnly() bool {
    return false
}

type LobbyInitEvent struct {
    Lobby *Lobby
    
    *LobbyEvent
    LobbyEventApp
}

type LobbyJoinEvent struct {
    Lobby *Lobby

    *LobbyEvent
    LobbyEventPleb
}

type LobbyPartEvent struct {
    Lobby  *Lobby
    Player *Player

    *LobbyEvent
    LobbyEventPleb
}

// execute player part
func (e *LobbyPartEvent) Execute() {
    isLeader := e.Player.IsLeader()
    playersCount := len(e.Lobby.Players)

    // check if we need to handle assigning a new leader
    if (isLeader && playersCount > 1) {
        e.Lobby.AssignNewLeaderExcept(e.Player)
    }

    // close player connection
    e.Lobby.PlayerClose(e.Player)
}

type LobbyKickEvent struct {
    Lobby  *Lobby
    Player *Player
    
    *LobbyEvent
    LobbyEventLeader
}

func (e *LobbyKickEvent) Execute() {
    // get kick data
    data := e.Event().Data.(map[string]interface{})
    userID := data["userId"].(string)
    
    // find player to kick
    player, err := e.Lobby.GetPlayerByID(userID)
    if err != nil {
        // log error
        log.Printf("[ERROR] lobby kick event: ", err)
        return
    }
    
    // create kick event
    kickEvent, err := e.Lobby.NewLobbyKickEvent(player.ID)
    if err != nil {
        // log error
        log.Printf("[ERROR] lobby kick event: ", err)
        return
    }
    
    // send player kick message
    player.Send <- kickEvent
    
    // close player connection
    e.Lobby.PlayerClose(player)
}

type LobbyLockEvent struct {
    Lobby  *Lobby

    *LobbyEvent
    LobbyEventLeader
}

func (e *LobbyLockEvent) Execute() {
    data := e.Event().Data.(map[string]interface{})
    e.Lobby.Locked = data["locked"].(bool)
}

// event to promote a new player to leader
type LobbyPromoteEvent struct {
    Lobby  *Lobby
    Player *Player

    *LobbyEvent
    LobbyEventLeader
}

// execute player promote
func (e *LobbyPromoteEvent) Execute() {
    data := e.Event().Data.(map[string]interface{})
    e.Lobby.LeaderID = data["userId"].(string)
}

func (l *Lobby) ValidateEvent(p *Player, e []byte) (LobbyEventProvider, error) {
    // create new lobby event
    lobbyEvent := &LobbyEvent{}

    // unmarshal event bytes
    tmp := []interface{}{&lobbyEvent.Name, &lobbyEvent.Data}
    err := json.Unmarshal(e, &tmp)
    if err != nil {
        return nil, fmt.Errorf("validate event: %s", err)
    }
    
    // verify event exists and type assert
    var lobbyEventProvider LobbyEventProvider
    switch lobbyEvent.Name {
        case "LOBBY_LOCK":
            lobbyEventProvider = &LobbyLockEvent{Lobby: l, LobbyEvent: lobbyEvent}
        case "LOBBY_PART":
            lobbyEventProvider = &LobbyPartEvent{Lobby: l, Player: p, LobbyEvent: lobbyEvent}
        case "LOBBY_KICK":
            lobbyEventProvider = &LobbyKickEvent{Lobby: l, LobbyEvent: lobbyEvent}
        case "LOBBY_PROMOTE":
            lobbyEventProvider = &LobbyPromoteEvent{Lobby: l, Player: p, LobbyEvent: lobbyEvent}
        default:
            return nil, fmt.Errorf("invalid event: %s", lobbyEvent.Name)
    }
    
    // check event allowed
    if (lobbyEventProvider.LeaderOnly() && p.ID != l.LeaderID) {
        return nil, fmt.Errorf("invalid permissions for event: %s", lobbyEvent.Name)
    }
    
    return lobbyEventProvider, nil
}

// lobby init data
type LobbyInitData struct {
    LobbyName string        `json:"lobbyName"`
    LobbyCode string        `json:"lobbyCode"`
    Players  []*LobbyPlayer `json:"players"`
    Locked   bool           `json:"locked"`
    Game     *Game          `json:"game"`
}

// create new lobby init event
func (l *Lobby) NewLobbyInitEvent() ([]byte, error) {
    // get players
    players := l.GetPlayersData()
    
    // create event
    event := &LobbyInitEvent{
        LobbyEvent: &LobbyEvent{
            Name: "LOBBY_INIT",
            Data: &LobbyInitData{
                LobbyName: l.Name,
                LobbyCode: l.Code,
                Players: players,
                Locked: l.Locked,
                Game: l.Game,
            },
        },
    }
    
    // generate message
    message, err := event.Event().Generate()
    if err != nil {
        return nil, err
    }
    
    // return event string
    return message, nil
}

type LobbyJoinData struct {
    Player *LobbyPlayer `json:"player"`
}

// create new lobby init event
func (l *Lobby) NewLobbyJoinEvent(player *Player) ([]byte, error) {
    // create event
    event := &LobbyJoinEvent{
        LobbyEvent: &LobbyEvent{
            Name: "LOBBY_JOIN",
            Data: &LobbyJoinData{
                Player: &LobbyPlayer{
                    UserID:   player.ID,
                    Username: player.Username,
                    IsLeader: false,
                },
            },
        },
    }
    
    // generate message
    message, err := event.Event().Generate()
    if err != nil {
        return nil, err
    }
    
    // return event string
    return message, nil
}

type LobbyPromoteData struct {
    UserID string `json:"userId"`
}

// create new lobby promote event
func (l *Lobby) NewLobbyPromoteEvent(userID string) ([]byte, error) {
    // create event
    event := &LobbyPromoteEvent{
        LobbyEvent: &LobbyEvent{
            Name: "LOBBY_PROMOTE",
            Data: &LobbyPromoteData{
                UserID: userID,
            },
        },
    }
    
    // generate message
    message, err := event.Event().Generate()
    if err != nil {
        return nil, err
    }
    
    // return event string
    return message, nil
}

type LobbyKickData struct {
    UserID string `json:"userId"`
}

// create new lobby promote event
func (l *Lobby) NewLobbyKickEvent(userID string) ([]byte, error) {
    // create event
    event := &LobbyPromoteEvent{
        LobbyEvent: &LobbyEvent{
            Name: "LOBBY_KICK",
            Data: &LobbyKickData{
                UserID: userID,
            },
        },
    }
    
    // generate message
    message, err := event.Event().Generate()
    if err != nil {
        return nil, err
    }
    
    // return event string
    return message, nil
}