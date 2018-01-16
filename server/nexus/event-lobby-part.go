package nexus

// LobbyPartEvent announces when a player has left the lobby.
type LobbyPartEvent struct {
	Lobby  *Lobby
	Player *Player

	*LobbyEvent
	LobbyEventPleb
	LobbyEventNotBroadcastable
}

// LobbyPartData contains the data of the parting player.
type LobbyPartData struct {
	UserID string `json:"userId"`
}

// NewLobbyPartEvent creates a new LobbyPartEvent.
func (l *Lobby) NewLobbyPartEvent(p *Player) ([]byte, error) {
	// create event
	event := &LobbyPartEvent{
		Lobby:  l,
		Player: p,
		LobbyEvent: &LobbyEvent{
			Name: "LOBBY_PART",
			Data: &LobbyPartData{
				UserID: p.ID,
			},
		},
	}

	// execute the event
	event.Execute()

	// generate message
	message, err := event.Event().Generate()
	if err != nil {
		return nil, err
	}

	// return event string
	return message, nil
}

// Execute runs the LobbyPartEvent.
func (e *LobbyPartEvent) Execute() {
	isLeader := e.Player.IsLeader()
	playersCount := len(e.Lobby.Players)

	// check if we need to handle assigning a new leader
	if isLeader && playersCount > 1 {
		e.Lobby.AssignNewLeaderExcept(e.Player)
	}

	// update event data to include user id
	e.Event().Data = &LobbyPartData{
		UserID: e.Player.ID,
	}
}
