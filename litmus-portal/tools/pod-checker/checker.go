package main

import (
	"context"
	"fmt"
	"github.com/pkg/errors"
	"k8s.io/client-go/rest"
	"log"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/client-go/kubernetes"
	"os"
	"time"
)

var (
	timeout    time.Duration = 30
	pod_name                 = os.Getenv("POD_NAME")
	namespace                = os.Getenv("NAMESPACE")
	ctx                      = context.TODO()
	kubeConfig string
)

func isPodRunning(clientSet *kubernetes.Clientset) wait.ConditionFunc {
	return func() (bool, error) {
		fmt.Printf(".")

		pod, err := clientSet.CoreV1().Pods(namespace).Get(ctx, pod_name, metav1.GetOptions{})
		if err != nil {
			return false, err
		}

		switch pod.Status.Phase {
		case v1.PodRunning:
			return true, nil
		case v1.PodFailed, v1.PodSucceeded:
			return false, errors.New("Pod is not in running state")
		}

		return false, nil
	}

}

func main() {
	config, err := rest.InClusterConfig()
	if err != nil {
		panic(err)
	}

	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	err = wait.PollImmediate(time.Second, timeout, isPodRunning(clientSet))
	if err != nil {
		log.Fatal("\nPod is not in running state\n")
		os.Exit(1)
	}

	log.Print("\nPod is in running state\n")

}
