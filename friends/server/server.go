package server

import (
	"log"
	"sync"

	database "github.com/codephobia/twitch-game/friends/database"
)

// Server ...
type Server struct {
	database *database.Database

	Users map[string]*User

	Register   chan *User
	Unregister chan *User

	*sync.Mutex
}

// NewServer ...
func NewServer(db *database.Database) *Server {
	return &Server{
		database: db,

		Users: make(map[string]*User),

		Register:   make(chan *User),
		Unregister: make(chan *User),

		Mutex: &sync.Mutex{},
	}
}

// Init ...
func (s *Server) Init() {
	go s.run()
}

// run ...
func (s *Server) run() {
	for {
		select {
		// register user
		case user := <-s.Register:
			s.registerUser(user)

		// unregister user
		case user := <-s.Unregister:
			s.unregisterUser(user)
		}
	}
}

// register a new user with the server
func (s *Server) registerUser(user *User) {
	// lock server
	s.Lock()
	defer s.Unlock()

	log.Printf("[INFO] user registered: %s", user.Username)

	// add user to server
	s.Users[user.ID] = user

	log.Printf("[INFO] total users: %d", len(s.Users))

	// send new user friends list
	connectEvent, err := s.NewServerConnectEvent(user)
	if err != nil {
		// unregister user
		s.unregisterUser(user)

		// log error
		log.Printf("[ERROR] server connect event: %s", err)
		return
	}

	// send event to user
	user.Send <- connectEvent

	// alert user's online friends
	userOnlineEvent, err := s.NewUserOnlineEvent(user)
	if err != nil {
		// log error
		log.Printf("[ERROR] user online event: %s", err)
	} else {
		// broadcast online to user's online friends
		s.broadcastToFriends(user, userOnlineEvent)
	}
}

// unregister a user with the server
func (s *Server) unregisterUser(user *User) {
	// lock server
	s.Lock()
	defer s.Unlock()

	log.Printf("[INFO] user unregistered: %s", user.Username)

	// close user connection
	close(user.Send)

	// remove user from server
	delete(s.Users, user.ID)

	log.Printf("[INFO] total users: %d", len(s.Users))
}

// broadcasts an event to a users online friends
func (s *Server) broadcastToFriends(user *User, eventMessage []byte) {
	// loop through all users friends
	for _, friend := range user.Friends {
		// find online friends
		if _, ok := s.Users[friend.ID]; ok {
			// send online event to online friends
			s.Users[friend.ID].Send <- eventMessage
		}
	}
}
