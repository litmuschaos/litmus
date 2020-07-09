package manage

import (
	"net/http"
	"time"
)

// Config authorization configuration parameters
type Config struct {
	// access token expiration time, 0 means it doesn't expire
	AccessTokenExp time.Duration
}

// default configs
var (
	DefaultTokenCfg = &Config{AccessTokenExp: time.Hour * 1}
)

// TokenGenerateRequest provide to generate the token request parameters
type TokenGenerateRequest struct {
	UserID         string
	AccessTokenExp time.Duration
	Request        *http.Request
}
