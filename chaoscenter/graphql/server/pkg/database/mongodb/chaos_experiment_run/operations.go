package chaos_experiment_run

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

func NewChaosExperimentRunOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

func (c *Operator) CreateExperimentRun(ctx context.Context, wfRun ChaosExperimentRun) error {
	err := c.operator.Create(ctx, mongodb.ChaosExperimentRunsCollection, wfRun)
	if err != nil {
		return err
	}
	return nil
}

func (c *Operator) GetExperimentRuns(query bson.D) ([]ChaosExperimentRun, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	var experiments []ChaosExperimentRun

	results, err := c.operator.List(ctx, mongodb.ChaosExperimentRunsCollection, query)
	if err != nil {
		return nil, err
	}
	err = results.All(ctx, &experiments)
	if err != nil {
		return nil, err
	}

	return experiments, nil
}

func (c *Operator) CountExperimentRuns(ctx context.Context, query bson.D) (int64, error) {
	results, err := c.operator.CountDocuments(ctx, mongodb.ChaosExperimentRunsCollection, query)
	if err != nil {
		return 0, err
	}
	return results, nil
}

func (c *Operator) GetExperimentRun(query bson.D) (ChaosExperimentRun, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	var experimentRun ChaosExperimentRun
	results, err := c.operator.Get(ctx, mongodb.ChaosExperimentRunsCollection, query)
	if err != nil {
		return ChaosExperimentRun{}, err
	}
	err = results.Decode(&experimentRun)
	if err != nil {
		return ChaosExperimentRun{}, err
	}

	return experimentRun, nil
}

// UpdateExperimentRun takes experimentID and wfRun parameters to update the experiment run details in the database
func (c *Operator) UpdateExperimentRun(ctx context.Context, wfRun ChaosExperimentRun) (int, error) {
	query := bson.D{
		{"experiment_id", wfRun.ExperimentID},
		{"experiment_run_id", wfRun.ExperimentRunID},
	}

	if wfRun.NotifyID != nil {
		query = bson.D{
			{"experiment_id", wfRun.ExperimentID},
			{"notify_id", wfRun.NotifyID},
		}
	}

	count, err := c.operator.CountDocuments(ctx, mongodb.ChaosExperimentRunsCollection, query)
	if err != nil {
		return 0, err
	}

	updateCount := 1
	if count == 0 {
		//Audit details for first time creation
		wfRun.CreatedAt = time.Now().UnixMilli()
		err := c.operator.Create(ctx, mongodb.ChaosExperimentRunsCollection, wfRun)
		if err != nil {
			return 0, err
		}
	} else if count == 1 {
		updateQuery := bson.D{
			{"experiment_id", wfRun.ExperimentID},
			{"experiment_run_id", wfRun.ExperimentRunID},
			{"completed", false},
		}

		if wfRun.NotifyID != nil {
			updateQuery = bson.D{
				{"experiment_id", wfRun.ExperimentID},
				{"notify_id", wfRun.NotifyID},
				{"completed", false},
			}
		}

		update := bson.D{
			{"$set", bson.D{
				{"experiment_run_id", wfRun.ExperimentRunID},
				{"phase", wfRun.Phase},
				{"resiliency_score", wfRun.ResiliencyScore},
				{"faults_passed", wfRun.FaultsPassed},
				{"faults_failed", wfRun.FaultsFailed},
				{"faults_awaited", wfRun.FaultsAwaited},
				{"faults_stopped", wfRun.FaultsStopped},
				{"faults_na", wfRun.FaultsNA},
				{"total_faults", wfRun.TotalFaults},
				{"execution_data", wfRun.ExecutionData},
				{"completed", wfRun.Completed},
				{"updated_by", wfRun.UpdatedBy},
				{"updated_at", wfRun.UpdatedAt},
				{"is_removed", wfRun.IsRemoved},
			}}}

		result, err := c.operator.Update(ctx, mongodb.ChaosExperimentRunsCollection, updateQuery, update)
		if err != nil {
			return 0, err
		}

		updateCount = int(result.MatchedCount)
	}
	return updateCount, nil
}

func (c *Operator) UpdateExperimentRunWithQuery(ctx context.Context, query bson.D, update bson.D) error {
	_, err := c.operator.Update(ctx, mongodb.ChaosExperimentRunsCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

func (c *Operator) UpdateExperimentRunsWithQuery(ctx context.Context, query bson.D, update bson.D) error {

	_, err := c.operator.UpdateMany(ctx, mongodb.ChaosExperimentRunsCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// GetExperimentRunsByInfraID takes a infraID parameter to retrieve the experiment details from the database
func (c *Operator) GetExperimentRunsByInfraID(infraID string) ([]ChaosExperimentRun, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	query := bson.D{{"infra_id", infraID}}
	results, err := c.operator.List(ctx, mongodb.ChaosExperimentRunsCollection, query)
	if err != nil {
		return nil, err
	}

	var experiments []ChaosExperimentRun
	err = results.All(ctx, &experiments)
	if err != nil {
		return nil, err
	}
	return experiments, nil
}

// GetAggregateExperimentRuns takes a mongo pipeline to retrieve the experiment details from the database
func (c *Operator) GetAggregateExperimentRuns(pipeline mongo.Pipeline) (*mongo.Cursor, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	results, err := c.operator.Aggregate(ctx, mongodb.ChaosExperimentRunsCollection, pipeline)
	if err != nil {
		return nil, err
	}

	return results, nil
}
