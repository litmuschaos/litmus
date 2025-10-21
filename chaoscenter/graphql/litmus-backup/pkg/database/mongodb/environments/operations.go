package environments

import (
	"context"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	backgroundContext = context.Background()
)

type Operator struct {
	operator mongodb.MongoOperator
}

// NewEnvironmentOperator retuurns a new instance of operator
func NewEnvironmentOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

// InsertEnvironment takes details of a chaos_environment and inserts into the database collection
func (e *Operator) InsertEnvironment(ctx context.Context, environment Environment) error {
	err := e.operator.Create(ctx, mongodb.EnvironmentCollection, environment)
	if err != nil {
		return err
	}

	return nil
}

// GetEnvironment takes a environmentID to retrieve the chaos_environment details from the database
func (e *Operator) GetEnvironment(query bson.D) (Environment, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	var environment Environment
	result, err := e.operator.Get(ctx, mongodb.EnvironmentCollection, query)
	err = result.Decode(&environment)
	if err != nil {
		return Environment{}, err
	}

	return environment, nil
}

// GetEnvironmentDetails takes a environmentName and projectID to retrieve the chaos_environment details from the database
func (e *Operator) GetEnvironmentDetails(ctx context.Context, environmentID string, projectID string) (Environment, error) {
	query := bson.D{
		{"project_id", projectID},
		{"environment_id", environmentID},
	}

	var environment Environment
	result, err := e.operator.Get(ctx, mongodb.EnvironmentCollection, query)
	err = result.Decode(&environment)
	if err != nil {
		return Environment{}, err
	}

	return environment, nil
}

// UpdateEnvironment takes query and update parameters to update the chaos_environment details in the database
func (e *Operator) UpdateEnvironment(ctx context.Context, query bson.D, update bson.D) error {
	_, err := e.operator.UpdateMany(ctx, mongodb.EnvironmentCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// GetEnvironmentWithProjectID takes projectID parameters to retrieve the chaos_environment details
func (e *Operator) GetEnvironmentWithProjectID(projectID string) ([]*Environment, error) {
	var query bson.D
	query = bson.D{

		{"project_id", projectID},
		{"is_removed", false},
	}

	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	var environments []*Environment
	results, err := mongodb.Operator.List(ctx, mongodb.EnvironmentCollection, query)
	if err != nil {
		return []*Environment{}, err
	}

	err = results.All(ctx, &environments)
	if err != nil {
		return []*Environment{}, err
	}

	return environments, nil
}

// GetEnvironments returns all the environments matching the query
func (e *Operator) GetEnvironments(ctx context.Context, query bson.D) ([]Environment, error) {
	var environments []Environment
	results, err := e.operator.List(ctx, mongodb.EnvironmentCollection, query)
	if err != nil {
		return []Environment{}, err
	}
	err = results.All(ctx, &environments)
	if err != nil {
		return []Environment{}, err
	}
	return environments, nil
}

// GetAggregateEnvironments takes a mongo pipeline to retrieve the details from the database
func (e *Operator) GetAggregateEnvironments(pipeline mongo.Pipeline) (*mongo.Cursor, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	results, err := e.operator.Aggregate(ctx, mongodb.EnvironmentCollection, pipeline)
	if err != nil {
		return nil, err
	}

	return results, nil
}
