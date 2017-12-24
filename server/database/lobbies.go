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