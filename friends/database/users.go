package database

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"gopkg.in/mgo.v2/bson"
)

// User is a web api user model.
type User struct {
	Username string `bson:"username"`
}

// GetUserByID returns a user by their user id.
func (db *Database) GetUserByID(userID string) (*User, error) {
	users := make([]*User, 0)

	// build query
	query := db.users.Find(bson.M{
		"_id": bson.ObjectIdHex(userID),
	})

	// add filters
	query.Limit(1).Select(bson.M{
		"_id":      0,
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

	// get first result as user
	user := users[0]

	// return user
	return user, nil
}

// GetUserFriends returns all of a users friends from the database.
func (db *Database) GetUserFriends(userID string) ([]*Friend, error) {
	friends := make([]*Friend, 0)

	// build web api url
	url := fmt.Sprintf(
		"http://%s:%s/api/%s/%s/%s",
		db.config.WebAPIHost,
		db.config.WebAPIPort,
		"users",
		userID,
		"friends",
	)

	// build update query
	var query = []byte(fmt.Sprintf(`{"filter":{"fields": ["id","username","active"]}}`))

	// create new request
	req, err := http.NewRequest("GET", url, bytes.NewBuffer(query))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", db.config.WebAPIAccessToken)
	req.Header.Set("Content-Type", "application/json")

	// http client
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// check for 200 response code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("web api: unable to get user [%s] friends", userID)
	}

	// decode friends
	json.NewDecoder(resp.Body).Decode(&friends)

	// return friends
	return friends, nil
}
