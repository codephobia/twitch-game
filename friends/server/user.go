package server

import (
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"

	database "github.com/codephobia/twitch-game/friends/database"
)

const (
	writeWait      = 1 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = 10 * time.Second
	maxMessageSize = 512
)

// User ...
type User struct {
	database *database.Database
	server   *Server

	ID       string
	Username string
	Friends  []*Friend

	conn *websocket.Conn
	Send chan []byte

	*sync.Mutex
}

// NewUser returns a new user.
func NewUser(db *database.Database, server *Server, userID string, c *websocket.Conn) (*User, error) {

	user, err := db.GetUserByID(userID)
	if err != nil {
		log.Printf("[ERROR] get user by id: %s", err)
		return nil, err
	}

	return &User{
		database: db,
		server:   server,

		ID:       userID,
		Username: user.Username,

		conn: c,
		Send: make(chan []byte, 256),

		Mutex: &sync.Mutex{},
	}, nil
}

// ReadPump reads incoming socket data on the player connection.
func (user *User) ReadPump() {
	defer func() {
		user.server.Unregister <- user
		user.conn.Close()
	}()

	user.conn.SetReadLimit(maxMessageSize)
	user.conn.SetReadDeadline(time.Now().Add(pongWait))
	user.conn.SetPongHandler(func(string) error { user.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		// TODO: _, message, err
		_, message, err := user.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				log.Printf("[ERROR] unexpected close error: %s", err)
			}
			break
		}

		log.Printf("[INFO] socket message: %s", string(message))

		// validates event and returns event
		// event, err := p.Lobby.ValidateEvent(p, message)
		// if err != nil {
		// 	log.Printf("[ERROR] read event: %s", err)
		// 	continue
		// }

		// execute the event
		// event.Execute()

		// check if event is broadcastable
		// if event.IsBroadcastable() {
		// 	// generate message to broadcast
		// 	eventMessage, err := event.Event().Generate()
		// 	if err != nil {
		// 		log.Printf("[ERROR] read event: %s", err)
		// 		continue
		// 	}

		// 	// broadcast message
		// 	p.Lobby.Broadcast <- eventMessage
		// }
	}
}

// WritePump writes outgoing socket data on the player connection.
func (user *User) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		user.conn.Close()
	}()

	for {
		select {
		case <-ticker.C:
			user.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := user.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				log.Printf("[ERROR] sending ping: %s", err)
				return
			}
		case message, ok := <-user.Send:
			user.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// close connection
				user.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := user.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}

			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		}
	}
}

// GetFriends returns an array or user friends.
func (user *User) GetFriends() ([]*Friend, error) {
	// init array for friends
	friends := make([]*Friend, 0)

	// fetch user friends from database
	friendsDB, err := user.database.GetUserFriends(user.ID)
	if err != nil {
		return friends, err
	}

	// convert db friends to server friends
	for _, friend := range friendsDB {
		friends = append(friends, &Friend{
			ID:       friend.ID,
			Username: friend.Username,
			Active:   friend.Active,
		})
	}

	// tack users on to friends
	user.Friends = friends

	// return friends
	return friends, nil
}
