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

	config "github.com/codephobia/twitch-game/friends/config"
	database "github.com/codephobia/twitch-game/friends/database"
	server "github.com/codephobia/twitch-game/friends/server"
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
	server   *server.Server

	httpServer *http.Server
}

// NewAPI creates a new API struct.
func NewAPI(c *config.Config, db *database.Database, s *server.Server) *API {
	return &API{
		config:   c,
		database: db,
		server:   s,
	}
}

// Init initializes the API.
func (api *API) Init() error {
	// create the server
	api.httpServer = &http.Server{
		Handler:      handlers.CORS()(api.Handler()),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	// create a listener
	hostURL := strings.Join([]string{api.config.APIHost, ":", api.config.APIPort}, "")
	listener, err := net.Listen("tcp", hostURL)
	if err != nil {
		return fmt.Errorf("error starting api server: %s", err)
	}

	// run server
	log.Printf("API Server running: %s", listener.Addr().String())
	api.httpServer.Serve(listener)

	return nil
}

// Handler returns a mux router.
func (api *API) Handler() http.Handler {
	// create router
	r := mux.NewRouter()

	// handle web sockets
	r.Handle("/connect", api.handleConnect())

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
