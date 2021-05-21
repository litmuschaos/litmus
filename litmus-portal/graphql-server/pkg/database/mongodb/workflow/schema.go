package workflow

import (
	chaosTypes "github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
)

// ChaosWorkFlowInput contains the required fields to be stored in the database for a chaos workflow input
type ChaosWorkFlowInput struct {
	WorkflowID          string              `bson:"workflow_id"`
	WorkflowManifest    string              `bson:"workflow_manifest"`
	CronSyntax          string              `bson:"cronSyntax"`
	WorkflowName        string              `bson:"workflow_name"`
	WorkflowDescription string              `bson:"workflow_description"`
	Weightages          []*WeightagesInput  `bson:"weightages"`
	IsCustomWorkflow    bool                `bson:"isCustomWorkflow"`
	UpdatedAt           string              `bson:"updated_at"`
	CreatedAt           string              `bson:"created_at"`
	ProjectID           string              `bson:"project_id"`
	ClusterID           string              `bson:"cluster_id"`
	WorkflowRuns        []*ChaosWorkflowRun `bson:"workflow_runs"`
	IsRemoved           bool                `bson:"isRemoved"`
}

// WeightagesInput contains the required fields to be stored in the database for a weightages input
type WeightagesInput struct {
	ExperimentName string `bson:"experiment_name"`
	Weightage      int    `bson:"weightage"`
}

// ChaosWorkflowRun contains the required fields to be stored in the database for a workflow run
type ChaosWorkflowRun struct {
	WorkflowRunID string `bson:"workflow_run_id"`
	LastUpdated   string `bson:"last_updated"`
	ExecutionData string `bson:"execution_data"`
	Completed     bool   `bson:"completed"`
}

type ExecutionData struct {
	WorkflowID        string          `json:"-"`
	EventType         string          `json:"event_type"`
	UID               string          `json:"-"`
	Namespace         string          `json:"namespace"`
	Name              string          `json:"name"`
	CreationTimestamp string          `json:"creationTimestamp"`
	Phase             string          `json:"phase"`
	Message           string          `json:"message"`
	StartedAt         string          `json:"startedAt"`
	FinishedAt        string          `json:"finishedAt"`
	Nodes             map[string]Node `json:"nodes"`
	ResiliencyScore   float64         `json:"resiliency_score,string,omitempty"`
	ExperimentsPassed int             `json:"experiments_passed,string,omitempty"`
	TotalExperiments  int             `json:"total_experiments,string,omitempty"`
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
	EngineName             string                  `json:"engineName"`
	Namespace              string                  `json:"namespace"`
	ExperimentName         string                  `json:"experimentName"`
	ExperimentStatus       string                  `json:"experimentStatus"`
	LastUpdatedAt          string                  `json:"lastUpdatedAt"`
	ExperimentVerdict      string                  `json:"experimentVerdict"`
	ExperimentPod          string                  `json:"experimentPod"`
	RunnerPod              string                  `json:"runnerPod"`
	ProbeSuccessPercentage string                  `json:"probeSuccessPercentage"`
	FailStep               string                  `json:"failStep"`
	ChaosResult            *chaosTypes.ChaosResult `json:"chaosResult"`
}
