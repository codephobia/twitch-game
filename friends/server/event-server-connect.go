package server

// ServerConnectEvent is an event for handling user registration.
type ServerConnectEvent struct {
	User *User

	*FriendsEvent
	FriendsEventApp
	FriendsEventNotBroadcastable
}

// FriendsConnectData contains the initial state of the friends list on connect.
type FriendsConnectData struct {
	Friends []*Friend `json:"friends"`
}

// NewServerConnectEvent creates a new ServerConnectEvent.
func (s *Server) NewServerConnectEvent(user *User) ([]byte, error) {
	// get friends
	friends, err := user.GetFriends()
	if err != nil {
		return nil, err
	}

	// determine which friends are online
	for _, friend := range friends {
		if _, ok := s.Users[friend.ID]; ok {
			friend.Online = true
		}
	}

	// create event
	event := &ServerConnectEvent{
		FriendsEvent: &FriendsEvent{
			Name: "SERVER_CONNECT",
			Data: &FriendsConnectData{
				Friends: friends,
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
