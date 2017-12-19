package nexus

import (
    "log"
    "time"
    
    "github.com/gorilla/websocket"
)

const (
    writeWait = 1 * time.Second
    pongWait = 60 * time.Second
    pingPeriod = 10 * time.Second
    maxMessageSize = 512
)

type Player struct {
    ID       string
    Username string
    
    Lobby    *Lobby
    conn     *websocket.Conn
    Send     chan []byte
}

func NewPlayer(userID string, l *Lobby, c *websocket.Conn) *Player {
    return &Player{
        ID:    userID,
        Lobby: l,
        conn:  c,
        Send:  make(chan []byte, 256),
    }
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
            break
        }
        
        // TODO: validate message from player
        
        p.Lobby.Broadcast <- message
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