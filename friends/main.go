package main

import (
	"log"

	api "github.com/codephobia/twitch-game/friends/api"
	config "github.com/codephobia/twitch-game/friends/config"
	database "github.com/codephobia/twitch-game/friends/database"
	server "github.com/codephobia/twitch-game/friends/server"
)

type root struct {
	config   *config.Config
	database *database.Database
	api      *api.API
	server   *server.Server
}

func main() {
	// make a new main
	_, err := newRoot()

	if err != nil {
		log.Fatalf("[ERROR] main: %s", err)
	}
}

// generate a new main
func newRoot() (*root, error) {
	// load config
	c := config.NewConfig()
	if err := c.Load(); err != nil {
		return nil, err
	}

	// init database
	db := database.NewDatabase(c)
	if err := db.Init(); err != nil {
		return nil, err
	}

	// init server
	s := server.NewServer(db)
	s.Init()

	// api
	api := api.NewAPI(c, db, s)
	if err := api.Init(); err != nil {
		return nil, err
	}

	// return main
	return &root{
		config:   c,
		database: db,
		api:      api,
		server:   s,
	}, nil
}
