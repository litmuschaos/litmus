package probe

import (
	"context"
	"errors"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// CreateProbe creates a probe of a specific type (HTTP, PROM, K8s or CMD)
// as a shared entity in the database
func CreateProbe(ctx context.Context, probe Probe) error {
	err := mongodb.Operator.Create(ctx, mongodb.ChaosProbeCollection, probe)
	if err != nil {
		return err
	}
	return nil
}

// GetAggregateProbes takes a mongo pipeline to retrieve the project details from the database
func GetAggregateProbes(ctx context.Context, pipeline mongo.Pipeline) (*mongo.Cursor, error) {
	results, err := mongodb.Operator.Aggregate(ctx, mongodb.ChaosProbeCollection, pipeline)
	if err != nil {
		return nil, err
	}

	return results, nil
}

// IsProbeUnique returns true if probe is unique
func IsProbeUnique(ctx context.Context, query bson.D) (bool, error) {
	count, err := mongodb.Operator.CountDocuments(ctx, mongodb.ChaosProbeCollection, query)
	if err != nil {
		return false, err
	}

	if count > 0 {
		return false, nil
	}
	return true, nil
}

// UpdateProbe updates details of a Probe
func UpdateProbe(ctx context.Context, query bson.D, updateQuery bson.D) (*mongo.UpdateResult, error) {
	result, err := mongodb.Operator.Update(ctx, mongodb.ChaosProbeCollection, query, updateQuery)
	if err != nil {
		return nil, err
	}
	if result.MatchedCount == 0 {
		return result, errors.New("no matching documents found")
	}
	return result, nil
}

// UpdateProbes updates details of Probe
func UpdateProbes(ctx context.Context, query bson.D, updateQuery bson.D) (*mongo.UpdateResult, error) {
	result, err := mongodb.Operator.UpdateMany(ctx, mongodb.ChaosProbeCollection, query, updateQuery)
	if err != nil {
		return nil, err
	}
	if result.MatchedCount == 0 {
		return result, errors.New("no matching documents found")
	}
	return result, nil
}

// GetProbeByName fetches the details of a single Probe with its Probe Name
func GetProbeByName(ctx context.Context, probeName string, projectID string) (Probe, error) {
	var probe Probe
	result, err := mongodb.Operator.Get(ctx, mongodb.ChaosProbeCollection, bson.D{{"name", probeName}, {"project_id", projectID}, {"is_removed", false}})
	err = result.Decode(&probe)
	if err != nil {
		return Probe{}, err
	}

	return probe, nil
}
