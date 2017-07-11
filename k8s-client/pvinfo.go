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
	fmt.Println("In k8s client..")
	for {
		pods, err := clientset.CoreV1().Pods("").List(metav1.ListOptions{})
		// pvcs, err := clientset.CoreV1().PersistentVolumeClaims("").List(metav1.ListOptions{})
		// fmt.Println(pvcs)
		if err != nil {
			panic(err.Error())
		}
		// for _, pv := range pvs.Items {
		// 	fmt.Printf("Persistent Volume:  %s ", pv.GetName())
		// 	time.Sleep(10 * time.Second)
		// }
		for _, pod := range pods.Items {
			time.Sleep(10 * time.Second)
			fmt.Printf("Pod: %s Volumes: %s", pod.GetName(), pod.Spec.Volumes)
		}
		/*
			for _, pvc := range pvcs.Items {
				fmt.Printf("Persistent Volume Claim: %s \n", pvc.GetName())
				time.Sleep(5 * time.Second)
				fmt.Printf("Volume Name: %s", pvc.Spec.VolumeName)
				time.Sleep(10 * time.Second)
			}
		*/
	}
}
