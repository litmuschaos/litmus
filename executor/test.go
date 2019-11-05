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
	"github.com/litmuschaos/kube-helper/kubernetes/container"
	"github.com/litmuschaos/kube-helper/kubernetes/job"
	"github.com/litmuschaos/kube-helper/kubernetes/podtemplatespec"
	"github.com/litmuschaos/litmus/utils/goUtils"
	log "github.com/sirupsen/logrus"
	corev1 "k8s.io/api/core/v1"
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

func prependString(x []string, y string) []string {
	x = append(x, "jack")
	copy(x[1:], x)
	x[0] = y
	return x
}

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
	experimentList = "pod-delete"
	experiments := strings.Split(experimentList, ",")
	fmt.Println(experiments)
	//fmt.Println(config)
	fmt.Println(engine)
	fmt.Println(experimentList)
	fmt.Println(appLabel)
	fmt.Println(appNamespace)
	appNamespace = "default"
	fmt.Println(appKind)
	fmt.Println(svcAcc)
	svcAcc = "nginx"

	for i := range experiments {
		isFound := !goUtils.CheckExperimentInAppNamespace("default", experiments[i], config)
		fmt.Println(isFound)
		if !isFound {
			break
		}
		env := goUtils.GetList("default", "pod-delete", config)
		//mt.Println(k)
		goUtils.OverWriteList("default", "chaos", config, env, "pod-delete")
		//env has the ENV variables now

		//covert env variables to corev1.EnvVars to pass it to builder function
		var envVar []corev1.EnvVar
		for k, v := range env {
			var perEnv corev1.EnvVar
			perEnv.Name = k
			perEnv.Value = v
			envVar = append(envVar, perEnv)
		}
		fmt.Println(envVar)
		expLabels, expImage, expArgs := goUtils.GetDetails("default", "pod-delete", config)
		log.Info("Varibles for Job ", "expLabels ", expLabels, "expImage", expImage, "expArgs", expArgs)

		//command := prependString(expArgs, "/bin/bash")
		//randon string generation
		randomString := goUtils.RandomString()

		jobName := experiments[i] + "-" + randomString

		podtemplate := podtemplatespec.NewBuilder().
			WithName(jobName).
			WithNamespace(appNamespace).
			WithLabels(expLabels).
			WithServiceAccountName(svcAcc).
			WithContainerBuilders(
				container.NewBuilder().
					WithName(jobName).
					WithImage(expImage).
					WithCommandNew([]string{"/bin/bash"}).
					WithArgumentsNew(expArgs).
					WithImagePullPolicy("Always").
					WithEnvsNew(envVar),
			)
		restartPolicy := corev1.RestartPolicyOnFailure
		jobObj, err := job.NewBuilder().
			WithName(jobName).
			WithNamespace("default").
			WithLabels(expLabels).
			WithPodTemplateSpecBuilder(podtemplate).
			WithRestartPolicy(restartPolicy).
			Build()

		if err != nil {
			log.Info(err)
		}
		fmt.Println("job Object")
		fmt.Println(jobObj)
		clientSet, _, err := goUtils.GenerateClientSets(config)
		jobsClient := clientSet.BatchV1().Jobs(appNamespace)
		jobCreationResult, err := jobsClient.Create(jobObj)
		log.Info("Jobcreation", "jobCreation result", jobCreationResult)
		if err != nil {
			log.Info(err)
		}
	}
	//fmt.Println(ans)
}
