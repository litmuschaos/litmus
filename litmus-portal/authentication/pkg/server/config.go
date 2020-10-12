package server

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
