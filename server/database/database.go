package database

import (
    "fmt"
    "strings"
    
    mgo "gopkg.in/mgo.v2"
    
    config "github.com/codephobia/twitch-game/server/config"
)

var (
    COLLECTION_LOBBIES string = "lobby"
    COLLECTION_USERS   string = "user"
    COLLECTION_AVATARS string = "avatar"
)

type Database struct {
    config *config.Config
    
    session  *mgo.Session
    database *mgo.Database
    lobbies  *mgo.Collection
    users    *mgo.Collection
    avatars  *mgo.Collection
}

// create new database
func NewDatabase(c *config.Config) *Database {
    return &Database{
        config: c,
    }
}

// init database
func (db *Database) Init() error {
    // create mongo session
    mongoDBUrl := strings.Join([]string{db.config.MongoDBHost, db.config.MongoDBPort}, ":")
    session, err := mgo.Dial(mongoDBUrl)
    if err != nil {
        return fmt.Errorf("unable to dial server [%s]: %s", mongoDBUrl, err)
    }
    
    // store session
    db.session = session
    db.session.SetMode(mgo.Monotonic, true)
    
    // init followers
    db.initDatabase()
    
    return nil
}

// init database for mongodb
func (db *Database) initDatabase() {
    // database
    db.database = db.session.DB(db.config.MongoDBDatabase)
    
    // init lobbies
    db.initLobbies()
    
    // init users
    db.initUsers()

    // init avatars
    db.initAvatars()
}

// init lobbies collection
func (db *Database) initLobbies() {
    db.lobbies = db.database.C(COLLECTION_LOBBIES)
}

// init users collection
func (db *Database) initUsers() {
    db.users = db.database.C(COLLECTION_USERS)
}

// init avatar collection
func (db *Database) initAvatars() {
    db.avatars = db.database.C(COLLECTION_AVATARS)
}