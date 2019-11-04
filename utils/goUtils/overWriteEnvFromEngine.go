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
	//clientV1alpha1 "github.com/litmuschaos/litmus/pkg/client/clientset/versioned"
	//"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	//"k8s.io/client-go/tools/clientcmd"
	log "github.com/sirupsen/logrus"
	//"os"
	//"strings"
	//k8serror "k8s.io/apimachinery/pkg/api/errors"
)

func OverWriteList(appns string, chaosEngine string, config *rest.Config, m map[string]string, chaosExperiment string) map[string]string {
	_, litmusClientSet, err := generateClientSets(config)
	if err != nil {
		log.Info(err)
	}
	//k := make(map[string]string)
	engineSpec, err := litmusClientSet.LitmuschaosV1alpha1().ChaosEngines(appns).Get(chaosEngine, metav1.GetOptions{})
	envList := engineSpec.Spec.Experiments
	for i := range envList {
		if envList[i].Name == chaosExperiment {
			keyValue := envList[i].Spec.Components
			for j := range keyValue {
				m[keyValue[j].Name] = keyValue[j].Value
				//find := keyValue[j].Name
				//if _, ok := m[find]; ok {
				//	m[find] = keyValue[j].Value
				//}
			}
		}

	}
	return m

}
