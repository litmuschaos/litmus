package goUtils

import (
	"fmt"
	//"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	//appsv1 "k8s.io/api/apps/v1"
	//apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	//"k8s.io/client-go/kubernetes"
	//"error"
	//"flag"
	clientV1alpha1 "github.com/litmuschaos/litmus/pkg/client/clientset/versioned"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	//"k8s.io/client-go/tools/clientcmd"
	log "github.com/sirupsen/logrus"
	//"os"
	//"strings"
	k8serror "k8s.io/apimachinery/pkg/api/errors"
)

func GenerateClientSets(config *rest.Config) (*kubernetes.Clientset, *clientV1alpha1.Clientset, error) {
	k8sClientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, nil, fmt.Errorf("unable to generate kubernetes clientSet %s: ", err)
	}
	litmusClientSet, err := clientV1alpha1.NewForConfig(config)
	if err != nil {
		return nil, nil, fmt.Errorf("unable to generate litmus clientSet %s: ", err)
	}
	return k8sClientSet, litmusClientSet, nil
}

func CheckExperimentInAppNamespace(appns string, chaosExperiment string, config *rest.Config) bool {
	_, litmusClientSet, err := GenerateClientSets(config)
	//fmt.Println(k8sClientSet)
	if err != nil {
		log.Error(err)
	}
	_, err = litmusClientSet.LitmuschaosV1alpha1().ChaosExperiments(appns).Get(chaosExperiment, metav1.GetOptions{})
	isNotFound := k8serror.IsNotFound(err)
	return isNotFound
}
