// Package workloads implements utility to derive the pods from the parent workloads
package workloads

import (
	"context"
	"fmt"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	kcorev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
)

var (
	gvrrc = schema.GroupVersionResource{
		Group:    "",
		Version:  "v1",
		Resource: "replicacontrollers",
	}

	gvrrs = schema.GroupVersionResource{
		Group:    "apps",
		Version:  "v1",
		Resource: "replicasets",
	}
)

// GetPodsFromWorkloads derives the pods from the parent workloads
func GetPodsFromWorkloads(workloads []types.Workload, client *kubernetes.Clientset, dynamicClient dynamic.Interface) (map[string][]string, error) {

	workloadMap := aggregateWorkloadsByNamespace(workloads)

	result := make(map[string][]string)
	for ns, w := range workloadMap {
		allPods, err := getAllPods(ns, client)
		if err != nil {
			return nil, err
		}
		pods, err := getPodsByAppKind(ns, w.WorkloadKindMap, allPods, client, dynamicClient)
		if err != nil {
			return nil, err
		}
		result[ns] = removeDuplicateItems(pods)
	}
	return result, nil
}

func getPodsByAppKind(ns string, wldMap map[string][]string, allPods *kcorev1.PodList, client *kubernetes.Clientset, dynamicClient dynamic.Interface) ([]string, error) {
	podsFromWld, err := getPodsFromWorkload(wldMap, allPods, dynamicClient)
	if err != nil {
		return nil, err
	}
	podsFromSvc, err := getPodsFromServices(ns, wldMap["service"], client)
	if err != nil {
		return nil, err
	}

	return append(podsFromWld, podsFromSvc...), nil
}

func getPodsFromWorkload(wld map[string][]string, allPods *kcorev1.PodList, dynamicClient dynamic.Interface) ([]string, error) {
	var pods []string
	for _, r := range allPods.Items {
		ownerType, ownerName, err := getPodOwnerTypeAndName(&r, dynamicClient)
		if err != nil {
			return nil, err
		}
		if ownerName == "" || ownerType == "" {
			continue
		}
		if matchPodOwnerWithWorkloads(ownerName, ownerType, wld) {
			pods = append(pods, r.Name)
		}
	}
	return pods, nil
}

func getPodsFromServices(ns string, wld []string, client *kubernetes.Clientset) ([]string, error) {
	var pods []string
	for _, svcName := range wld {
		svc, err := client.CoreV1().Services(ns).Get(context.Background(), svcName, v1.GetOptions{})
		if err != nil {
			return nil, err
		}
		if svc.Spec.Selector == nil {
			return nil, nil
		}
		var svcSelector string
		for k, v := range svc.Spec.Selector {
			if svcSelector == "" {
				svcSelector += fmt.Sprintf("%s=%s", k, v)
				continue
			}
			svcSelector += fmt.Sprintf(",%s=%s", k, v)
		}

		res, err := client.CoreV1().Pods(svc.Namespace).List(context.Background(), v1.ListOptions{LabelSelector: svcSelector})
		if err != nil {
			return nil, err
		}
		for _, p := range res.Items {
			pods = append(pods, p.Name)
		}

	}
	return pods, nil
}

func getPodOwnerTypeAndName(pod *kcorev1.Pod, dynamicClient dynamic.Interface) (parentType, parentName string, err error) {
	for _, owner := range pod.GetOwnerReferences() {
		parentName = owner.Name
		if owner.Kind == "StatefulSet" || owner.Kind == "DaemonSet" {
			return strings.ToLower(owner.Kind), parentName, nil
		}

		if owner.Kind == "ReplicaSet" && strings.HasSuffix(owner.Name, pod.Labels["pod-template-hash"]) {
			return getParent(owner.Name, pod.Namespace, gvrrs, dynamicClient)
		}

		if owner.Kind == "ReplicaController" {
			return getParent(owner.Name, pod.Namespace, gvrrc, dynamicClient)
		}
	}
	return parentType, parentName, nil
}

func getParent(name, namespace string, gvr schema.GroupVersionResource, dynamicClient dynamic.Interface) (string, string, error) {
	res, err := dynamicClient.Resource(gvr).Namespace(namespace).Get(context.Background(), name, v1.GetOptions{})
	if err != nil {
		return "", "", err
	}

	for _, v := range res.GetOwnerReferences() {
		kind := strings.ToLower(v.Kind)
		if kind == "deployment" || kind == "rollout" || kind == "deploymentconfig" {
			return kind, v.Name, nil
		}
	}
	return "", "", nil
}

func matchPodOwnerWithWorkloads(name, kind string, workloadMap map[string][]string) bool {
	if val, ok := workloadMap[kind]; ok {
		for _, v := range val {
			if v == name {
				return true
			}
		}
	}
	return false
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

func getAllPods(namespace string, client *kubernetes.Clientset) (*kcorev1.PodList, error) {
	return client.CoreV1().Pods(namespace).List(context.Background(), v1.ListOptions{})
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
