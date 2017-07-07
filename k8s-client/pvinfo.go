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
		pvs, err := clientset.CoreV1().PersistentVolumes().List(metav1.ListOptions{})
		if err != nil {
			panic(err.Error())
		}
		fmt.Println("Getting PV's available")
		for _, pv := range pvs.Items {
			fmt.Printf("There's %s ", pv.GetName())
			time.Sleep(10 * time.Second)
		}
	}
}
