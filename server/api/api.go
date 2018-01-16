package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"

	config "github.com/codephobia/twitch-game/server/config"
	database "github.com/codephobia/twitch-game/server/database"
	nexus "github.com/codephobia/twitch-game/server/nexus"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

// API struct
type API struct {
	config   *config.Config
	database *database.Database
	nexus    *nexus.Nexus

	server *http.Server
}

// NewAPI creates a new API struct.
func NewAPI(c *config.Config, db *database.Database, nexus *nexus.Nexus) *API {
	return &API{
		config:   c,
		database: db,
		nexus:    nexus,
	}
}

// Init initializes the API.
func (api *API) Init() error {
	// create the server
	api.server = &http.Server{
		Handler:      handlers.CompressHandler(handlers.CORS()(api.Handler())),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	// create a listener
	hostURL := strings.Join([]string{api.config.ApiHost, ":", api.config.ApiPort}, "")
	listener, err := net.Listen("tcp", hostURL)
	if err != nil {
		return fmt.Errorf("error starting api server: %s", err)
	}

	// run server
	log.Printf("API Server running: %s", listener.Addr().String())
	api.server.Serve(listener)

	return nil
}

// Handler returns a mux router.
func (api *API) Handler() http.Handler {
	// create router
	r := mux.NewRouter()

	// handle web sockets
	r.Handle("/lobby", api.handleLobby())

	// handle web sockets
	r.Handle("/lobby/join", api.handleLobbyJoin())

	// return router
	return r
}

// ErrorResp is a json error resonse.
type ErrorResp struct {
	Err string `json:"error"`
}

func (api *API) handleError(w http.ResponseWriter, status int, err error) {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(status)

	enc := json.NewEncoder(w)
	enc.Encode(&ErrorResp{
		Err: err.Error(),
	})
}
