package types

import (
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
)

type KubeObject struct {
	Namespace string       `json:"namespace"`
	Data      []ObjectData `json:"data"`
}

type KubeObjRequest struct {
	RequestID      string
	InfraID        string         `json:"infraID"`
	ObjectType     string         `json:"objectType"`
	KubeGVRRequest KubeGVRRequest `json:"kubeObjRequest"`
}

type KubeGVRRequest struct {
	Group    string `json:"group"`
	Version  string `json:"version"`
	Resource string `json:"resource"`
}

type ObjectData struct {
	Name                    string         `json:"name"`
	UID                     types.UID      `json:"uid"`
	Namespace               string         `json:"namespace"`
	APIVersion              string         `json:"apiVersion"`
	CreationTimestamp       metav1.Time    `json:"creationTimestamp"`
	Containers              []v1.Container `json:"containers"`
	TerminationGracePeriods *int64         `json:"terminationGracePeriods"`
	Volumes                 []v1.Volume    `json:"volumes"`
	Labels                  []string       `json:"labels"`
}
