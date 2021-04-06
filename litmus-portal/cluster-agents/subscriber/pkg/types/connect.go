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
	ClusterConfirm ClusterConfirm `json:"clusterConfirm"`
	ClusterConnect ClusterConnect `json:"clusterConnect"`
}

type ClusterConfirm struct {
	IsClusterConfirmed bool   `json:isClusterConfirmed`
	NewAccessKey       string `json:newAccessKey`
	ClusterID          string `json:cluster_id`
}

type ClusterConnect struct {
	ProjectID string `json:"project_id"`
	Action    Action `json:"action"`
}

type KubeObjRequest struct {
	RequestID      string
	ClusterID      string         `json:"cluster_id"`
	ObjectType     string         `json:"object_type"`
	KubeGVRRequest KubeGVRRequest `json:"kube_obj_request"`
}

type KubeGVRRequest struct {
	Group    string `json:"group"`
	Version  string `json:"version"`
	Resource string `json:"resource"`
}

type Action struct {
	K8SManifest  string      `json:"k8s_manifest"`
	ExternalData interface{} `json:"external_data"`
	RequestType  string      `json:"request_type"`
	Namespace    string      `json:"namespace"`
}
