package chaos_experiment

import (
	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
)

type ExperimentRunMetrics struct {
	ResiliencyScore  float64 `json:"resiliency_score"`
	FaultsPassed     int     `json:"faults_passed"`
	FaultsFailed     int     `json:"faults_failed"`
	FaultsAwaited    int     `json:"faults_awaited"`
	FaultsStopped    int     `json:"faults_stopped"`
	FaultsNA         int     `json:"experiments_na"`
	TotalExperiments int     `json:"total_faults"`
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

// Node represents each node/step data
type Node struct {
	Name       string     `json:"name"`
	Phase      string     `json:"phase"`
	Message    string     `json:"message"`
	StartedAt  string     `json:"startedAt"`
	FinishedAt string     `json:"finishedAt"`
	Children   []string   `json:"children"`
	Type       string     `json:"type"`
	ChaosExp   *ChaosData `json:"chaosData,omitempty"`
}

// ChaosData is the data we get from chaos exporter
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

type ExperimentSyncExternalData struct {
	ExperimentID     string    `json:"experiment_id"`
	ExperimentRunID  string    `json:"experiment_run_id"`
	ExperimentRunIDs []*string `json:"experiment_run_ids"`
}

// LatestExperimentRun represents the details of the latest experiment run
type LatestExperimentRun struct {
	ExperimentRunID string `bson:"experiment_run_id"`
	// Resiliency score of the experiment
	ResiliencyScore *float64 `bson:"resiliency_score"`
	// Timestamp at which experiment run was last updated
	LastUpdated string `bson:"updated_at"`
	// Phase of the experiment run
	Phase string `bson:"phase"`
}

// AverageResScore represents the avg_resiliency_score and total_experiment_runs of a experiment
type AverageResScore struct {
	ID                  string  `bson:"_id"`
	Avg                 float64 `bson:"avg_resiliency_score"`
	TotalExperimentRuns int     `bson:"total_experiment_runs"`
}

// experimentRunDetails is used to decode mongo cursor consisting of experiment run details
type experimentRunDetails struct {
	ID                   string              `bson:"_id"`
	ExperimentRunDetails LatestExperimentRun `bson:"experiment_run_details"`
}

// ExperimentDetails is used to decode mongo cursor consisting of experiment details
type ExperimentDetails struct {
	ID                  string                 `bson:"_id"`
	AverageResScore     []AverageResScore      `bson:"avg_resiliency_score"`
	PercentageChange    float64                `bson:"percentage_change"`
	LatestExperimentRun []experimentRunDetails `bson:"latest_experiment_run"`
}

// LastRunDetails represents the details of latest experiment run.
// avg_resiliency_score and percentage_change in resiliency_score of a experiment
type LastRunDetails struct {
	ID                  string              `bson:"_id"`
	AvgResScore         float64             `bson:"avg_resiliency_score"`
	PercentageChange    float64             `bson:"percentage_change"`
	LatestExperimentRun LatestExperimentRun `bson:"latest_experiment_run"`
}

type StopExperimentInputs struct {
	ExperimentName   string   `json:"experiment_name"`
	ExperimentID     string   `json:"experiment_id"`
	ExperimentRunIDs []string `json:"experiment_run_ids"`
}

type InfraDetails struct {
	InfraID string `json:"infra_id"`
	Version string `json:"version"`
}

type ProbeDetailsForAnalytics struct {
	Name string `json:"probe_name"`
	Type string `json:"probe_type"`
	Mode string `json:"probe_mode"`
}

type FaultDetailsForAnalytics struct {
	FaultName   string                     `json:"fault_name"`
	TotalProbes int                        `json:"total_probes"`
	Probes      []ProbeDetailsForAnalytics `json:"probes"`
}
