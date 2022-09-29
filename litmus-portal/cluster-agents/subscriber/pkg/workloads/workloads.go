package workloads

import (
	"context"
	"fmt"
	corev1 "k8s.io/api/core/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetPodsFromWorkload(ns, kind string, allPods *corev1.PodList, wld []string, client *kubernetes.Clientset, getPodOwner func(ns, kind string, wld []string, client *kubernetes.Clientset) ([]string, string, error)) ([]string, error) {

	ownerName, ownerKind, err := getPodOwner(ns, kind, wld, client)
	if err != nil {
		return nil, err
	}

	var pods []string
	for _, r := range allPods.Items {
		if checkOwnerRef(r.OwnerReferences, ownerName, ownerKind) {
			pods = append(pods, r.Name)
		}
	}
	return pods, nil
}

func GetPodsFromServices(ns string, wld []string, client *kubernetes.Clientset) ([]string, error) {
	var pods []string
	for _, svcName := range wld {
		svc, err := client.CoreV1().Services(ns).Get(context.Background(), svcName, v1.GetOptions{})
		if err != nil {
			return nil, err
		}
		for k, v := range svc.Spec.Selector {
			res, err := client.CoreV1().Pods(svc.Namespace).List(context.Background(), v1.ListOptions{LabelSelector: fmt.Sprintf("%s=%s", k, v)})
			if err != nil {
				return nil, err
			}
			for _, p := range res.Items {
				pods = append(pods, p.Name)
			}
		}
	}
	return pods, nil
}

var managedByReplicaSet = func(ns, kind string, wld []string, client *kubernetes.Clientset) ([]string, string, error) {
	rs, err := getReplicaSetsFromWorkload(ns, kind, wld, client)
	return rs, ReplicaSet, err
}

var managedByReplicaController = func(ns, kind string, wld []string, client *kubernetes.Clientset) ([]string, string, error) {
	rc, err := getReplicaControllersFromWorkload(ns, kind, wld, client)
	return rc, ReplicationController, err
}

var managedByWorkloadDirectly = func(ns, kind string, wld []string, client *kubernetes.Clientset) ([]string, string, error) {
	return wld, kind, nil
}
