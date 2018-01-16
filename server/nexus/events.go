package nexus

import (
	"encoding/json"
	"fmt"
)

// LobbyEventProvider in an interface event wrapper.
type LobbyEventProvider interface {
	Event() *LobbyEvent
	LeaderOnly() bool
	Execute()
	IsBroadcastable() bool
}

// LobbyEvent is a lobby event.
type LobbyEvent struct {
	Name string
	Data interface{}
}

// Event returns the LobbyEvent from an LobbyEvent or a LobbyEventProvider.
func (e *LobbyEvent) Event() *LobbyEvent {
	return e
}

// ValidateEvent validates an incoming event. Confirms that the event exists,
// and that the sender has the proper permissions to send it.
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
	if lobbyEventProvider.LeaderOnly() && p.ID != l.LeaderID {
		return nil, fmt.Errorf("invalid permissions for event: %s", lobbyEvent.Name)
	}

	return lobbyEventProvider, nil
}

// Generate generates an event for socket send.
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

// LobbyEventApp is an event permission for the application.
type LobbyEventApp struct{}

// LobbyEventLeader is an event permission for the leader.
type LobbyEventLeader struct{}

// LobbyEventPleb is an event permission for players that are not the leader.
type LobbyEventPleb struct{}

// LeaderOnly returns if the permission can execute leader only events.
func (l *LobbyEventApp) LeaderOnly() bool {
	return false
}

// LeaderOnly returns if the permission can execute leader only events.
func (l *LobbyEventLeader) LeaderOnly() bool {
	return true
}

// LeaderOnly returns if the permission can execute leader only events.
func (l *LobbyEventPleb) LeaderOnly() bool {
	return false
}

// LobbyEventBroadcastable is a flag to determine if an incoming event should be sent to players.
type LobbyEventBroadcastable struct{}

// IsBroadcastable returns if the event is broadcastable.
func (l *LobbyEventBroadcastable) IsBroadcastable() bool {
	return true
}

// LobbyEventNotBroadcastable is a flag to determine if an incoming event should not be sent to players.
type LobbyEventNotBroadcastable struct{}

// IsBroadcastable returns if the event is broadcastable.
func (l *LobbyEventNotBroadcastable) IsBroadcastable() bool {
	return false
}
