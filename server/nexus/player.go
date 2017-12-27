package nexus

import (
    "log"
    "time"
    
    "github.com/gorilla/websocket"
    
    database "github.com/codephobia/twitch-game/server/database"
)

const (
    writeWait = 1 * time.Second
    pongWait = 60 * time.Second
    pingPeriod = 10 * time.Second
    maxMessageSize = 512
)

type Player struct {
    database *database.Database
    
    ID       string
    Username string
    JoinTime time.Time
    
    Lobby    *Lobby
    conn     *websocket.Conn
    Send     chan []byte
}

func NewPlayer(db *database.Database, userID string, l *Lobby, c *websocket.Conn) (*Player, error) {
    
    user, err := db.GetUserById(userID)
    if err != nil {
        log.Printf("[ERROR] get user by id: %s", err)
        return nil, err
    }
    
    return &Player{
        database: db,
        
        ID:       userID,
        Username: user.Username,
        JoinTime: time.Now(),
        
        Lobby: l,
        conn:  c,
        Send:  make(chan []byte, 256),
    }, nil
}

func (p *Player) ReadPump() {
    defer func() {
        p.Lobby.Unregister <- p
        p.conn.Close()
    }()
    
    p.conn.SetReadLimit(maxMessageSize)
    p.conn.SetReadDeadline(time.Now().Add(pongWait))
    p.conn.SetPongHandler(func (string) error { p.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
    
    for {
        _, message, err := p.conn.ReadMessage()
        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
                log.Printf("[ERROR] unexpected close error: %s", err)
            }
            
            // TODO: HANDLE UNEXPECTED LEAVE
            
            break
        }
        
        // validates event and returns event
        event, err := p.Lobby.ValidateEvent(p, message)
        if err != nil {
            log.Printf("[ERROR] read event: %s", err)
            continue
        }
        
        // execute the event
        event.Execute()
        
        // generate message to broadcast
        eventMessage, err := event.Event().Generate()
        if err != nil {
            log.Printf("[ERROR] read event: %s", err)
            continue
        }
        
        // broadcast message
        p.Lobby.Broadcast <- eventMessage
    }
}

func (p *Player) WritePump() {
    ticker := time.NewTicker(pingPeriod)
    defer func() {
        ticker.Stop()
        p.conn.Close()
    }()
    
    for {
        select {
        case <-ticker.C:
            p.conn.SetWriteDeadline(time.Now().Add(writeWait))
            if err := p.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
                log.Printf("[ERROR] sending ping: %s", err)
                return
            }
        case message, ok := <-p.Send:
            p.conn.SetWriteDeadline(time.Now().Add(writeWait))
            if !ok {
                p.conn.WriteMessage(websocket.CloseMessage, []byte{})
                return
            }
            
            w, err := p.conn.NextWriter(websocket.TextMessage)
            if err != nil {
                return
            }
            w.Write(message)
            
            n := len(p.Send)
            for i := 0; i < n; i++ {
                w.Write(<-p.Send)
            }
            
            if err := w.Close(); err != nil {
                return
            }
        }
    }
}

// return if the player is the leader of the lobby
func (p *Player) IsLeader() bool {
    return p.ID == p.Lobby.LeaderID
}