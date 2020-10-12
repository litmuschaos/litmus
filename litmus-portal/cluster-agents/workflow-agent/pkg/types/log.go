package types

type PodLogRequest struct {
	RequestID      string
	ClusterID      string  `json:"cluster_id"`
	WorkflowRunID  string  `json:"workflow_run_id"`
	PodName        string  `json:"pod_name"`
	PodNamespace   string  `json:"pod_namespace"`
	PodType        string  `json:"pod_type"`
	ExpPod         *string `json:"exp_pod"`
	RunnerPod      *string `json:"runner_pod"`
	ChaosNamespace *string `json:"chaos_namespace"`
}

type PodLog struct {
	MainPod  string            `json:"main_logs"`
	ChaosPod map[string]string `json:"chaos_logs",omitempty`
}
