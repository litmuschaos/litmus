package database

import (
	"context"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection

// InsertUser ...
func InsertUser(ctx context.Context, user *model.User) error {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := userCollection.InsertOne(ctx, user)
	if err != nil {
		log.Print("Error creating User : ", err)
		return err
	}

	return nil
}

//GetUserByUserName ...
func GetUserByUserName(ctx context.Context, username string) (*model.User, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var user *model.User = new(model.User)
	query := bson.M{"username": username}
	err := userCollection.FindOne(ctx, query).Decode(user)
	if err != nil {
		log.Print("Error getting user with username: ", username, " error: ", err)
		return nil, err
	}

	return user, err
}

//GetUsers ...
func GetUsers(ctx context.Context) ([]model.User, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{}}
	cursor, err := userCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GETTING USERS : ", err)
		return []model.User{}, err
	}
	var user []model.User
	err = cursor.All(ctx, user)
	if err != nil {
		log.Print("ERROR GET CLUSTER : ", err)
		return []model.User{}, err
	}
	return user, nil
}
