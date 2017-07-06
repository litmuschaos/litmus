package main

import (
	"fmt"

	"time"

	"k8s.io/client-go/kubernetes"
	metav1 "k8s.io/client-go/pkg/api/v1"
	"k8s.io/client-go/rest"
)

func main() {
	// create in cluster config
	config, err := rest.InClusterConfig()
	if err != nil {
		panic(err.Error())
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}
	for {
		pvs, err := clientset.CoreV1().Pods("").List(metav1.ListOptions{})
		if err != nil {
			panic(err.Error())
		}
		for _, pv := range pvs.Items {
			fmt.Printf("There's %s ", pv.GetName())
			time.Sleep(10 * time.Second)
		}
	}
}
