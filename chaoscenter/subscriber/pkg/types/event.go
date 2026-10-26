package types

import "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"

// events data
type WorkflowEvent struct {
	WorkflowType      string          `json:"experimentType"`
	RevisionID        string          `json:"revisionID"`
	NotifyID          *string         `json:"notifyID"`
	WorkflowID        string          `json:"experimentID"`
	EventType         string          `json:"eventType"`
	UID               string          `json:"uid"`
	Namespace         string          `json:"namespace"`
	Name              string          `json:"name"`
	CreationTimestamp string          `json:"creationTimestamp"`
	Phase             string          `json:"phase"`
	Message           string          `json:"message"`
	StartedAt         string          `json:"startedAt"`
	FinishedAt        string          `json:"finishedAt"`
	Nodes             map[string]Node `json:"nodes"`
	UpdatedBy         string          `json:"updatedBy"`
}

// each node/step data
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

// chaos data
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

type FaultStatus string

const (
	FaultCompleted                 FaultStatus = "Completed"
	FaultCompletedWithProbeFailure FaultStatus = "Completed_With_Probe_Failure"
	Error                          FaultStatus = "Error"
	Stopped                        FaultStatus = "Stopped"
)
