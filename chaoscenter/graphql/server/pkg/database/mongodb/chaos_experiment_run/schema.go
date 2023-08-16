package chaos_experiment_run

import "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

// ChaosExperimentRun contains the required fields to be stored in the database for an experiment run
type ChaosExperimentRun struct {
	ProjectID       string `bson:"project_id"`
	mongodb.Audit   `bson:",inline"`
	InfraID         string   `bson:"infra_id"`
	ExperimentRunID string   `bson:"experiment_run_id"`
	ExperimentID    string   `bson:"experiment_id"`
	Phase           string   `bson:"phase"`
	ExecutionData   string   `bson:"execution_data"`
	RevisionID      string   `bson:"revision_id"`
	NotifyID        *string  `bson:"notify_id"`
	ResiliencyScore *float64 `bson:"resiliency_score,omitempty"`
	FaultsPassed    *int     `bson:"faults_passed,omitempty"`
	FaultsFailed    *int     `bson:"faults_failed,omitempty"`
	FaultsAwaited   *int     `bson:"faults_awaited,omitempty"`
	FaultsStopped   *int     `bson:"faults_stopped,omitempty"`
	FaultsNA        *int     `bson:"faults_na,omitempty"`
	TotalFaults     *int     `bson:"total_faults,omitempty"`
	Completed       bool     `bson:"completed"`
}
