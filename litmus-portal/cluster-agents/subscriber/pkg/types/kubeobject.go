package types

import (
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
)

type PodInfo struct {
	Name              string
	UID               types.UID
	Namespace         string
	APIVersion        string
	ClusterName       string
	CreationTimestamp metav1.Time
	Containers        []v1.Container
	NodeSelectors     map[string]string
	Labels            map[string]string
	Annotations       map[string]string
}

type DeploymentInfo struct {
	Name              string
	UID               types.UID
	Namespace         string
	APIVersion        string
	ClusterName       string
	CreationTimestamp metav1.Time
	Replicas          *int32
	NodeSelectors     map[string]string
	LabelSelectors    metav1.LabelSelector
	Labels            map[string]string
	Annotations       map[string]string
}

type StatefulSetInfo struct {
	Name 					string
	UID             		types.UID
	Namespace         		string
	APIVersion        		string
	ClusterName       		string
	CreationTimestamp 		metav1.Time
	Replicas                *int32
	TerminationGracePeriods *int64
	VolumeClaimTemplate 	[]v1.PersistentVolumeClaim
	NodeSelectors     		map[string]string
	Labels            		map[string]string
	Annotations       		map[string]string
}

type DaemonsetInfo struct {
	Name 					string
	UID             		types.UID
	Namespace         		string
	APIVersion        		string
	CreationTimestamp 		metav1.Time
	Containers        		[]v1.Container
	TerminationGracePeriods *int64
	Volumes				 	[]v1.Volume
	NodeSelectors     		map[string]string
	Labels            		map[string]string
	Annotations       		map[string]string
}

type KubeObject struct {
	Namespace   	string 				`json:"namespace"`
	Pods        	[]PodInfo 			`json:"pods",omitempty`
	DeploymentInfo 	[]DeploymentInfo 	`json:"deployments",omitempty`
	StatefulSetInfo	[]StatefulSetInfo	`json:"statefulsets",omitempty`
	DaemonsetInfo	[]DaemonsetInfo		`json:"daemonsets",omitempty'`
}
