/*
Copyright 2016 The Kubernetes Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Note: the example only works with the code within the same release/branch.
package main

import (
	"flag"
	"fmt"
	"time"

	//	"github.com/kubernetes/kubernetes/staging/src/k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/clientcmd"
	//metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	mach_apis_meta_v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	//	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

var (
	master     = flag.String("master", "", "Master's URL to communication if running from outside the cluster or if running apiserver with insecure flag.")
	kubeconfig = flag.String("kubeconfig", "", "Absolute path to kubeconfig if running from outside the cluster or if running apiserver with insecure flag.")
)

func main() {
	flag.Parse()
	// creates the in-cluster config
	var config *rest.Config
	var err error
	if *master != "" || *kubeconfig != "" {
		config, err = clientcmd.BuildConfigFromFlags(*master, *kubeconfig)
		fmt.Printf("Client config was built using flags: Address: '%s' Kubeconfig: '%s' \n", *master, *kubeconfig)
	} else {
		config, err = rest.InClusterConfig()
	}
	if err != nil {
		panic(err.Error())
	}
	// creates the clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}
	for {
		pods, err := clientset.CoreV1().Pods("").List(mach_apis_meta_v1.ListOptions{})
		pvs, err := clientset.CoreV1().PersistentVolumes().List(mach_apis_meta_v1.ListOptions{})
		if err != nil {
			panic(err.Error())
		}
		fmt.Printf("There are %d pods in the cluster\n", len(pods.Items))
		fmt.Printf("There are %d PVs in the cluster\n", len(pvs.Items))
		time.Sleep(10 * time.Second)
	}
}
