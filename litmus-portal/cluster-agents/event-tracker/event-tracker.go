package main

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	sys_runtime "runtime"
	"time"

	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/tools/clientcmd"

	v1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

var (
	ClusterID  string
	AccessKey  string
	ServerAddr = os.Getenv("SERVER_ADDR")
	Namespace  = os.Getenv("AGENT_NAMESPACE")
	KubeConfig = os.Getenv("KUBE_CONFIG")
)

const ExternAgentConfigName = "agent-config"

// Function to get k8s client set
func getK8sClient() (*kubernetes.Clientset, error) {
	var (
		config *rest.Config
		err    error
	)

	if KubeConfig == "" {
		config, err = rest.InClusterConfig()
		if err != nil {
			return nil, err
		}
	} else {
		config, err = clientcmd.BuildConfigFromFlags("", KubeConfig)
		if err != nil {
			return nil, err
		}
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	return clientset, nil
}

// Function to send request to litmus graphql server
func SendRequest(workflowID string) (string, error) {
	payload := `{"query": "mutation { gitopsNotifer(clusterInfo: { cluster_id: \"` + ClusterID + `\", access_key: \"` + AccessKey + `\"}, workflow_id: \"` + workflowID + `\")\n}"}`
	req, err := http.NewRequest("POST", ServerAddr, bytes.NewBuffer([]byte(payload)))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "URL is not reachable or Bad request", nil
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}

// Function to get configmap data created by the subscriber
func getConfigmap() (string, string, error) {
	clientset, err := getK8sClient()
	if err != nil {
		return "", "", err
	}

	cm, err := clientset.CoreV1().ConfigMaps(Namespace).Get(context.TODO(), ExternAgentConfigName, metav1.GetOptions{})
	if errors.IsNotFound(err) {
		return "", "", err
	} else if cm.Data["IS_CLUSTER_CONFIRMED"] == "false" {
		return "", "", fmt.Errorf("Cluster is not confirmed yet")
	} else if err != nil {
		return "", "", err
	}

	return cm.Data["CLUSTER_ID"], cm.Data["ACCESS_KEY"], nil
}

// K8s informer watching for all the deployment changes
func runDeploymentInformer(factory informers.SharedInformerFactory) {
	deploymentInformer := factory.Apps().V1().Deployments().Informer()

	stopper := make(chan struct{})
	defer close(stopper)

	defer runtime.HandleCrash()

	deploymentInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		// When a new resource gets created
		AddFunc: func(obj interface{}) {
			depObj := obj.(*v1.Deployment)
			var worflowid = depObj.GetAnnotations()["litmuschaos.io/workflow"]

			if depObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
				log.Print("EventType: Add")
				log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "Deployment", depObj.Name, depObj.Namespace)
				response, err := SendRequest(worflowid)
				if err != nil {
					log.Print("error", err)
				}
				log.Print(response)
			}
		},

		// When a resource gets updated
		UpdateFunc: func(oldObj interface{}, newObj interface{}) {
			newDepObj := newObj.(*v1.Deployment)
			oldDepObj := oldObj.(*v1.Deployment)

			var worflowid = newDepObj.GetAnnotations()["litmuschaos.io/workflow"]
			if newDepObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
				var trigger_flag = false
				for _, new_container := range newDepObj.Spec.Template.Spec.Containers {
					for _, old_container := range oldDepObj.Spec.Template.Spec.Containers {
						if old_container.Name == new_container.Name && old_container.Image != new_container.Image {
							trigger_flag = true
						}
					}
				}

				if trigger_flag == true {
					log.Print("EventType: Update")
					log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "Deployment", newDepObj.Name, newDepObj.Namespace)
					response, err := SendRequest(worflowid)
					if err != nil {
						log.Print("error", err)
					}
					log.Print(response)
				}
			}
		},
	})

	deploymentInformer.Run(stopper)
	if !cache.WaitForCacheSync(stopper, deploymentInformer.HasSynced) {
		runtime.HandleError(fmt.Errorf("Timed out waiting for caches to sync"))
		return
	}
}

// K8s informer watching for all the Statefullset changes
func runStsInformer(factory informers.SharedInformerFactory) {
	stsInformer := factory.Apps().V1().StatefulSets().Informer()

	stopper := make(chan struct{})
	defer close(stopper)

	defer runtime.HandleCrash()

	stsInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		// When a new resource gets created
		AddFunc: func(obj interface{}) {
			stsObj := obj.(*v1.StatefulSet)

			var worflowid = stsObj.GetAnnotations()["litmuschaos.io/workflow"]
			if stsObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
				log.Print("EventType: Add")
				log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "StateFulSet", stsObj.Name, stsObj.Namespace)
				response, err := SendRequest(worflowid)
				if err != nil {
					log.Print("error", err)
				}
				log.Print(response)
			}
		},

		// When a resource gets updated
		UpdateFunc: func(oldObj interface{}, newObj interface{}) {
			newStsObj := newObj.(*v1.StatefulSet)
			oldStsObj := oldObj.(*v1.StatefulSet)

			var worflowid = newStsObj.GetAnnotations()["litmuschaos.io/workflow"]
			if newStsObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
				var trigger_flag = false
				for _, new_container := range newStsObj.Spec.Template.Spec.Containers {
					for _, old_container := range oldStsObj.Spec.Template.Spec.Containers {
						if old_container.Name == new_container.Name && old_container.Image != new_container.Image {
							trigger_flag = true
						}
					}
				}

				if trigger_flag == true {
					log.Print("EventType: Update")
					log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "StateFulSet", newStsObj.Name, newStsObj.Namespace)
					response, err := SendRequest(worflowid)
					if err != nil {
						log.Print("error", err)
					}
					log.Print(response)
				}
			}
		},
	})

	stsInformer.Run(stopper)
	if !cache.WaitForCacheSync(stopper, stsInformer.HasSynced) {
		runtime.HandleError(fmt.Errorf("Timed out waiting for caches to sync"))
		return
	}
}

// K8s informer watching for all the daemonset changes
func runDSInformer(factory informers.SharedInformerFactory) {
	dsInformer := factory.Apps().V1().DaemonSets().Informer()

	stopper := make(chan struct{})
	defer close(stopper)

	defer runtime.HandleCrash()

	dsInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		// When a new resource gets created
		AddFunc: func(obj interface{}) {
			dsObj := obj.(*v1.DaemonSet)

			var worflowid = dsObj.GetAnnotations()["litmuschaos.io/workflow"]
			if dsObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
				log.Print("EventType: Add")
				log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "DaemonSet", dsObj.Name, dsObj.Namespace)
				response, err := SendRequest(worflowid)
				if err != nil {
					log.Print("error", err)
				}
				log.Print(response)
			}
		},

		// When a resource gets updated
		UpdateFunc: func(oldObj interface{}, newObj interface{}) {
			newDsObj := newObj.(*v1.DaemonSet)
			oldDsObj := oldObj.(*v1.DaemonSet)

			var worflowid = newDsObj.GetAnnotations()["litmuschaos.io/workflow"]
			if newDsObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
				var trigger_flag = false
				for _, new_container := range newDsObj.Spec.Template.Spec.Containers {
					for _, old_container := range oldDsObj.Spec.Template.Spec.Containers {
						if old_container.Name == new_container.Name && old_container.Image != new_container.Image {
							trigger_flag = true
						}
					}
				}

				if trigger_flag == true {
					log.Print("EventType: Update")
					log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "DaemonSet", newDsObj.Name, newDsObj.Namespace)
					response, err := SendRequest(worflowid)
					if err != nil {
						log.Print("error", err)
					}
					log.Print(response)
				}
			}
		},
	})

	dsInformer.Run(stopper)
	if !cache.WaitForCacheSync(stopper, dsInformer.HasSynced) {
		runtime.HandleError(fmt.Errorf("Timed out waiting for caches to sync"))
		return
	}
}

// Init function to check the pre-requisite for the gitops agent
func init() {
	if ServerAddr == "" || Namespace == "" {
		log.Fatal("Some environment variables are not set")
	}

	var err error
	ClusterID, AccessKey, err = getConfigmap()
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	log.Printf("Go Version: %s", sys_runtime.Version())
	log.Printf("Go OS/Arch: %s/%s", sys_runtime.GOOS, sys_runtime.GOARCH)

	log.Print("Starting event tracker ...")
	clientset, err := getK8sClient()
	if err != nil {
		log.Fatal(err)
	}

	factory := informers.NewSharedInformerFactory(clientset, 0)

	go runDeploymentInformer(factory)

	go runStsInformer(factory)

	go runDSInformer(factory)

	for {
		time.Sleep(time.Second)
	}
}
