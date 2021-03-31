package types

import (
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
)

type PodInfo struct {
	Name              string            `json:"name"`
	UID               types.UID         `json:"uid"`
	Namespace         string            `json:"namespace"`
	APIVersion        string            `json:"api_version"`
	ClusterName       string            `json:"cluster_name"`
	CreationTimestamp metav1.Time       `json:"creation_timestamp"`
	Containers        []v1.Container    `json:"containers"`
	NodeSelectors     map[string]string `json:"node_selectors"`
	Labels            map[string]string `json:"labels"`
	Annotations       map[string]string `json:"annotations"`
}

type DeploymentInfo struct {
	Name              string               `json:"name"`
	UID               types.UID            `json:"uid"`
	Namespace         string               `json:"namespace"`
	APIVersion        string               `json:"api_version"`
	ClusterName       string               `json:"cluster_name"`
	CreationTimestamp metav1.Time          `json:"creation_timestamp"`
	Replicas          *int32               `json:"replicas"`
	NodeSelectors     map[string]string    `json:"node_selectors"`
	LabelSelectors    metav1.LabelSelector `json:"label_selectors"`
	Labels            map[string]string    `json:"labels"`
	Annotations       map[string]string    `json:"annotations"`
}

type StatefulSetInfo struct {
	Name                    string                     `json:"name"`
	UID                     types.UID                  `json:"uid"`
	Namespace               string                     `json:"namespace"`
	APIVersion              string                     `json:"api_version"`
	ClusterName             string                     `json:"cluster_name"`
	CreationTimestamp       metav1.Time                `json:"creation_timestamp"`
	Replicas                *int32                     `json:"replicas"`
	TerminationGracePeriods *int64                     `json:"termination_grace_periods"`
	VolumeClaimTemplate     []v1.PersistentVolumeClaim `json:"volume_claim_template"`
	NodeSelectors           map[string]string          `json:"node_selectors"`
	Labels                  map[string]string          `json:"labels"`
	Annotations             map[string]string          `json:"annotations"`
}

type DaemonsetInfo struct {
	Name                    string            `json:"name"`
	UID                     types.UID         `json:"uid"`
	Namespace               string            `json:"namespace"`
	APIVersion              string            `json:"api_version"`
	CreationTimestamp       metav1.Time       `json:"creation_timestamp"`
	Containers              []v1.Container    `json:"containers"`
	TerminationGracePeriods *int64            `json:"termination_grace_periods"`
	Volumes                 []v1.Volume       `json:"volumes"`
	NodeSelectors           map[string]string `json:"node_selectors"`
	Labels                  map[string]string `json:"labels"`
	Annotations             map[string]string `json:"annotations"`
}

type DeploymentConfigInfo struct {
	Name       string            `json:"name"`
	APIVersion string            `json:"api_version"`
	Labels     map[string]string `json:"labels"`
}

type Rollouts struct {
	Name       string            `json:"name"`
	APIVersion string            `json:"api_version"`
	Labels     map[string]string `json:"labels"`
}

type KubeObject struct {
	Namespace            string                 `json:"namespace"`
	Pods                 []PodInfo              `json:"pods",omitempty`
	DeploymentInfo       []DeploymentInfo       `json:"deployments",omitempty`
	StatefulSetInfo      []StatefulSetInfo      `json:"statefulsets",omitempty`
	DaemonsetInfo        []DaemonsetInfo        `json:"daemonsets",omitempty'`
	DeploymentConfigInfo []DeploymentConfigInfo `json:"deploymentconfiginfo",omitempty`
	Rollouts             []Rollouts             `json:"rollouts",omitempty`
}
