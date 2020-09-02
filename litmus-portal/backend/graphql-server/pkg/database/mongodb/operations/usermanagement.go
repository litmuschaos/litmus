package operations

import (
	"context"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb/schema"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection

func init() {
	userCollection = mongodb.Database.Collection("user")
}

// InsertUser ...
func InsertUser(ctx context.Context, user *dbSchema.User) error {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := userCollection.InsertOne(ctx, user)
	if err != nil {
		log.Print("Error creating User : ", err)
		return err
	}

	return nil
}

//GetUserByUserName ...
func GetUserByUserName(ctx context.Context, username string) (*dbSchema.User, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var user *dbSchema.User = new(dbSchema.User)
	query := bson.M{"username": username}
	err := userCollection.FindOne(ctx, query).Decode(user)
	if err != nil {
		log.Print("Error getting user with username: ", username, " error: ", err)
		return nil, err
	}

	return user, err
}

//GetUsers ...
func GetUsers(ctx context.Context) ([]dbSchema.User, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{}}
	cursor, err := userCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GETTING USERS : ", err)
		return []dbSchema.User{}, err
	}
	var user []dbSchema.User
	err = cursor.All(ctx, user)
	if err != nil {
		log.Print("ERROR GET CLUSTER : ", err)
		return []dbSchema.User{}, err
	}
	return user, nil
}
