package types

import "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"

// WorkflowEvent consists of workflow related data
type WorkflowEvent struct {
	WorkflowType      string          `json:"workflowType"`
	WorkflowID        string          `json:"-"`
	EventType         string          `json:"eventType"`
	UID               string          `json:"-"`
	Namespace         string          `json:"namespace"`
	Name              string          `json:"name"`
	CreationTimestamp string          `json:"creationTimestamp"`
	Phase             string          `json:"phase"`
	Message           string          `json:"message"`
	StartedAt         string          `json:"startedAt"`
	FinishedAt        string          `json:"finishedAt"`
	Nodes             map[string]Node `json:"nodes"`
	ExecutedBy        string          `json:"executedBy"`
}

// Node consist of node/step data
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

// ChaosData consists of ChaosEngine related data
type ChaosData struct {
	EngineUID              string                `json:"engineUID"`
	EngineContext          string                `json:"engineContext"`
	EngineName             string                `json:"engineName"`
	Namespace              string                `json:"namespace"`
	ExperimentName         string                `json:"experimentName"`
	ExperimentStatus       string                `json:"experimentStatus"`
	LastUpdatedAt          string                `json:"lastUpdatedAt"`
	ExperimentVerdict      string                `json:"experimentVerdict"`
	ExperimentPod          string                `json:"experimentPod"`
	RunnerPod              string                `json:"runnerPod"`
	ProbeSuccessPercentage string                `json:"probeSuccessPercentage"`
	FailStep               string                `json:"failStep"`
	ChaosResult            *v1alpha1.ChaosResult `json:"chaosResult"`
}
