package myhub

import (
	"context"
	"errors"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
)

// CreateMyHub creates a private chaosHub for the user in the database
func CreateMyHub(ctx context.Context, myhub *MyHub) error {
	err := mongodb.Operator.Create(ctx, mongodb.MyHubCollection, myhub)
	if err != nil {
		log.Print("Error creating MyHub: ", err)
		return err
	}
	return nil
}

// GetMyHubByProjectID returns a private Hub based on the projectID
func GetMyHubByProjectID(ctx context.Context, projectID string) ([]MyHub, error) {
	query := bson.D{
		{"project_id", projectID},
		{"IsRemoved", false},
	}
	results, err := mongodb.Operator.List(ctx, mongodb.MyHubCollection, query)
	if err != nil {
		log.Print("ERROR GETTING USERS : ", err)
		return []MyHub{}, err
	}
	var myHubs []MyHub
	err = results.All(ctx, &myHubs)
	if err != nil {
		log.Print("Error deserializing myHubs in myHub object : ", err)
		return []MyHub{}, err
	}
	return myHubs, nil
}

// GetHubs lists all the chaosHubs that are present
func GetHubs(ctx context.Context) ([]MyHub, error) {
	query := bson.D{{}}
	results, err := mongodb.Operator.List(ctx, mongodb.MyHubCollection, query)
	if err != nil {
		log.Print("Error getting myHubs: ", err)
		return []MyHub{}, err
	}
	var myHubs []MyHub
	err = results.All(ctx, &myHubs)
	if err != nil {
		log.Print("Error deserializing myHubs in the myHub object: ", err)
		return []MyHub{}, err
	}
	return myHubs, nil
}

// GetHubByID returns a single chaosHub based on the hubID
func GetHubByID(ctx context.Context, hubID string, projectID string) (MyHub, error) {
	var myHub MyHub
	result, err := mongodb.Operator.Get(ctx, mongodb.MyHubCollection, bson.D{{"myhub_id", hubID}, {
		"project_id", projectID,
	}})
	err = result.Decode(&myHub)
	if err != nil {
		return MyHub{}, err
	}

	return myHub, nil
}

// UpdateMyHub updates the chaosHub
func UpdateMyHub(ctx context.Context, query bson.D, update bson.D) error {
	updateResult, err := mongodb.Operator.Update(ctx, mongodb.MyHubCollection, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("Myhub collection query didn't matched")
	}

	return nil
}
