package types

type PodLogRequest struct {
	RequestID      string
	ClusterID      string  `json:"clusterID"`
	WorkflowRunID  string  `json:"workflowRunID"`
	PodName        string  `json:"podName"`
	PodNamespace   string  `json:"podNamespace"`
	PodType        string  `json:"podType"`
	ExpPod         *string `json:"expPod"`
	RunnerPod      *string `json:"runnerPod"`
	ChaosNamespace *string `json:"chaosNamespace"`
}

// PodLog consists logs from Chaos related pods and experiment pods
type PodLog struct {
	MainPod  string            `json:"mainLogs"`
	ChaosPod map[string]string `json:"chaosLogs",omitempty`
}
