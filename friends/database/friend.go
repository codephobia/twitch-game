package database

// Friend is a friend relationship returned from loopback.
type Friend struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Active   bool   `json:"active"`
}

// Friends is an array of Friends returned from loopback.
type Friends []Friend

type FriendsResp struct {
	Friends Friends
}
