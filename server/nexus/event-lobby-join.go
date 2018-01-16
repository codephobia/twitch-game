package nexus

// LobbyJoinEvent announces when someone joins the lobby.
type LobbyJoinEvent struct {
	Lobby *Lobby

	*LobbyEvent
	LobbyEventPleb
	LobbyEventBroadcastable
}

// LobbyJoinData contains the player data of whom joined.
type LobbyJoinData struct {
	Player *LobbyPlayer `json:"player"`
}

// NewLobbyJoinEvent creates a new LobbyJoinEvent.
func (l *Lobby) NewLobbyJoinEvent(player *Player) ([]byte, error) {
	// create event
	event := &LobbyJoinEvent{
		LobbyEvent: &LobbyEvent{
			Name: "LOBBY_JOIN",
			Data: &LobbyJoinData{
				Player: &LobbyPlayer{
					UserID:   player.ID,
					Username: player.Username,
					Avatar: &LobbyPlayerAvatar{
						Shape: player.Avatar.Shape,
					},
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
