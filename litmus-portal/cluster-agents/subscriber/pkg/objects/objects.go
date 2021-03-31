package objects

import (
	"encoding/json"
	"errors"
	"github.com/sirupsen/logrus"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

//GetKubernetesObjects is used to get the Kubernetes Object details according to the request type
func GetKubernetesObjects(requestType string) ([]*types.KubeObject, error) {
	conf, err := k8s.GetKubeConfig()
	if err != nil {
		return nil, err
	}
	clientset, err := kubernetes.NewForConfig(conf)
	if err != nil {
		return nil, err
	}

	var ObjData []*types.KubeObject
	namespace, err := clientset.CoreV1().Namespaces().List(metav1.ListOptions{})
	if err != nil {
		return nil, err
	}
	if len(namespace.Items) > 0 {
		if requestType == "pods" {
			for _, namespace := range namespace.Items {
				podList, err := GetPodsByNamespace(namespace.GetName(), clientset)
				if err != nil {
					panic(err.Error())
				}
				KubeObj := &types.KubeObject{
					Namespace: namespace.GetName(),
					Pods:      podList,
				}
				ObjData = append(ObjData, KubeObj)
			}
		}
		if requestType == "deployments" {
			for _, namespace := range namespace.Items {
				deploymentList, err := GetDeploymentsByNamespace(namespace.GetName(), clientset)
				if err != nil {
					panic(err.Error())
				}
				KubeObj := &types.KubeObject{
					Namespace:      namespace.GetName(),
					DeploymentInfo: deploymentList,
				}
				ObjData = append(ObjData, KubeObj)
			}
		}
		if requestType == "statefulsets" {
			for _, namespace := range namespace.Items {
				statefulSetList, err := GetStatefulSetsByNamespace(namespace.GetName(), clientset)
				if err != nil {
					panic(err.Error())
				}
				KubeObj := &types.KubeObject{
					Namespace:       namespace.GetName(),
					StatefulSetInfo: statefulSetList,
				}
				ObjData = append(ObjData, KubeObj)
			}
		}
		if requestType == "daemonsets" {
			for _, namespace := range namespace.Items {
				daemonSetList, err := GetDaemonSetsByNamespace(namespace.GetName(), clientset)
				if err != nil {
					panic(err.Error())
				}
				KubeObj := &types.KubeObject{
					Namespace:     namespace.GetName(),
					DaemonsetInfo: daemonSetList,
				}
				ObjData = append(ObjData, KubeObj)
			}
		}
		if requestType == "deploymentconfigs" {
			for _, namespace := range namespace.Items {
				deploymentConfigList, err := GetDeploymentConfigsByNamespace(namespace.GetName())
				if err != nil {
					return nil, err
				}
				KubeObj := &types.KubeObject{
					Namespace:            namespace.GetName(),
					DeploymentConfigInfo: deploymentConfigList,
				}
				ObjData = append(ObjData, KubeObj)
			}
		}
		if requestType == "deploymentconfigs" {
			for _, namespace := range namespace.Items {
				deploymentConfigList, err := GetDeploymentConfigsByNamespace(namespace.GetName())
				if err != nil {
					return nil, err
				}
				KubeObj := &types.KubeObject{
					Namespace:            namespace.GetName(),
					DeploymentConfigInfo: deploymentConfigList,
				}
				ObjData = append(ObjData, KubeObj)
			}
		}
		if requestType == "rollouts" {
			for _, namespace := range namespace.Items {
				rolloutList, err := GetRollOutsByNamespace(namespace.GetName())
				if err != nil {
					return nil, err
				}
				KubeObj := &types.KubeObject{
					Namespace: namespace.GetName(),
					Rollouts:  rolloutList,
				}
				ObjData = append(ObjData, KubeObj)
			}
		}
		kubeData, _ := json.Marshal(ObjData)
		var kubeObjects []*types.KubeObject
		err := json.Unmarshal(kubeData, &kubeObjects)
		if err != nil {
			return nil, err
		}
		return kubeObjects, nil
	} else {
		return nil, errors.New("No namespace found")
	}
}

//GetPodsByNamespace is used to get the Pod details available in the namespace.
func GetPodsByNamespace(namespace string, clientset *kubernetes.Clientset) ([]types.PodInfo, error) {
	podList := []types.PodInfo{}
	pods, err := clientset.CoreV1().Pods(namespace).List(metav1.ListOptions{})
	if err != nil {

		return nil, err
	}

	for _, pod := range pods.Items {
		podInfo := types.PodInfo{Name: pod.Name,
			UID:               pod.UID,
			Namespace:         pod.Namespace,
			APIVersion:        pod.APIVersion,
			ClusterName:       pod.ClusterName,
			CreationTimestamp: pod.CreationTimestamp,
			Containers:        pod.Spec.Containers,
			NodeSelectors:     pod.Spec.NodeSelector,
			Labels:            pod.GetLabels(),
			//Annotations:     pod.GetAnnotations(),
		}
		podList = append(podList, podInfo)
	}
	return podList, nil
}

//GetDeploymentsByNamespace is used to get the Deployment details available in the namespace.
func GetDeploymentsByNamespace(namespace string, clientset *kubernetes.Clientset) ([]types.DeploymentInfo, error) {
	deploymentList := []types.DeploymentInfo{}
	deployments, err := clientset.AppsV1().Deployments(namespace).List(metav1.ListOptions{})
	if err != nil {

		return nil, err
	}
	for _, deployment := range deployments.Items {
		deploymentInfo := types.DeploymentInfo{
			Name:              deployment.Name,
			UID:               deployment.UID,
			Namespace:         deployment.Namespace,
			APIVersion:        deployment.APIVersion,
			ClusterName:       deployment.ClusterName,
			CreationTimestamp: deployment.CreationTimestamp,
			Replicas:          deployment.Spec.Replicas,
			NodeSelectors:     deployment.Spec.Template.Spec.NodeSelector,
			LabelSelectors:    *deployment.Spec.Selector,
			Labels:            deployment.GetLabels(),
			//Annotations:     deployment.GetAnnotations(),
		}
		deploymentList = append(deploymentList, deploymentInfo)
	}
	return deploymentList, nil
}

//GetStatefulSetsByNamespace is used to get the StatefulSet details available in the namespace.
func GetStatefulSetsByNamespace(namespace string, clientset *kubernetes.Clientset) ([]types.StatefulSetInfo, error) {
	statefulList := []types.StatefulSetInfo{}
	statefulStates, err := clientset.AppsV1().StatefulSets(namespace).List(metav1.ListOptions{})
	if err != nil {
		return nil, err
	}
	for _, statefulSet := range statefulStates.Items {
		statefulInfo := types.StatefulSetInfo{
			Name:                    statefulSet.Name,
			UID:                     statefulSet.UID,
			Namespace:               statefulSet.Namespace,
			APIVersion:              statefulSet.APIVersion,
			ClusterName:             statefulSet.ClusterName,
			CreationTimestamp:       statefulSet.CreationTimestamp,
			Replicas:                statefulSet.Spec.Replicas,
			TerminationGracePeriods: statefulSet.Spec.Template.Spec.TerminationGracePeriodSeconds,
			VolumeClaimTemplate:     statefulSet.Spec.VolumeClaimTemplates,
			NodeSelectors:           statefulSet.Spec.Template.Spec.NodeSelector,
			Labels:                  statefulSet.GetLabels(),
			//Annotations:       	deployment.GetAnnotations(),
		}
		statefulList = append(statefulList, statefulInfo)
	}
	return statefulList, nil
}

//GetDaemonSetsByNamespace is used to get the DaemonSet details available in the namespace.
func GetDaemonSetsByNamespace(namespace string, clientset *kubernetes.Clientset) ([]types.DaemonsetInfo, error) {
	daemonsetList := []types.DaemonsetInfo{}
	daemonSets, err := clientset.AppsV1().DaemonSets(namespace).List(metav1.ListOptions{})
	if err != nil {
		return nil, err
	}
	for _, daemonSet := range daemonSets.Items {
		daemonSetInfo := types.DaemonsetInfo{
			Name:                    daemonSet.Name,
			UID:                     daemonSet.UID,
			Namespace:               daemonSet.Namespace,
			APIVersion:              daemonSet.APIVersion,
			CreationTimestamp:       daemonSet.CreationTimestamp,
			TerminationGracePeriods: daemonSet.Spec.Template.Spec.TerminationGracePeriodSeconds,
			Volumes:                 daemonSet.Spec.Template.Spec.Volumes,
			NodeSelectors:           daemonSet.Spec.Template.Spec.NodeSelector,
			Labels:                  daemonSet.GetLabels(),
			//Annotations:       	deployment.GetAnnotations(),
		}
		daemonsetList = append(daemonsetList, daemonSetInfo)
	}
	return daemonsetList, nil
}

//GetDeploymentConfigsByNamespace is used to get the DeploymentConfig details available in the namespace.
func GetDeploymentConfigsByNamespace(namespace string) ([]types.DeploymentConfigInfo, error) {
	gvrdc := schema.GroupVersionResource{
		Group:    "apps.openshift.io",
		Version:  "v1",
		Resource: "deploymentconfigs",
	}
	_, dynamicClient, err := k8s.GetDynamicAndDiscoveryClient()
	if err != nil {
		return nil, err
	}
	deploymentConfigList := []types.DeploymentConfigInfo{}
	deploymentConfigs, err := dynamicClient.Resource(gvrdc).Namespace(namespace).List(metav1.ListOptions{})

	if err != nil {
		logrus.Print("No deploymentconfig resource available")
		return deploymentConfigList, nil
	}

	for _, deploymentConfig := range deploymentConfigs.Items {
		deploymentConfigInfo := types.DeploymentConfigInfo{
			Name:       deploymentConfig.GetName(),
			APIVersion: deploymentConfig.GetAPIVersion(),
			Labels:     deploymentConfig.GetLabels(),
		}
		deploymentConfigList = append(deploymentConfigList, deploymentConfigInfo)
	}
	return deploymentConfigList, nil
}

//GetRollOutsByNamespace is used to get the RollOut details available in the namespace.
func GetRollOutsByNamespace(namespace string) ([]types.Rollouts, error) {
	gvrro := schema.GroupVersionResource{
		Group:    "argoproj.io",
		Version:  "v1alpha1",
		Resource: "rollouts",
	}
	_, dynamicClient, err := k8s.GetDynamicAndDiscoveryClient()
	if err != nil {
		return nil, err
	}
	rolloutList := []types.Rollouts{}
	rollouts, err := dynamicClient.Resource(gvrro).Namespace(namespace).List(metav1.ListOptions{})

	if err != nil {
		logrus.Print("No rollout resource available")
		return rolloutList, nil
	}

	for _, rollout := range rollouts.Items {
		rolloutInfo := types.Rollouts{
			Name:       rollout.GetName(),
			APIVersion: rollout.GetAPIVersion(),
			Labels:     rollout.GetLabels(),
		}
		rolloutList = append(rolloutList, rolloutInfo)
	}
	return rolloutList, nil
}
