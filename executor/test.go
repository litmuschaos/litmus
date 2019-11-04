package main

import (
	"fmt"
	//"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	//appsv1 "k8s.io/api/apps/v1"
	//apiv1 "k8s.io/api/core/v1"
	//metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	//"k8s.io/client-go/kubernetes"
	//"error"
	//"flag"
	"github.com/litmuschaos/litmus/utils/goUtils"
	log "github.com/sirupsen/logrus"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"os"
	"strings"
)

// getKubeConfig setup the config for access cluster resource
/*func getKubeConfig() (*rest.Config, error) {
	kubeconfig := flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	flag.Parse()
	// Use in-cluster config if kubeconfig path is specified
	if *kubeconfig == "" {
		config, err := rest.InClusterConfig()
		if err != nil {
			return config, err
		}
	}
	config, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		return config, err
	}
	return config, err
}*/
var kubeconfig string
var err error
var config *rest.Config

func main() {

	//flag.StringVar(&kubeconfig, "kubeconfig", "", "path to the kubeconfig file")
	//flag.Parse()
	//if kubeconfig == "" {
	//	log.Info("using the in-cluster config")
	//	config, err = rest.InClusterConfig()
	//} else {
	//	log.Info("using configuration from: ", kubeconfig)
	//	config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
	//}
	kubeconfig = "/home/rahul/.kube/config"
	config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		log.Info("error in config")
		panic(err.Error())
	}

	//ar s string =
	//config, err := getKubeConfig()
	if err != nil {
		panic(err.Error())
	}
	engine := os.Getenv("CHAOSENGINE")
	experimentList := os.Getenv("EXPERIMENT_LIST")
	appLabel := os.Getenv("APP_LABEL")
	appNamespace := os.Getenv("APP_NAMESPACE")
	appKind := os.Getenv("APP_KIND")
	svcAcc := os.Getenv("CHAOS_SVC_ACC")
	//rand := os.Getenv("RANDOM")
	//max := os.Getenv("MAX_DURATION")
	experimentList = "pod-delete,container-kill"
	experiments := strings.Split(experimentList, ",")
	fmt.Println(experiments)
	//fmt.Println(config)
	fmt.Println(engine)
	fmt.Println(experimentList)
	fmt.Println(appLabel)
	fmt.Println(appNamespace)
	fmt.Println(appKind)
	fmt.Println(svcAcc)

	for i := range experiments {
		isFound := !goUtils.CheckExperimentInAppNamespace("default", experiments[i], config)
		fmt.Println(isFound)
		if !isFound {
			break
		}

	}
	//fmt.Println(ans)
}
