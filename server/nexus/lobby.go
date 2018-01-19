package nexus

import (
	"fmt"
	"log"
	"sync"

	database "github.com/codephobia/twitch-game/server/database"
)

// Lobby stores all of the lobby data.
type Lobby struct {
	database *database.Database
	nexus    *Nexus

	ID     string
	Name   string
	Code   string
	Public bool

	Game     *Game
	LeaderID string

	Locked bool

	Players    map[*Player]bool
	Broadcast  chan []byte
	Register   chan *Player
	Unregister chan *Player

	*sync.Mutex
}

// Game stores information about the selected game for the lobby.
type Game struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	SlotsMin int    `json:"slotsMin"`
	SlotsMax int    `json:"slotsMax"`
	Started  bool   `json:"started"`
}

// NewLobby returns a new Lobby.
func NewLobby(db *database.Database, nexus *Nexus, lobbyID string, lobbyName string, lobbyCode string, public bool, userID string, gameID string, gameName string, gameSlotsMin int, gameSlotsMax int) *Lobby {
	// create game
	game := &Game{
		ID:       gameID,
		Name:     gameName,
		SlotsMin: gameSlotsMin,
		SlotsMax: gameSlotsMax,
		Started:  false,
	}

	// return new lobby
	return &Lobby{
		database: db,
		nexus:    nexus,

		ID:       lobbyID,
		Name:     lobbyName,
		Code:     lobbyCode,
		Public:   public,
		Game:     game,
		LeaderID: userID,

		Locked: false,

		Players:    make(map[*Player]bool),
		Broadcast:  make(chan []byte),
		Register:   make(chan *Player),
		Unregister: make(chan *Player),

		Mutex: &sync.Mutex{},
	}
}

// Run starts a Lobby. Should be run in a separate thread.
func (l *Lobby) Run() {
	for {
		select {
		// register player with lobby
		case player := <-l.Register:
			l.RegisterPlayer(player)

		// unregister player with lobby
		case player := <-l.Unregister:
			l.UnregisterPlayer(player)

		// broadcast event to lobby
		case message := <-l.Broadcast:
			l.SendPlayers(message)
		}
	}
}

// RegisterPlayer registers a player with the lobby.
func (l *Lobby) RegisterPlayer(player *Player) {
	// lock lobby
	l.Lock()
	defer l.Unlock()

	l.Players[player] = true

	// send new player lobby state
	initEvent, err := l.NewLobbyInitEvent()
	if err != nil {
		// close player connection
		l.PlayerClose(player)

		// log error
		log.Printf("[ERROR] init lobby event: %s", err)
		return
	}

	// send event to player
	player.Send <- initEvent

	// create join event for existing players
	joinEvent, err := l.NewLobbyJoinEvent(player)
	if err != nil {
		// log error
		log.Printf("[ERROR] join lobby event: %s", err)
		return
	}

	// send join event to existing players in lobby
	l.SendPlayersExcept(player, joinEvent)

	// update number of players on database
	if err := l.database.UpdateLobbyPlayers(l.ID, len(l.Players)); err != nil {
		log.Printf("[ERROR] lobby update players: %s", err)
	}
}

// UnregisterPlayer unregisters a player with lobby.
func (l *Lobby) UnregisterPlayer(player *Player) {
	// lock lobby
	l.Lock()
	defer l.Unlock()

	// check if player was kicked
	// otherwise send a part event
	if !player.Kicked {
		// create part event for closed connection
		partEvent, err := l.NewLobbyPartEvent(player)
		if err != nil {
			log.Printf("[ERROR] new lobby part event: %s", err)
		} else {
			// broadcast part event
			l.SendPlayersExcept(player, partEvent)
		}
	}

	// close player connection
	l.PlayerClose(player)

	// check if there are other players still in the lobby
	if len(l.Players) > 0 {
		// update number of players on database
		if err := l.database.UpdateLobbyPlayers(l.ID, len(l.Players)); err != nil {
			log.Printf("[ERROR] lobby update players: %s", err)
		}
	}
}

// SendPlayers sends all players an event.
func (l *Lobby) SendPlayers(message []byte) {
	l.Lock()
	defer l.Unlock()

	for player := range l.Players {
		select {
		case player.Send <- message:
		default:
			l.PlayerClose(player)
		}
	}
}

// SendPlayersExcept sends all players except the specified player an event.
func (l *Lobby) SendPlayersExcept(p *Player, message []byte) {
	for player := range l.Players {
		// skip excepted player
		if player == p {
			continue
		}
		// send message to players
		select {
		case player.Send <- message:
		default:
			l.PlayerClose(player)
		}
	}
}

// GetPlayerByID returns a player in lobby by id.
func (l *Lobby) GetPlayerByID(userID string) (*Player, error) {
	// lock lobby
	l.Lock()
	defer l.Unlock()

	// loop through lobby players
	for player := range l.Players {
		if player.ID == userID {
			// return player
			return player, nil
		}
	}

	// return with error
	return nil, fmt.Errorf("unable to find player by id: %s", userID)
}

// PlayerClose closes a player connection on the lobby.
func (l *Lobby) PlayerClose(player *Player) {
	// make sure the player still exists on the lobby
	if _, ok := l.Players[player]; !ok {
		return
	}

	// close player connection
	close(player.Send)

	// remove player from lobby
	delete(l.Players, player)

	// remove lobby from nexus if no more players
	if len(l.Players) == 0 {
		l.nexus.LobbyClose(l)
	}
}

// AssignNewLeaderExcept assigns a new player except the specified player to lobby leader.
func (l *Lobby) AssignNewLeaderExcept(p *Player) {
	// lock lobby
	l.Lock()
	defer l.Unlock()

	currentLeaderID := l.LeaderID

	for player := range l.Players {
		if player.ID != currentLeaderID {
			l.LeaderID = player.ID

			// create promote event for remaining players
			promoteEvent, err := l.NewLobbyPromoteEvent(player.ID)
			if err != nil {
				// log error
				log.Printf("[ERROR] promote leader event: %s", err)
				return
			}

			// send join event to existing players in lobby
			l.SendPlayersExcept(p, promoteEvent)
			break
		}
	}
}

// LobbyPlayer contains player data for an event.
type LobbyPlayer struct {
	Username string `json:"username"`
	IsLeader bool   `json:"isLeader"`
	UserID   string `json:"userId"`
	JoinTime int64  `json:"joinTime"`

	Avatar *LobbyPlayerAvatar `json:"avatar"`
}

// LobbyPlayerAvatar contains player avatar data for an event.
type LobbyPlayerAvatar struct {
	Shape string `json:"shape"`
}

// GetPlayersData returns all players data in the lobby.
func (l *Lobby) GetPlayersData() []*LobbyPlayer {
	players := make([]*LobbyPlayer, 0)

	// loop through lobby players
	for player := range l.Players {
		players = append(players, &LobbyPlayer{
			Username: player.Username,
			Avatar: &LobbyPlayerAvatar{
				Shape: player.Avatar.Shape,
			},
			IsLeader: l.LeaderID == player.ID,
			UserID:   player.ID,
			JoinTime: player.JoinTime.Unix(),
		})
	}

	// return player data
	return players
}
