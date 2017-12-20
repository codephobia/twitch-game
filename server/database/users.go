package database

import (
    "fmt"
    
    "gopkg.in/mgo.v2/bson"
)

type User struct {
    Username string `bson:"username"`
}

// get followers
func (db *Database) GetUserById(userID string) (*User, error) {
    users := make([]*User, 0)

    // build query
    query := db.users.Find(bson.M{
        "_id": bson.ObjectIdHex(userID),
    })
    
    // add filters
    query.Limit(1).Select(bson.M{
        "_id": 0,
        "username": 1,
    })
    
    // get users
    err := query.All(&users)
    if err != nil {
        return nil, fmt.Errorf("unable to get user by id [%s]: %s", userID, err)
    }
    
    // check if we found a user
    if len(users) == 0 {
        return nil, fmt.Errorf("unable to find user by id: %s", userID)
    }
    
    // return user
    return users[0], nil
}