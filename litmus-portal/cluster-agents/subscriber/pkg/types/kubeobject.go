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

type ObjectData struct {
	Name                    string            `json:"name"`
	UID                     types.UID         `json:"uid"`
	Namespace               string            `json:"namespace"`
	APIVersion              string            `json:"api_version"`
	CreationTimestamp       metav1.Time       `json:"creation_timestamp"`
	Containers              []v1.Container    `json:"containers"`
	TerminationGracePeriods *int64            `json:"termination_grace_periods"`
	Volumes                 []v1.Volume       `json:"volumes"`
	Labels                  map[string]string `json:"labels"`
}
