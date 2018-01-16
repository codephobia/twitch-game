package database

import (
	"fmt"

	"gopkg.in/mgo.v2/bson"
)

// User is a web api user model.
type User struct {
	Username string `bson:"username"`
	Avatar   *Avatar
}

// Avatar is a web api avatar model.
type Avatar struct {
	Shape string `bson:"shape"`
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

	// get avatar of user
	avatar, err := db.GetUserAvatar(userID)
	if err != nil {
		return nil, fmt.Errorf("avatar: %s", err)
	}

	// add avatar to user
	user.Avatar = avatar

	// return user
	return user, nil
}

// GetUserAvatar returns a user avatar by their user id.
func (db *Database) GetUserAvatar(userID string) (*Avatar, error) {
	avatars := make([]*Avatar, 0)

	// build query
	query := db.avatars.Find(bson.M{
		"userId": bson.ObjectIdHex(userID),
	})

	// add filters
	query.Limit(1).Select(bson.M{
		"_id":   0,
		"shape": 1,
	})

	// get avatars
	err := query.All(&avatars)
	if err != nil {
		return nil, fmt.Errorf("unable to get avatar by user id [%s]: %s", userID, err)
	}

	// check if we found a user
	if len(avatars) == 0 {
		return nil, fmt.Errorf("unable to find avatar by user id: %s", userID)
	}

	return avatars[0], nil
}
