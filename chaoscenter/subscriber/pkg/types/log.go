package types

type PodLogRequest struct {
	RequestID       string  `json:"requestID"`
	InfraID         string  `json:"infraID"`
	ExperimentRunID string  `json:"experimentRunID"`
	PodName         string  `json:"podName"`
	PodNamespace    string  `json:"podNamespace"`
	PodType         string  `json:"podType"`
	ExpPod          *string `json:"expPod"`
	RunnerPod       *string `json:"runnerPod"`
	ChaosNamespace  *string `json:"chaosNamespace"`
}

type PodLog struct {
	MainPod  string            `json:"mainLogs"`
	ChaosPod map[string]string `json:"chaosLogs,omitempty"`
}
