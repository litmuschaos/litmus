package chaos_infrastructure

import (
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
)

type KubeObjData struct {
	Namespace string       `json:"namespace"`
	Data      []ObjectData `json:"data"`
}

type ObjectData struct {
	Name                    string            `json:"name"`
	UID                     types.UID         `json:"uid"`
	Namespace               string            `json:"namespace"`
	APIVersion              string            `json:"apiVersion"`
	CreationTimestamp       metav1.Time       `json:"creationTimestamp"`
	Containers              []v1.Container    `json:"containers"`
	TerminationGracePeriods *int64            `json:"terminationGracePeriods"`
	Volumes                 []v1.Volume       `json:"volumes"`
	Labels                  map[string]string `json:"labels"`
}

type PodLogData struct {
	InfraID       string `json:"infraID"`
	WorkflowRunID string `json:"workflowRunID"`
	PodName       string `json:"podName"`
	PodType       string `json:"podType"`
	Log           string `json:"log"`
}

// SubscriberRequests contains the required configurable parameters for the requests sent to the subscriber
type SubscriberRequests struct {
	RequestType  string  `json:"request_type"`
	K8sManifest  string  `json:"k8s_manifest"`
	ExternalData *string `json:"external_data"`
	ProjectID    string  `json:"project_id"`
	InfraID      string  `json:"infra_id"`
	Namespace    string  `json:"namespace"`
	Username     *string `json:"username"`
}
