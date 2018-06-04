package server

import (
	"encoding/json"
	"fmt"
)

// FriendsEventProvider in an interface event wrapper.
type FriendsEventProvider interface {
	Event() *FriendsEvent
	Execute()
	IsBroadcastable() bool
}

// FriendsEvent is a friends server event.
type FriendsEvent struct {
	Name string
	Data interface{}
}

// Event returns the FriendsEvent from an FriendsEvent or a FriendsEventProvider.
func (e *FriendsEvent) Event() *FriendsEvent {
	return e
}

// ValidateEvent validates an incoming event. Confirms that the event exists,
// and that the sender has the proper permissions to send it.
func (s *Server) ValidateEvent(user *User, e []byte) (FriendsEventProvider, error) {
	// create new friends event
	friendsEvent := &FriendsEvent{}

	// unmarshal event bytes
	tmp := []interface{}{&friendsEvent.Name, &friendsEvent.Data}
	err := json.Unmarshal(e, &tmp)
	if err != nil {
		return nil, fmt.Errorf("unmarshal event: %s", err)
	}

	// verify event exists and type assert
	var friendsEventProvider FriendsEventProvider
	switch friendsEvent.Name {
	case "":
	// friendsEventProvider = &ServerConnectEvent{User: user, FriendsEvent: friendsEvent}
	default:
		return nil, fmt.Errorf("invalid event: %s", friendsEvent.Name)
	}

	return friendsEventProvider, nil
}

// Generate generates an event for socket send.
func (e *FriendsEvent) Generate() ([]byte, error) {
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

// FriendsEventApp is an event permission for the application.
type FriendsEventApp struct{}

// FriendsEventBroadcastable is a flag to determine if an incoming event should be sent to all user friends.
type FriendsEventBroadcastable struct{}

// IsBroadcastable returns if the event is broadcastable.
func (f *FriendsEventBroadcastable) IsBroadcastable() bool {
	return true
}

// FriendsEventNotBroadcastable is a flag to determine if an incoming event should not be sent to all user friends.
type FriendsEventNotBroadcastable struct{}

// IsBroadcastable returns if the event is broadcastable.
func (f *FriendsEventNotBroadcastable) IsBroadcastable() bool {
	return false
}
