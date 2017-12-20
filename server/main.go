package main

import (
    "log"
    
    config   "github.com/codephobia/twitch-game/server/config"
    database "github.com/codephobia/twitch-game/server/database"
    nexus    "github.com/codephobia/twitch-game/server/nexus"
    api      "github.com/codephobia/twitch-game/server/api"
)

type Main struct {
    config   *config.Config
    database *database.Database
    nexus    *nexus.Nexus
    api      *api.Api
}

func main() {
    // make a new main
    _, err := NewMain()

    if err != nil {
        log.Fatalf("[ERROR] main: %s", err)
    }
}

func NewMain() (*Main, error) {
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
    api := api.NewApi(c, db, nexus)
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