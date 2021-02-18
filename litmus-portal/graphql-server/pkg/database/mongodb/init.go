package mongodb

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	//Database ...
	Database *mongo.Database
	dbName   = "litmus"

	backgroundContext = context.Background()
	err               error
)

//init initializes database connection
func init() {

	var (
		dbServer = os.Getenv("DB_SERVER")
		username = os.Getenv("DB_USER")
		pwd      = os.Getenv("DB_PASSWORD")
	)

	if dbServer == "" || username == "" || pwd == "" {
		log.Fatal("DB configuration failed")
	}

	credential := options.Credential{
		Username: username,
		Password: pwd,
	}

	clientOptions := options.Client().ApplyURI(dbServer).SetAuth(credential)
	client, err := mongo.Connect(backgroundContext, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	ctx, _ := context.WithTimeout(backgroundContext, 20*time.Second)

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	} else {
		log.Print("Connected To MONGODB")
	}

	Database = client.Database(dbName)
}
