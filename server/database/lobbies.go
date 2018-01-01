package database

import (
    "bytes"
    "fmt"
    "net/http"
)

// remove the lobby from the database
func (db *Database) RemoveLobby(lobbyID string) error {
    // build web api url
    url := fmt.Sprintf("http://%s:%s/api/%s/%s", db.config.WebApiHost, db.config.WebApiPort, "lobbies", lobbyID)
    
    // build update query
    var query = []byte(`{}`)
    
    // create new request
    req, err := http.NewRequest("DELETE", url, bytes.NewBuffer(query))
    if err != nil {
        return err
    }
    
    req.Header.Set("Authorization", db.config.WebApiAccessToken)
    req.Header.Set("Content-Type", "application/json")
    
    // http client
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    // check for 200 response code
    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("web api: unable to delete lobby: %s", lobbyID)
    }
    
    return nil
}

// update if the lobby is locked on the database
func (db *Database) UpdateLobbyLocked(lobbyID string, locked bool) error {
    // build web api url
    url := fmt.Sprintf("http://%s:%s/api/%s/%s", db.config.WebApiHost, db.config.WebApiPort, "lobbies", lobbyID)
    
    // build update query
    var query = []byte(fmt.Sprintf(`{"locked": %t}`, locked))
    
    // create new request
    req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(query))
    if err != nil {
        return err
    }
    
    req.Header.Set("Authorization", db.config.WebApiAccessToken)
    req.Header.Set("Content-Type", "application/json")
    
    // http client
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    // check for 200 response code
    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("web api: unable to update lobby [%s] to locked: %t", lobbyID, locked)
    }
    
    return nil
}

// update if the lobby is public on the database
func (db *Database) UpdateLobbyPublic(lobbyID string, public bool) error {
    // build web api url
    url := fmt.Sprintf("http://%s:%s/api/%s/%s", db.config.WebApiHost, db.config.WebApiPort, "lobbies", lobbyID)
    
    // build update query
    var query = []byte(fmt.Sprintf(`{"public": %t}`, public))
    
    // create new request
    req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(query))
    if err != nil {
        return err
    }
    
    req.Header.Set("Authorization", db.config.WebApiAccessToken)
    req.Header.Set("Content-Type", "application/json")
    
    // http client
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    // check for 200 response code
    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("web api: unable to update lobby [%s] to public: %t", lobbyID, public)
    }
    
    return nil
}

// update the number of players in the lobby
func (db *Database) UpdateLobbyPlayers(lobbyID string, count int) error {
    // build web api url
    url := fmt.Sprintf("http://%s:%s/api/%s/%s", db.config.WebApiHost, db.config.WebApiPort, "lobbies", lobbyID)
    
    // build update query
    var query = []byte(fmt.Sprintf(`{"players": %d}`, count))
    
    // create new request
    req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(query))
    if err != nil {
        return err
    }
    
    req.Header.Set("Authorization", db.config.WebApiAccessToken)
    req.Header.Set("Content-Type", "application/json")
    
    // http client
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    // check for 200 response code
    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("web api: unable to update lobby [%s] players: %d", lobbyID, count)
    }
    
    return nil
}