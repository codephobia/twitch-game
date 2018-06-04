package server

// Friend ...
type Friend struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Active   bool   `json:"active"`
	Online   bool   `json:"online"`
}
