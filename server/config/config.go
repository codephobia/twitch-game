package config

import (
	"encoding/json"
	"fmt"
	"os"
)

var (
	configFilePath = "./config.json"
)

// Config stores the configuration from the config file.
type Config struct {
	MongoDBHost     string `json:"mongo_db_host"`
	MongoDBPort     string `json:"mongo_db_port"`
	MongoDBDatabase string `json:"mongo_db_database"`

	APIHost string `json:"api_host"`
	APIPort string `json:"api_port"`

	WebAPIHost        string `json:"web_api_host"`
	WebAPIPort        string `json:"web_api_port"`
	WebAPIAccessToken string `json:"web_api_access_token"`
}

// NewConfig returns a new Config struct.
func NewConfig() *Config {
	return &Config{}
}

// Load loads the config file.
func (c *Config) Load() error {
	configFile, err := os.Open(configFilePath)
	if err != nil {
		return fmt.Errorf("config open: %s", err)
	}
	defer configFile.Close()

	if err := json.NewDecoder(configFile).Decode(c); err != nil {
		return fmt.Errorf("config decode: %s", err)
	}

	return nil
}
