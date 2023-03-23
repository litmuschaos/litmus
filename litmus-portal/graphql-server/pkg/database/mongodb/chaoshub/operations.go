package chaoshub

import (
	"context"
	"errors"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
)

type Operator interface {
	CreateChaosHub(ctx context.Context, chaosHub *ChaosHub) error
	GetChaosHubByProjectID(ctx context.Context, projectID string) ([]ChaosHub, error)
	GetHubs(ctx context.Context) ([]ChaosHub, error)
	GetHubByID(ctx context.Context, hubID string, projectID string) (ChaosHub, error)
	UpdateChaosHub(ctx context.Context, query bson.D, update bson.D) error
}

type chaosHubOperator struct {
	operator mongodb.MongoOperator
}

func NewOperator() Operator {
	return &chaosHubOperator{operator: &mongodb.MongoOperations{}}
}

// CreateChaosHub creates a private chaosHub for the user in the database
func (c *chaosHubOperator) CreateChaosHub(ctx context.Context, chaosHub *ChaosHub) error {
	err := c.operator.Create(ctx, mongodb.ChaosHubCollection, chaosHub)
	if err != nil {
		log.Print("Error creating ChaosHub: ", err)
		return err
	}
	return nil
}

// GetChaosHubByProjectID returns a private Hub based on the projectID
func (c *chaosHubOperator) GetChaosHubByProjectID(ctx context.Context, projectID string) ([]ChaosHub, error) {
	query := bson.D{
		{"project_id", projectID},
		{"IsRemoved", false},
	}
	results, err := c.operator.List(ctx, mongodb.ChaosHubCollection, query)
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
func (c *chaosHubOperator) GetHubs(ctx context.Context) ([]ChaosHub, error) {
	query := bson.D{{}}
	results, err := c.operator.List(ctx, mongodb.ChaosHubCollection, query)
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
func (c *chaosHubOperator) GetHubByID(ctx context.Context, hubID string, projectID string) (ChaosHub, error) {
	var chaosHub ChaosHub
	result, err := c.operator.Get(ctx, mongodb.ChaosHubCollection, bson.D{{"chaoshub_id", hubID}, {
		"project_id", projectID,
	}})
	err = result.Decode(&chaosHub)
	if err != nil {
		return ChaosHub{}, err
	}

	return chaosHub, nil
}

// UpdateChaosHub updates the chaosHub
func (c *chaosHubOperator) UpdateChaosHub(ctx context.Context, query bson.D, update bson.D) error {
	updateResult, err := c.operator.Update(ctx, mongodb.ChaosHubCollection, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("ChaosHub collection query didn't matched")
	}

	return nil
}
