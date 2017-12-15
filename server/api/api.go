package api

import (
    "encoding/json"
    "fmt"
    "log"
    "net"
    "net/http"
    "strings"
    "time"
    
    "github.com/gorilla/mux"
    "github.com/gorilla/handlers"
    "github.com/gorilla/websocket"
    
    config   "github.com/codephobia/twitch-game/server/config"
    database "github.com/codephobia/twitch-game/server/database"
    nexus    "github.com/codephobia/twitch-game/server/nexus"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize: 1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool { return true },
}

// api struct
type Api struct {
    config   *config.Config
    database *database.Database
    nexus    *nexus.Nexus
    
    server   *http.Server
}

// create new api
func NewApi(c *config.Config, db *database.Database, nexus *nexus.Nexus) *Api {
    return &Api{
        config:   c,
        database: db,
        nexus:    nexus,
    }
}

// init api
func (api *Api) Init() error {
    // create the server
    api.server = &http.Server{
        Handler:      handlers.CompressHandler(handlers.CORS()(api.Handler())),
        ReadTimeout:  10 * time.Second,
        WriteTimeout: 10 * time.Second,
    }
    
    // create a listener
    hostUrl := strings.Join([]string{api.config.ApiHost, ":", api.config.ApiPort}, "")
    listener, err := net.Listen("tcp", hostUrl)
    if err != nil {
        return fmt.Errorf("error starting api server: %s", err)
    }
    
    // run server
    log.Printf("API Server running: %s", listener.Addr().String())
    api.server.Serve(listener)
    
    return nil
}

func (api *Api) Handler() http.Handler {
    // create router
    r := mux.NewRouter()    
    
    // handle web sockets
    r.Handle("/lobby", api.handleLobby())

    // handle web sockets
    r.Handle("/lobby/join", api.handleLobbyJoin())

    // return router
    return r
}

type ErrorResp struct {
    err string `json:"error"`
}

func (api *Api) handleError(w http.ResponseWriter, status int, err error) {
    w.Header().Add("Content-Type", "application/json")
    w.WriteHeader(status)
    
    enc := json.NewEncoder(w)
    enc.Encode(&ErrorResp{
        err: err.Error(),
    })
}