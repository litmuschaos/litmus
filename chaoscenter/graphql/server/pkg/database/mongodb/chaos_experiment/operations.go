package chaos_experiment

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo/options"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

	"go.mongodb.org/mongo-driver/bson"
)

var (
	backgroundContext = context.Background()
)

// Operator is the model for cluster collection
type Operator struct {
	operator mongodb.MongoOperator
}

// NewChaosExperimentOperator returns a new instance of Operator
func NewChaosExperimentOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

// GetExperiments takes a query parameter to retrieve the experiment details from the database
func (c *Operator) GetExperiments(query bson.D) ([]ChaosExperimentRequest, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	results, err := c.operator.List(ctx, mongodb.ChaosExperimentCollection, query)
	if err != nil {
		return nil, err
	}

	var experiments []ChaosExperimentRequest
	err = results.All(ctx, &experiments)
	if err != nil {
		return nil, err
	}

	return experiments, nil
}

// GetExperiment takes a query parameter to retrieve the experiment details from the database
func (c *Operator) GetExperiment(ctx context.Context, query bson.D) (ChaosExperimentRequest, error) {
	var experiment ChaosExperimentRequest
	results, err := c.operator.Get(ctx, mongodb.ChaosExperimentCollection, query)
	if err != nil {
		return ChaosExperimentRequest{}, err
	}

	err = results.Decode(&experiment)
	if err != nil {
		return ChaosExperimentRequest{}, err
	}

	return experiment, nil
}

// GetAggregateExperiments takes a mongo pipeline to retrieve the experiment details from the database
func (c *Operator) GetAggregateExperiments(pipeline mongo.Pipeline) (*mongo.Cursor, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	results, err := c.operator.Aggregate(ctx, mongodb.ChaosExperimentCollection, pipeline)
	if err != nil {
		return nil, err
	}

	return results, nil
}

// GetExperimentsByInfraID takes a infraID parameter to retrieve the experiment details from the database
func (c *Operator) GetExperimentsByInfraID(infraID string) ([]ChaosExperimentRequest, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	query := bson.D{{"infra_id", infraID}}
	results, err := c.operator.List(ctx, mongodb.ChaosExperimentCollection, query)
	if err != nil {
		return nil, err
	}

	var experiments []ChaosExperimentRequest
	err = results.All(ctx, &experiments)
	if err != nil {
		return nil, err
	}
	return experiments, nil
}

// InsertChaosExperiment takes details of a experiment and inserts into the database collection
func (c *Operator) InsertChaosExperiment(ctx context.Context, chaosExperiment ChaosExperimentRequest) error {
	err := c.operator.Create(ctx, mongodb.ChaosExperimentCollection, chaosExperiment)
	if err != nil {
		return err
	}
	return nil
}

// UpdateChaosExperiment takes query and update parameters to update the experiment details in the database
func (c *Operator) UpdateChaosExperiment(ctx context.Context, query bson.D, update bson.D, opts ...*options.UpdateOptions) error {
	_, err := c.operator.Update(ctx, mongodb.ChaosExperimentCollection, query, update, opts...)
	if err != nil {
		return err
	}
	return nil
}

// UpdateChaosExperiments takes query and update parameters to updates multiple experiment's details in the database
func (c *Operator) UpdateChaosExperiments(ctx context.Context, query bson.D, update bson.D) error {

	_, err := c.operator.UpdateMany(ctx, mongodb.ChaosExperimentCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// CountChaosExperiments returns total number of matched documents
func (c *Operator) CountChaosExperiments(ctx context.Context, query bson.D) (int64, error) {
	res, err := c.operator.CountDocuments(ctx, mongodb.ChaosExperimentCollection, query)
	if err != nil {
		return 0, err
	}
	return res, nil
}
