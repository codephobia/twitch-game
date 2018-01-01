package nexus

import (
    "encoding/json"
    "fmt"
)

// event interface wrapper
type LobbyEventProvider interface {
    Event() *LobbyEvent
    LeaderOnly() bool
    Execute()
    IsBroadcastable() bool
}

// event
type LobbyEvent struct {
    Name string
    Data interface{}
}

// returns the event from for an event or a provider
func (e *LobbyEvent) Event() *LobbyEvent {
	return e
}

// validate an incoming event
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
        case "LOBBY_PUBLIC":
            lobbyEventProvider = &LobbyPublicEvent{Lobby: l, LobbyEvent: lobbyEvent}
        case "LOBBY_PART":
            lobbyEventProvider = &LobbyPartEvent{Lobby: l, Player: p, LobbyEvent: lobbyEvent}
        case "LOBBY_KICK":
            lobbyEventProvider = &LobbyKickEvent{Lobby: l, LobbyEvent: lobbyEvent}
        case "LOBBY_PROMOTE":
            lobbyEventProvider = &LobbyPromoteEvent{Lobby: l, Player: p, LobbyEvent: lobbyEvent}
        case "LOBBY_GAME_START":
            lobbyEventProvider = &LobbyGameStartEvent{Lobby: l, LobbyEvent: lobbyEvent}
        case "GAME_DRAW":
            lobbyEventProvider = &LobbyGameDrawEvent{Lobby: l, Player: p, LobbyEvent: lobbyEvent}
        default:
            return nil, fmt.Errorf("invalid event: %s", lobbyEvent.Name)
    }
    
    // check event allowed
    if (lobbyEventProvider.LeaderOnly() && p.ID != l.LeaderID) {
        return nil, fmt.Errorf("invalid permissions for event: %s", lobbyEvent.Name)
    }
    
    return lobbyEventProvider, nil
}

// generate an event for socket send
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

// event permissions
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

// event broadcastable
type LobbyEventBroadcastable struct {}
type LobbyEventNotBroadcastable struct {}

func (l *LobbyEventBroadcastable) IsBroadcastable() bool {
    return true
}

func (l *LobbyEventNotBroadcastable) IsBroadcastable() bool {
    return false
}
