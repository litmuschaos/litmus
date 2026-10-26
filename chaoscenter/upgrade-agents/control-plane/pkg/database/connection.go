package database

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	ConnectionTimeout = 20 * time.Second
)

// Connect creates a new database client with the current configuration
func Connect() (*mongo.Client, error) {
	var (
		dbServer   = os.Getenv("DB_SERVER")
		dbUser     = os.Getenv("DB_USER")
		dbPassword = os.Getenv("DB_PASSWORD")
	)

	if dbServer == "" || dbUser == "" || dbPassword == "" {
		return nil, errors.New("missing database configuration")
	}

	credential := options.Credential{
		Username: dbUser,
		Password: dbPassword,
	}

	clientOptions := options.Client().ApplyURI(dbServer).SetAuth(credential)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to db, error=%w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), ConnectionTimeout)
	defer cancel()

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to ping db, error=%w", err)
	}

	return client, nil
}
