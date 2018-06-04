package api

import (
	"fmt"
	"log"
	"net/http"

	server "github.com/codephobia/twitch-game/friends/server"
)

// handleConnect
func (api *API) handleConnect() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			api.handleConnectGet(w, r)
		default:
			api.handleError(w, 405, fmt.Errorf("method not allowed"))
		}
	})
}

// handleConnectGet
func (api *API) handleConnectGet(w http.ResponseWriter, r *http.Request) {
	// get query vars
	v := r.URL.Query()

	// get vars
	userID := v.Get("user_id")

	// upgrade connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[ERROR] lobby join: unable to upgrade connection: %s", err)
		api.handleError(w, 422, fmt.Errorf("[ERROR] lobby join: unable to upgrade connection: %s", err))
		return
	}

	// generate new user
	user, err := server.NewUser(api.database, api.server, userID, conn)
	if err != nil {
		log.Printf("[ERROR] connect: %s", err)
		api.handleError(w, 404, err)
		return
	}

	// register user with server
	api.server.Register <- user

	// init read / write for socket connection
	go user.WritePump()
	go user.ReadPump()

	return
}
