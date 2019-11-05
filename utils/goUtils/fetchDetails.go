package goUtils

import (
	//"fmt"
	//"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	//appsv1 "k8s.io/api/apps/v1"
	//apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	//"k8s.io/client-go/kubernetes"
	//"error"
	//"flag"
	clientV1alpha1 "github.com/litmuschaos/litmus/pkg/client/clientset/versioned"
	//"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	//"k8s.io/client-go/tools/clientcmd"
	log "github.com/sirupsen/logrus"
	//"os"
	//"strings"
	//k8serror "k8s.io/apimachinery/pkg/api/errors"
)

func getLabels(appns string, chaosExperiment string, litmusClientSet *clientV1alpha1.Clientset) map[string]string {
	expirementSpec, err := litmusClientSet.LitmuschaosV1alpha1().ChaosExperiments(appns).Get(chaosExperiment, metav1.GetOptions{})
	if err != nil {
		log.Panic(err)
	}
	return expirementSpec.Spec.Definition.Labels

}
func getImage(appns string, chaosExperiment string, litmusClientSet *clientV1alpha1.Clientset) string {
	expirementSpec, err := litmusClientSet.LitmuschaosV1alpha1().ChaosExperiments(appns).Get(chaosExperiment, metav1.GetOptions{})
	if err != nil {
		log.Panic(err)
	}
	image := expirementSpec.Spec.Definition.Image
	return image
}
func getArgs(appns string, chaosExperiment string, litmusClientSet *clientV1alpha1.Clientset) []string {
	expirementSpec, err := litmusClientSet.LitmuschaosV1alpha1().ChaosExperiments(appns).Get(chaosExperiment, metav1.GetOptions{})
	if err != nil {
		log.Panic(err)
	}
	args := expirementSpec.Spec.Definition.Args
	return args
}

//func getDataFromConfigMap(appns string, chaosExperiment string, litmusClientSet *clientV1alpha1.Clientset) string {
//expirementSpec, err := litmusClientSet.LitmuschaosV1alpha1().ChaosExperiments(appns).Get(chaosExperiment, metav1.GetOptions{})
//dataFromConfigMap := expirementSpec.Spec.Definition.
// cant find configmaps[0] as in executor
//}
func GetDetails(appns string, chaosExperiment string, config *rest.Config) (map[string]string, string, []string) {
	_, litmusClientSet, err := GenerateClientSets(config)
	if err != nil {
		log.Info(err)
	}
	labels := getLabels(appns, chaosExperiment, litmusClientSet)
	image := getImage(appns, chaosExperiment, litmusClientSet)
	args := getArgs(appns, chaosExperiment, litmusClientSet)
	return labels, image, args

}
