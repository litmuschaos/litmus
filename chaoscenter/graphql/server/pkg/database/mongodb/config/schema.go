package config

// ServerConfig stores any server specific configuration in the db
type ServerConfig struct {
	Key   string      `bson:"key"`
	Value interface{} `bson:"value"`
}
