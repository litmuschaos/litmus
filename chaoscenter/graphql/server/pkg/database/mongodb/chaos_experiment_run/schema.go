package chaos_experiment_run

import "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

// ChaosExperimentRun contains the required fields to be stored in the database for an experiment run
type ChaosExperimentRun struct {
	ProjectID       string `bson:"project_id"`
	mongodb.Audit   `bson:",inline"`
	InfraID         string   `bson:"infra_id"`
	ExperimentRunID string   `bson:"experiment_run_id"`
	ExperimentID    string   `bson:"experiment_id"`
	ExperimentName  string   `bson:"experiment_name"`
	Phase           string   `bson:"phase"`
	Probes          []Probes `bson:"probes"`
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
	RunSequence     int      `bson:"run_sequence"`
	Completed       bool     `bson:"completed"`
}

type Probes struct {
	FaultName  string   `bson:"fault_name" json:"faultName"`
	ProbeNames []string `bson:"probe_names" json:"probeNames"`
}

type TotalFilteredData struct {
	Count int `bson:"count"`
}

type WeightagesInput struct {
	ExperimentName string `bson:"experiment_name"`
	Weightage      int    `bson:"weightage"`
}

type FlattenedExperimentRun struct {
	ProjectID        string             `bson:"project_id"`
	InfraID          string             `bson:"infra_id"`
	ExperimentRunID  string             `bson:"experiment_run_id"`
	ExperimentID     string             `bson:"experiment_id"`
	ExperimentName   string             `bson:"experiment_name"`
	CronSyntax       string             `bson:"cronSyntax"`
	Weightages       []*WeightagesInput `bson:"weightages"`
	IsCustomWorkflow bool               `bson:"isCustomWorkflow"`
	UpdatedAt        string             `bson:"updated_at"`
	CreatedAt        string             `bson:"created_at"`
	ExperimentRuns   ChaosExperimentRun `bson:"experiment_runs"`
	IsRemoved        bool               `bson:"isRemoved"`
}
