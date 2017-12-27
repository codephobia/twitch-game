package database

import (
    "gopkg.in/mgo.v2/bson"
)

// remove the lobby from the database
func (db *Database) RemoveLobby(lobbyID string) error {
    return db.lobbies.Remove(bson.M{
        "_id": bson.ObjectIdHex(lobbyID),
    })
}

// update if the lobby is locked on the database
func (db *Database) UpdateLobbyLocked(lobbyID string, locked bool) error {
    // build query
    query := bson.M{
        "_id": bson.ObjectIdHex(lobbyID),
    }
    
    // build update
    update := bson.M{
        "$set": bson.M{
            "locked": locked,
        },
    }
    
    // update the database
    return db.lobbies.Update(query, update)
}

// update if the lobby is public on the database
func (db *Database) UpdateLobbyPublic(lobbyID string, public bool) error {
    // build query
    query := bson.M{
        "_id": bson.ObjectIdHex(lobbyID),
    }
    
    // build update
    update := bson.M{
        "$set": bson.M{
            "public": public,
        },
    }
    
    // update the database
    return db.lobbies.Update(query, update)
}

// update the number of players in the lobby
func (db *Database) UpdateLobbyPlayers(lobbyID string, count int) error {
    // build query
    query := bson.M{
        "_id": bson.ObjectIdHex(lobbyID),
    }
    
    // build update
    update := bson.M{
        "$set": bson.M{
            "players": count,
        },
    }
    
    // update the database
    return db.lobbies.Update(query, update)
}