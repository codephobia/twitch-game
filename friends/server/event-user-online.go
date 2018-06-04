package server

// UserOnlineEvent is an event for handling user coming online.
type UserOnlineEvent struct {
	User *User

	*FriendsEvent
	FriendsEventApp
	FriendsEventNotBroadcastable
}

// UserOnlineData contains the user information of who came online.
type UserOnlineData struct {
	UserID string `json:"userId"`
}

// NewUserOnlineEvent creates a new UserOnlineEvent.
func (s *Server) NewUserOnlineEvent(user *User) ([]byte, error) {
	// create event
	event := &UserOnlineEvent{
		FriendsEvent: &FriendsEvent{
			Name: "USER_ONLINE",
			Data: &UserOnlineData{
				UserID: user.ID,
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
