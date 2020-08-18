package cluster

import (
	"context"
)

type Response struct {
	Data Data `json:"data"`
}

type Data struct {
	ClusterConnect ClusterConnect `json:"clusterConnect"`
}

type ClusterConnect struct {
	ProjectID string `json:"project_id"`
	Action    Action `json:"action"`
}

type Action struct {
	K8SManifest  string      `json:"k8s_manifest"`
	ExternalData interface{} `json:"external_data"`
	RequestType  string      `json:"request_type"`
}

type Subscriber struct {
	ClusterKey string
	ClusterID  string
	Ctx        context.Context
	KubeConfig *string
}
