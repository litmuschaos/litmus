package resource

import (
	"fmt"
	"k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"

	chaosTypes "github.com/litmuschaos/chaos-operator/pkg/controller/types"
)

// CheckStatefulSetAnnotation will check the annotation of StatefulSet
func CheckStatefulSetAnnotation(clientSet *kubernetes.Clientset, ce *chaosTypes.EngineInfo) (*chaosTypes.EngineInfo, error) {
	targetAppList, err := getStatefulSetLists(clientSet, ce)
	if err != nil {
		return ce, err
	}
	chaosEnabledStatefulset := 0
	for _, statefulset := range targetAppList.Items {
		ce.AppName = statefulset.ObjectMeta.Name
		ce.AppUUID = statefulset.ObjectMeta.UID
		annotationValue := statefulset.ObjectMeta.GetAnnotations()[ChaosAnnotationKey]
		chaosEnabledStatefulset, err = ValidateAnnotation(annotationValue, chaosEnabledStatefulset)
		if err != nil {
			return ce, err
		}
		chaosTypes.Log.Info("Statefulset chaos candidate, appName:", ce.AppName," appUUID: ", ce.AppUUID)
	}
	return ce, nil
}

// getStatefulSetLists will list the statefulset which having the chaos label
func getStatefulSetLists(clientSet *kubernetes.Clientset, ce *chaosTypes.EngineInfo) (*v1.StatefulSetList, error) {
	targetAppList, err := clientSet.AppsV1().StatefulSets(ce.AppInfo.Namespace).List(metav1.ListOptions{
		LabelSelector: ce.Instance.Spec.Appinfo.Applabel,
		FieldSelector: ""})
	if err != nil {
		return nil, fmt.Errorf("error while listing statefulsets with matching labels %s", ce.Instance.Spec.Appinfo.Applabel)
	}
	if len(targetAppList.Items) == 0 {
		return nil, fmt.Errorf("no statefulset apps with matching labels %s", ce.Instance.Spec.Appinfo.Applabel)
	}
	return targetAppList, err
}
