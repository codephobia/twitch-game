package nexus

import (
    "encoding/json"
    "fmt"
)

// lobby init data
type LobbyInitData struct {
    LobbyName string       `json:"lobbyName"`
    Players  []*LobbyPlayer `json:"players"`
    Locked   bool          `json:"locked"`
    Game     *Game         `json:"game"`
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

func (e *LobbyPartEvent) Execute() {    
    //e.Lobby.PlayerPart(e.Player.ID)
}

type LobbyKickEvent struct {
    Lobby *Lobby
    
    *LobbyEvent
    LobbyEventLeader
}

func (e *LobbyKickEvent) Execute() {    
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
        default:
            return nil, fmt.Errorf("invalid event: %s", lobbyEvent.Name)
    }
    
    // check event allowed
    if (lobbyEventProvider.LeaderOnly() && p.ID != l.LeaderID) {
        return nil, fmt.Errorf("invalid permissions for event: %s", lobbyEvent.Name)
    }
    
    return lobbyEventProvider, nil
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