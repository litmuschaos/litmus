package types

import "encoding/json"

type OperationMessage struct {
	Payload json.RawMessage `json:"payload,omitempty"`
	ID      string          `json:"id,omitempty"`
	Type    string          `json:"type"`
}

type RawData struct {
	Payload Payload `json:"payload"`
	Type    string  `json:"type"`
}

type Payload struct {
	Errors interface{} `json:"errors"`
	Data   Data        `json:"data"`
}

type Data struct {
	InfraConfirm InfraConfirm `json:"confirmInfraRegistration"`
	InfraConnect InfraConnect `json:"infraConnect"`
}

type InfraConfirm struct {
	IsInfraConfirmed bool   `json:"isInfraConfirmed"`
	NewAccessKey     string `json:"newAccessKey"`
	InfraID          string `json:"infraID"`
}

type InfraConnect struct {
	ProjectID string `json:"projectID"`
	Action    Action `json:"action"`
}

type Action struct {
	RequestID    string `json:"requestID"`
	K8SManifest  string `json:"k8sManifest"`
	ExternalData string `json:"externalData"`
	RequestType  string `json:"requestType"`
	Username     string `json:"username"`
	Namespace    string `json:"namespace"`
}

type WorkflowSyncExternalData struct {
	WorkflowID    string `json:"workflowID"`
	WorkflowRunID string `json:"workflowRunID"`
}

type WorkflowStopExternalData struct {
	WorkflowName   string   `json:"workflow_name"`
	WorkflowID     string   `json:"workflow_id"`
	WorkflowRunIDs []string `json:"workflow_run_ids"`
}
