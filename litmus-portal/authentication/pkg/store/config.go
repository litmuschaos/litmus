package store

// Config mongodb configuration parameters
type Config struct {
	URL string
	DB  string
}

// NewConfig create mongodb configuration
func NewConfig(url, db string) *Config {
	return &Config{
		URL: url,
		DB:  db,
	}
}
