package server

import (
	"net/http"
	"time"
)

// Config configuration parameters
type Config struct {
	TokenType             string // token type
	AllowGetAccessRequest bool   // to allow GET requests for the token
}

// NewConfig create to configuration instance
func NewConfig() *Config {
	return &Config{
		TokenType: "Bearer",
	}
}

// AuthenticateRequest authorization request
type AuthenticateRequest struct {
	UserID         string
	AccessTokenExp time.Duration
	Request        *http.Request
}
