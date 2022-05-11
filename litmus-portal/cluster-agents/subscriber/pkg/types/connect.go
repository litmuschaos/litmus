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
	ClusterConfirm ClusterConfirm `json:"confirmClusterRegistration"`
	ClusterConnect ClusterConnect `json:"clusterConnect"`
}

type ClusterConfirm struct {
	IsClusterConfirmed bool   `json:"isClusterConfirmed"`
	NewAccessKey       string `json:"newAccessKey"`
	ClusterID          string `json:"clusterID"`
}

type ClusterConnect struct {
	ProjectID string `json:"projectID"`
	Action    Action `json:"action"`
}

type Action struct {
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
