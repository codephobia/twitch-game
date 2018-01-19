package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	nexus "github.com/codephobia/twitch-game/server/nexus"
)

// handleLobby
func (api *API) handleLobby() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "POST":
			api.handleLobbyPost(w, r)
		default:
			api.handleError(w, 405, fmt.Errorf("method not allowed"))
		}
	})
}

// LobbyCreateRequest is an incoming request for lobby creation.
type LobbyCreateRequest struct {
	LobbyID   string `json:"lobby_id"`
	LobbyName string `json:"lobby_name"`
	LobbyCode string `json:"lobby_code"`
	Public    bool   `json:"public"`

	UserID string `json:"user_id"`

	GameID       string `json:"game_id"`
	GameName     string `json:"game_name"`
	GameSlotsMin int    `json:"game_slots_min"`
	GameSlotsMax int    `json:"game_slots_max"`
}

// handleLobbyPost
func (api *API) handleLobbyPost(w http.ResponseWriter, r *http.Request) {
	// decode the join request
	var createRequest LobbyCreateRequest
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&createRequest)
	if err != nil {
		log.Printf("[ERROR] unable to decode create request: %s", err)
		return
	}

	log.Printf("[INFO] creating lobby [%s] for user id [%s]", createRequest.LobbyID, createRequest.UserID)

	api.nexus.InitNewLobby(
		createRequest.LobbyID,
		createRequest.LobbyName,
		createRequest.LobbyCode,
		createRequest.Public,
		createRequest.UserID,
		createRequest.GameID,
		createRequest.GameName,
		createRequest.GameSlotsMin,
		createRequest.GameSlotsMax,
	)
}

// handleLobbyJoin
func (api *API) handleLobbyJoin() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			api.handleLobbyJoinGet(w, r)
		default:
			api.handleError(w, 405, fmt.Errorf("method not allowed"))
		}
	})
}

// handleLobbyJoinGet
func (api *API) handleLobbyJoinGet(w http.ResponseWriter, r *http.Request) {
	// get query vars
	v := r.URL.Query()

	// get vars
	lobbyID := v.Get("lobby_id")
	userID := v.Get("user_id")

	// find lobby to join
	lobby, err := api.nexus.FindLobbyByID(lobbyID)
	if err != nil {
		log.Printf("[ERROR] lobby join: %s", err)
		api.handleError(w, 404, err)
		return
	}

	// check if lobby is locked
	if lobby.Locked {
		api.handleError(w, 423, fmt.Errorf("[ERROR] lobby join: lobby is locked"))
		return
	}

	// check if lobby is full
	if len(lobby.Players) >= lobby.Game.SlotsMax {
		api.handleError(w, 403, fmt.Errorf("[ERROR] lobby join: lobby is full"))
		return
	}

	// upgrade connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[ERROR] lobby join: unable to upgrade connection: %s", err)
		api.handleError(w, 422, fmt.Errorf("[ERROR] lobby join: unable to upgrade connection: %s", err))
		return
	}

	// add player to lobby
	p, err := nexus.NewPlayer(api.database, userID, lobby, conn)
	if err != nil {
		log.Printf("[ERROR] lobby join: %s", err)
		api.handleError(w, 404, err)
		return
	}

	// register player on lobby
	p.Lobby.Register <- p

	// init read / write for socket connection
	go p.WritePump()
	go p.ReadPump()

	return
}
