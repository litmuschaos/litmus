package myhub

import (
	"context"
	"errors"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

var myhubCollection *mongo.Collection

func init() {
	myhubCollection = mongodb.Database.Collection("myhub")
}

// CreateMyHub ...
func CreateMyHub(ctx context.Context, myhub *MyHub) error {
	_, err := myhubCollection.InsertOne(ctx, myhub)
	if err != nil {
		log.Print("Error creating MyHub: ", err)
		return err
	}
	return nil
}

// GetMyHubByProjectID ...
func GetMyHubByProjectID(ctx context.Context, projectID string) ([]MyHub, error) {
	query := bson.M{"project_id": projectID, "IsRemoved": false}
	cursor, err := myhubCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GETTING USERS : ", err)
		return []MyHub{}, err
	}
	var myhubs []MyHub
	err = cursor.All(ctx, &myhubs)
	if err != nil {
		log.Print("Error deserializing myhubs in myhub object : ", err)
		return []MyHub{}, err
	}
	return myhubs, nil
}

// GetHubs ...
func GetHubs(ctx context.Context) ([]MyHub, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{}}
	cursor, err := myhubCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GETTING MYHUBS : ", err)
		return []MyHub{}, err
	}
	var MyHubs []MyHub
	err = cursor.All(ctx, &MyHubs)
	if err != nil {
		log.Print("Error deserializing myhubs in the myhub object : ", err)
		return []MyHub{}, err
	}
	return MyHubs, nil
}

// GetHubByID ...
func GetHubByID(ctx context.Context, hubID string) (MyHub, error) {
	var myHub MyHub
	err := myhubCollection.FindOne(ctx, bson.M{"myhub_id": hubID}).Decode(&myHub)
	if err != nil {
		return MyHub{}, err
	}

	return myHub, nil
}

// UpdateMyHub ...
func UpdateMyHub(ctx context.Context, query bson.D, update bson.D) error {
	updateResult, err := myhubCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("Myhub collection query didn't matched")
	}

	return nil
}
