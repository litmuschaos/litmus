package workloads

import (
	"context"
	"fmt"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"k8s.io/client-go/kubernetes"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	Deployment            string = "Deployment"
	ReplicaSet            string = "ReplicaSet"
	DaemonSet             string = "DaemonSet"
	StatefulSet           string = "StatefulSet"
	DeploymentConfig      string = "DeploymentConfig"
	ReplicationController string = "ReplicationController"
	Rollout               string = "Rollout"
)

func GetPodsFromWorkloads(workloads []types.Workload, client *kubernetes.Clientset) (map[string][]string, error) {

	workloadMap := aggregateWorkloadsByNamespace(workloads)

	result := make(map[string][]string)
	for ns, w := range workloadMap {
		allPods, err := getAllPods(ns, client)
		if err != nil {
			return nil, err
		}
		var selectedPods []string
		for kind, wld := range w.WorkloadKindMap {
			pods, err := getPodsByAppKind(kind, ns, allPods, wld, client)
			if err != nil {
				return nil, err
			}
			selectedPods = append(selectedPods, pods...)
		}
		result[ns] = removeDuplicateItems(selectedPods)
	}
	return result, nil
}

func getPodsByAppKind(kind, ns string, allPods *corev1.PodList, wld []string, client *kubernetes.Clientset) ([]string, error) {
	switch kind {
	case "deployment", "deployments":
		return GetPodsFromWorkload(ns, Deployment, allPods, wld, client, managedByReplicaSet)
	case "rollout", "rollouts":
		return GetPodsFromWorkload(ns, Rollout, allPods, wld, client, managedByReplicaSet)
	case "daemonset", "daemonsets":
		return GetPodsFromWorkload(ns, DaemonSet, allPods, wld, client, managedByWorkloadDirectly)
	case "statefulset", "statefulsets":
		return GetPodsFromWorkload(ns, StatefulSet, allPods, wld, client, managedByWorkloadDirectly)
	case "deploymentconfig", "deploymentconfigs":
		return GetPodsFromWorkload(ns, DeploymentConfig, allPods, wld, client, managedByReplicaController)
	case "service", "services":
		return GetPodsFromServices(ns, wld, client)
	default:
		return nil, fmt.Errorf("unsupported appkind: %v", kind)
	}
}

func aggregateWorkloadsByNamespace(workloads []types.Workload) map[string]workload {
	result := make(map[string]workload)
	for _, w := range workloads {
		data, ok := result[w.Namespace]
		if !ok {
			result[w.Namespace] = workload{
				WorkloadKindMap: map[string][]string{
					w.Kind: {w.Name},
				},
			}
			continue
		}
		data.WorkloadKindMap[w.Kind] = append(data.WorkloadKindMap[w.Kind], w.Name)
		result[w.Namespace] = data
	}
	return result
}

func getAllPods(namespace string, client *kubernetes.Clientset) (*corev1.PodList, error) {
	return client.CoreV1().Pods(namespace).List(context.Background(), v1.ListOptions{})
}

func getAllReplicaSets(namespace string, client *kubernetes.Clientset) (*appsv1.ReplicaSetList, error) {
	return client.AppsV1().ReplicaSets(namespace).List(context.Background(), v1.ListOptions{})
}

func getAllReplicaControllers(namespace string, client *kubernetes.Clientset) (*corev1.ReplicationControllerList, error) {
	return client.CoreV1().ReplicationControllers(namespace).List(context.Background(), v1.ListOptions{})
}

func getReplicaSetsFromWorkload(ns, kind string, wld []string, client *kubernetes.Clientset) ([]string, error) {
	allRS, err := getAllReplicaSets(ns, client)
	if err != nil {
		return nil, err
	}

	var rs []string
	for _, r := range allRS.Items {
		if checkOwnerRef(r.OwnerReferences, wld, kind) {
			rs = append(rs, r.Name)
		}
	}
	return rs, nil
}

func getReplicaControllersFromWorkload(ns, kind string, wld []string, client *kubernetes.Clientset) ([]string, error) {
	allRC, err := getAllReplicaControllers(ns, client)
	if err != nil {
		return nil, err
	}

	var rc []string
	for _, r := range allRC.Items {
		if checkOwnerRef(r.OwnerReferences, wld, kind) {
			rc = append(rc, r.Name)
		}
	}
	return rc, nil
}

type workload struct {
	WorkloadKindMap map[string][]string
}

func removeDuplicateItems(slice []string) []string {
	var unique []string
	for _, v := range slice {
		if !contains(v, unique) {
			unique = append(unique, v)
		}
	}
	return unique
}

func contains(val string, slice []string) bool {
	for _, v := range slice {
		if val == v {
			return true
		}
	}
	return false
}

func checkOwnerRef(ownref []v1.OwnerReference, wld []string, kind string) bool {
	for _, owner := range ownref {
		if contains(owner.Name, wld) && owner.Kind == kind {
			return true
		}
	}
	return false
}
