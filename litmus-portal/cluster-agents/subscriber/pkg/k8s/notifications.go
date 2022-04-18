package main

import (
	"context"
	"fmt"
	"log"
	"os"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/util/runtime"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/tools/clientcmd"
)

func main() {
	log.Print("Shared Informer app started")

	kubeconfig := os.Getenv("KUBECONFIG")
	AgentNamespace := "litmus"

	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		rest.InClusterConfig()
		fmt.Printf("erorr %s building config from env\n" + err.Error())
		config, err = rest.InClusterConfig()
		if err != nil {
			fmt.Printf("error %s, getting inclusterconfig" + err.Error())
			log.Panic(err.Error())
		}

	} else {
		log.Print("Successfully built config")
	}

	// Create the clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Panic(err.Error())
	} else {
		log.Print("Successfully built clientset")
	}
	// Create the shared informer factory
	factory := informers.NewSharedInformerFactory(clientset, 0)
	informer := factory.Core().V1().Nodes().Informer()

	// for Pods
	fmt.Printf("PODS \n")
	pods, err := clientset.CoreV1().Pods(AgentNamespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Panic(err.Error())
	} else {
		for i := 0; i < len(pods.Items); i++ {
			fmt.Printf(pods.Items[i].Name + "\n")
		}

	}

	// For Deployments
	deployments, err := clientset.AppsV1().Deployments(AgentNamespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Panic(err.Error())
	} else {
		fmt.Printf("\n DEPLOYMETNS \n")
		for i := 0; i < len(deployments.Items); i++ {
			fmt.Printf(deployments.Items[i].Name + "\n")
		}
	}

	// for configmaps
	configmaps, err := clientset.CoreV1().ConfigMaps(AgentNamespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Panic(err.Error())
	} else {
		fmt.Printf("\n CONFIGMAPS \n")
		for i := 0; i < len(configmaps.Items); i++ {
			fmt.Printf(configmaps.Items[i].Name + "\n")
		}
	}

	// for services
	services, err := clientset.CoreV1().Services(AgentNamespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Panic(err.Error())
	} else {
		fmt.Printf("\n SERVICES \n")
		for i := 0; i < len(services.Items); i++ {
			fmt.Printf(services.Items[i].Name + "\n")
		}
	}

	// for secrets
	secrets, err := clientset.CoreV1().Secrets(AgentNamespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Panic(err.Error())
	} else {
		fmt.Printf("\n SECRETS \n")
		for i := 0; i < len(secrets.Items); i++ {
			fmt.Printf(secrets.Items[i].Name + "\n")
		}
	}

	// for events and their hashed values

	events, err := clientset.CoreV1().Events(AgentNamespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Panic(err.Error())
	} else {
		fmt.Printf("\n EVENTS : UniqueHash\n")

		for i := 0; i < len(events.Items); i++ {
			fmt.Printf(string(events.Items[i].Name) + ": ")
			fmt.Printf(string(events.Items[i].UID) + "\n")
		}
	}

	// for serviceaccounts
	serviceaccounts, err := clientset.CoreV1().ServiceAccounts(AgentNamespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Panic(err.Error())
	} else {
		fmt.Printf("\n SERVICEACCOUNTS \n")
		for i := 0; i < len(serviceaccounts.Items); i++ {
			fmt.Printf(serviceaccounts.Items[i].Name + "\n")
		}
	}

	// for rolebindings
	rolebindings, err := clientset.RbacV1().RoleBindings(AgentNamespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Panic(err.Error())
	} else {
		fmt.Printf("\n ROLEBINDINGS \n")
		for i := 0; i < len(rolebindings.Items); i++ {
			fmt.Printf(rolebindings.Items[i].Name + "\n")
		}
	}

	// channel for informer
	stopper := make(chan struct{})
	defer close(stopper)
	defer runtime.HandleCrash()
	informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: onAdd,
	})

	log.Print("Successfully added event handler")
	go informer.Run(stopper)

	if !cache.WaitForCacheSync(stopper, informer.HasSynced) {
		runtime.HandleError(fmt.Errorf("timed out waiting for caches to sync"))
		return
	} else {
		log.Print("Successfully synced cache")

	}
	<-stopper
}

// onAdd is the function executed when the kubernetes informer notified the presence of a new kubernetes node in the cluster
func onAdd(obj interface{}) {
	// Cast the obj as node
	node := obj.(*corev1.Node)
	_, ok := node.GetLabels()["litmus"]
	if ok {
		fmt.Printf("It has the label!\n ")
	} else {
		fmt.Printf("It does not have the label!\n")
	}
}
