package types

// workflow data
type WorkflowEvent struct {
	WorkflowID        string          `json:"-"`
	EventType         string          `json:"event_type"`
	UID               string          `json:"-"`
	Namespace         string          `json:"namespace"`
	Name              string          `json:"name"`
	CreationTimestamp string          `json:"creationTimestamp"`
	Phase             string          `json:"phase"`
	StartedAt         string          `json:"startedAt"`
	FinishedAt        string          `json:"finishedAt"`
	Nodes             map[string]Node `json:"nodes"`
}

// each node/step data
type Node struct {
	Name       string     `json:"name"`
	Phase      string     `json:"phase"`
	StartedAt  string     `json:"startedAt"`
	FinishedAt string     `json:"finishedAt"`
	Children   []string   `json:"children"`
	Type       string     `json:"type"`
	ChaosExp   *ChaosData `json:"chaosData,omitempty"`
}

// chaos data
type ChaosData struct {
	EngineUID              string `json:"engineUID"`
	EngineName             string `json:"engineName"`
	Namespace              string `json:"namespace"`
	ExperimentName         string `json:"experimentName"`
	ExperimentStatus       string `json:"experimentStatus"`
	LastUpdatedAt          string `json:"lastUpdatedAt"`
	ExperimentVerdict      string `json:"experimentVerdict"`
	ExperimentPod          string `json:"experimentPod"`
	RunnerPod              string `json:"runnerPod"`
	ProbeSuccessPercentage string `json:"probeSuccessPercentage"`
	FailStep               string `json:"failStep"`
}
