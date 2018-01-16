package nexus

// LobbyInitEvent is an event for sending the initial state of the lobby on join.
type LobbyInitEvent struct {
	Lobby *Lobby

	*LobbyEvent
	LobbyEventApp
	LobbyEventNotBroadcastable
}

// LobbyInitData contains the initial state of the lobby on join.
type LobbyInitData struct {
	LobbyName string         `json:"lobbyName"`
	LobbyCode string         `json:"lobbyCode"`
	Players   []*LobbyPlayer `json:"players"`
	Locked    bool           `json:"locked"`
	Public    bool           `json:"public"`
	Game      *Game          `json:"game"`
}

// NewLobbyInitEvent creates a new LobbyInitEvent.
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
				Players:   players,
				Locked:    l.Locked,
				Public:    l.Public,
				Game:      l.Game,
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
