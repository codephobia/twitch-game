package nexus

// LobbyPromoteEvent promotes a player to lobby leader.
type LobbyPromoteEvent struct {
	Lobby  *Lobby
	Player *Player

	*LobbyEvent
	LobbyEventLeader
	LobbyEventBroadcastable
}

// LobbyPromoteData contains the data of the promoted player.
type LobbyPromoteData struct {
	UserID string `json:"userId"`
}

// NewLobbyPromoteEvent creates a new LobbyPromoteEvent.
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

// Execute runs the LobbyPromoteEvent.
func (e *LobbyPromoteEvent) Execute() {
	data := e.Event().Data.(map[string]interface{})
	e.Lobby.LeaderID = data["userId"].(string)
}
