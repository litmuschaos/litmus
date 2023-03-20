package chaoshub

import (
	"context"
	"errors"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
)

// CreateChaosHub creates a private chaosHub for the user in the database
func CreateChaosHub(ctx context.Context, chaosHub *ChaosHub) error {
	err := mongodb.Operator.Create(ctx, mongodb.ChaosHubCollection, chaosHub)
	if err != nil {
		log.Print("Error creating ChaosHub: ", err)
		return err
	}
	return nil
}

// GetChaosHubByProjectID returns a private Hub based on the projectID
func GetChaosHubByProjectID(ctx context.Context, projectID string) ([]ChaosHub, error) {
	query := bson.D{
		{"project_id", projectID},
		{"IsRemoved", false},
	}
	results, err := mongodb.Operator.List(ctx, mongodb.ChaosHubCollection, query)
	if err != nil {
		log.Print("ERROR GETTING HUBS : ", err)
		return []ChaosHub{}, err
	}
	var chaosHubs []ChaosHub
	err = results.All(ctx, &chaosHubs)
	if err != nil {
		log.Print("Error deserializing chaosHubs in chaosHub object : ", err)
		return []ChaosHub{}, err
	}
	return chaosHubs, nil
}

// GetHubs lists all the chaosHubs that are present
func GetHubs(ctx context.Context) ([]ChaosHub, error) {
	query := bson.D{{}}
	results, err := mongodb.Operator.List(ctx, mongodb.ChaosHubCollection, query)
	if err != nil {
		log.Print("Error getting chaosHubs: ", err)
		return []ChaosHub{}, err
	}
	var chaosHubs []ChaosHub
	err = results.All(ctx, &chaosHubs)
	if err != nil {
		log.Print("Error deserializing chaosHubs in the chaosHub object: ", err)
		return []ChaosHub{}, err
	}
	return chaosHubs, nil
}

// GetHubByID returns a single chaosHub based on the hubID
func GetHubByID(ctx context.Context, hubID string, projectID string) (ChaosHub, error) {
	var chaosHub ChaosHub
	result, err := mongodb.Operator.Get(ctx, mongodb.ChaosHubCollection, bson.D{{"chaoshub_id", hubID}, {
		"project_id", projectID,
	}})
	err = result.Decode(&chaosHub)
	if err != nil {
		return ChaosHub{}, err
	}

	return chaosHub, nil
}

// UpdateChaosHub updates the chaosHub
func UpdateChaosHub(ctx context.Context, query bson.D, update bson.D) error {
	updateResult, err := mongodb.Operator.Update(ctx, mongodb.ChaosHubCollection, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("ChaosHub collection query didn't matched")
	}

	return nil
}
