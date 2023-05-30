package chaos_infrastructure

import (
	"context"
	"time"

	"github.com/harness/hce-saas/graphql/server/pkg/database/mongodb"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	backgroundContext = context.Background()
)

// InsertInfra takes details of a chaos_infra and inserts into the database collection
func InsertInfra(ctx context.Context, infra ChaosInfra) error {
	err := mongodb.Operator.Create(ctx, mongodb.ChaosInfraCollection, infra)
	if err != nil {
		return err
	}

	return nil
}

// GetInfra takes a infraID to retrieve the chaos_infra details from the database
func GetInfra(infraID string) (ChaosInfra, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	query := bson.D{{"infra_id", infraID}}

	var infra ChaosInfra
	result, err := mongodb.Operator.Get(ctx, mongodb.ChaosInfraCollection, query)
	err = result.Decode(&infra)
	if err != nil {
		return ChaosInfra{}, err
	}

	return infra, nil
}

// GetInfraDetails takes a infraName and projectID to retrieve the chaos_infra details from the database
func GetInfraDetails(ctx context.Context, infraID string, projectID string) (ChaosInfra, error) {
	query := bson.D{
		{"project_id", projectID},
		{"infra_id", infraID},
	}

	var infra ChaosInfra
	result, err := mongodb.Operator.Get(ctx, mongodb.ChaosInfraCollection, query)
	err = result.Decode(&infra)
	if err != nil {
		return ChaosInfra{}, err
	}

	return infra, nil
}

// UpdateInfra takes query and update parameters to update the chaos_infra details in the database
func UpdateInfra(ctx context.Context, query bson.D, update bson.D) error {
	_, err := mongodb.Operator.UpdateMany(ctx, mongodb.ChaosInfraCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// GetInfraWithProjectID takes projectID to retrieve the chaos_infra details
func GetInfraWithProjectID(projectID string) ([]*ChaosInfra, error) {
	var query bson.D
	query = bson.D{

		{"project_id", projectID},
		{"is_removed", false},
	}

	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	var infras []*ChaosInfra
	results, err := mongodb.Operator.List(ctx, mongodb.ChaosInfraCollection, query)
	if err != nil {
		return []*ChaosInfra{}, err
	}

	err = results.All(ctx, &infras)
	if err != nil {
		return []*ChaosInfra{}, err
	}

	return infras, nil
}

// GetInfras returns all the infras matching the query
func GetInfras(ctx context.Context, query bson.D) ([]ChaosInfra, error) {
	var infras []ChaosInfra
	results, err := mongodb.Operator.List(ctx, mongodb.ChaosInfraCollection, query)
	if err != nil {
		return []ChaosInfra{}, err
	}
	err = results.All(ctx, &infras)
	if err != nil {
		return []ChaosInfra{}, err
	}
	return infras, nil
}

// GetAggregateInfras takes a mongo pipeline to retrieve the details from the database
func GetAggregateInfras(pipeline mongo.Pipeline) (*mongo.Cursor, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	results, err := mongodb.Operator.Aggregate(ctx, mongodb.ChaosInfraCollection, pipeline)
	if err != nil {
		return nil, err
	}

	return results, nil
}
