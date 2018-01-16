package nexus

// LobbyGameDrawEvent is a draw event for the game.
type LobbyGameDrawEvent struct {
	Lobby  *Lobby
	Player *Player

	*LobbyEvent
	LobbyEventPleb
	LobbyEventBroadcastable
}

// LobbyGameDrawData contains click data for a draw event.
type LobbyGameDrawData struct {
	UserID string      `json:"userId"`
	Click  interface{} `json:"click"`
}

// Execute runs the LobbyGameDrawEvent.
func (e *LobbyGameDrawEvent) Execute() {
	// get draw event click data
	click := e.Event().Data

	// extend draw event to include user id
	e.Event().Data = &LobbyGameDrawData{
		UserID: e.Player.ID,
		Click:  click,
	}
}
