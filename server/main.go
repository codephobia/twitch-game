package main

import (
	"log"

	api "github.com/codephobia/twitch-game/server/api"
	config "github.com/codephobia/twitch-game/server/config"
	database "github.com/codephobia/twitch-game/server/database"
	nexus "github.com/codephobia/twitch-game/server/nexus"
)

type Main struct {
	config   *config.Config
	database *database.Database
	nexus    *nexus.Nexus
	api      *api.API
}

func main() {
	// make a new main
	_, err := newMain()

	if err != nil {
		log.Fatalf("[ERROR] main: %s", err)
	}
}

// generate a new main
func newMain() (*Main, error) {
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

	// init nexus
	nexus := nexus.NewNexus(db)

	// api
	api := api.NewAPI(c, db, nexus)
	if err := api.Init(); err != nil {
		return nil, err
	}

	// return main
	return &Main{
		config:   c,
		database: db,
		nexus:    nexus,
		api:      api,
	}, nil
}
