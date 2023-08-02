package chaos_experiment_run

import (
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
)

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

type ExecutionData struct {
	ExperimentType    string          `json:"experimentType"`
	ExperimentID      string          `json:"experimentID"`
	EventType         string          `json:"eventType"`
	RevisionID        string          `json:"revisionID"`
	UID               string          `json:"uid"`
	Namespace         string          `json:"namespace"`
	Name              string          `json:"name"`
	CreationTimestamp string          `json:"creationTimestamp"`
	Phase             string          `json:"phase"`
	Message           string          `json:"message"`
	StartedAt         string          `json:"startedAt"`
	FinishedAt        string          `json:"finishedAt"`
	Nodes             map[string]Node `json:"nodes"`
}

type Node struct {
	Name       string     `json:"name"`
	Phase      string     `json:"phase"`
	Message    string     `json:"message"`
	StartedAt  string     `json:"startedAt"`
	FinishedAt string     `json:"finishedAt"`
	Children   []string   `json:"children"`
	Type       string     `json:"type"`
	ChaosExp   *ChaosData `json:"chaos_data,omitempty"`
}

type ChaosData struct {
	EngineUID              string                  `json:"engineUID"`
	EngineContext          string                  `json:"engineContext"`
	EngineName             string                  `json:"engineName"`
	Namespace              string                  `json:"namespace"`
	FaultName              string                  `json:"faultName"`
	FaultStatus            string                  `json:"faultStatus"`
	LastUpdatedAt          string                  `json:"lastUpdatedAt"`
	FaultVerdict           string                  `json:"faultVerdict"`
	ExperimentPod          string                  `json:"experimentPod"`
	RunnerPod              string                  `json:"runnerPod"`
	ProbeSuccessPercentage string                  `json:"probeSuccessPercentage"`
	FailStep               string                  `json:"failStep"`
	ChaosResult            *chaosTypes.ChaosResult `json:"chaosResult"`
}
type ExperimentRunMetrics struct {
	ResiliencyScore  float64 `json:"resiliency_score"`
	FaultsPassed     int     `json:"faults_passed"`
	FaultsFailed     int     `json:"faults_failed"`
	FaultsAwaited    int     `json:"faults_awaited"`
	FaultsStopped    int     `json:"faults_stopped"`
	FaultsNA         int     `json:"experiments_na"`
	TotalExperiments int     `json:"total_faults"`
}
