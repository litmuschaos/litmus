package utils

import (
	"encoding/json"
	"fmt"
	"log"
	"reflect"

	v1 "k8s.io/api/apps/v1"
	"k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
)

// K8s informer watching for all the deployment changes
func RunDeploymentInformer(factory informers.SharedInformerFactory) {
	deploymentInformer := factory.Apps().V1().Deployments().Informer()

	stopper := make(chan struct{})
	defer close(stopper)

	defer runtime.HandleCrash()

	// label change -->ver (2) --> policy-replicas=1
	deploymentInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		// When a resource gets updated
		UpdateFunc: func(oldObj interface{}, newObj interface{}) {
			depNewObj := newObj.(*v1.Deployment)
			depOldObj := oldObj.(*v1.Deployment)

			oldManifest := depOldObj.GetAnnotations()["kubectl.kubernetes.io/last-applied-configuration"]
			newManifest := depNewObj.GetAnnotations()["kubectl.kubernetes.io/last-applied-configuration"]

			if oldManifest != "" && newManifest != "" {
				var oldDep v1.Deployment
				err := json.Unmarshal([]byte(oldManifest), &oldDep)
				if err != nil {
					log.Print(err)
					return
				}

				var newDep v1.Deployment
				err = json.Unmarshal([]byte(newManifest), &newDep)
				if err != nil {
					log.Print(err)
					return
				}

				if depNewObj.GetResourceVersion() != depOldObj.GetResourceVersion() && !reflect.DeepEqual(newDep, oldDep) {
					var worflowid = depNewObj.GetAnnotations()["litmuschaos.io/workflow"]
					if depNewObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
						log.Print("EventType: Update")
						log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "Deployment", depNewObj.Name, depNewObj.Namespace)
						err := PolicyAuditor("Deployment", depNewObj, worflowid)
						if err != nil {
							log.Print(err)
							return
						}
					}
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
func RunStsInformer(factory informers.SharedInformerFactory) {
	stsInformer := factory.Apps().V1().StatefulSets().Informer()

	stopper := make(chan struct{})
	defer close(stopper)

	defer runtime.HandleCrash()

	stsInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		// When a resource gets updated
		UpdateFunc: func(oldObj interface{}, newObj interface{}) {
			stsNewObj := newObj.(*v1.StatefulSet)
			stsOldObj := oldObj.(*v1.StatefulSet)

			oldManifest := stsOldObj.GetAnnotations()["kubectl.kubernetes.io/last-applied-configuration"]
			newManifest := stsNewObj.GetAnnotations()["kubectl.kubernetes.io/last-applied-configuration"]

			if oldManifest != "" && newManifest != "" {
				var oldSts v1.StatefulSet
				err := json.Unmarshal([]byte(oldManifest), &oldSts)
				if err != nil {
					log.Print(err)
					return
				}

				var newSts v1.StatefulSet
				err = json.Unmarshal([]byte(newManifest), &newSts)
				if err != nil {
					log.Print(err)
					return
				}

				if stsNewObj.GetResourceVersion() != stsOldObj.GetResourceVersion() && !reflect.DeepEqual(newSts, oldSts) {
					var worflowid = stsNewObj.GetAnnotations()["litmuschaos.io/workflow"]
					if stsNewObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
						log.Print("EventType: Update")
						log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "StateFulSet", stsNewObj.Name, stsNewObj.Namespace)
						PolicyAuditor("StateFulSet", stsNewObj, worflowid)
					}

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
func RunDSInformer(factory informers.SharedInformerFactory) {
	dsInformer := factory.Apps().V1().DaemonSets().Informer()

	stopper := make(chan struct{})
	defer close(stopper)

	defer runtime.HandleCrash()

	dsInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		// When a resource gets updated
		UpdateFunc: func(oldObj interface{}, newObj interface{}) {
			dsNewObj := newObj.(*v1.DaemonSet)
			dsOldObj := newObj.(*v1.DaemonSet)

			oldManifest := dsOldObj.GetAnnotations()["kubectl.kubernetes.io/last-applied-configuration"]
			newManifest := dsNewObj.GetAnnotations()["kubectl.kubernetes.io/last-applied-configuration"]

			if oldManifest != "" && newManifest != "" {
				var oldDm v1.StatefulSet
				err := json.Unmarshal([]byte(oldManifest), &oldDm)
				if err != nil {
					log.Print(err)
					return
				}

				var newDm v1.StatefulSet
				err = json.Unmarshal([]byte(newManifest), &newDm)
				if err != nil {
					log.Print(err)
					return
				}

				if dsNewObj.GetResourceVersion() != dsOldObj.GetResourceVersion() && !reflect.DeepEqual(newDm, oldDm) {
					var worflowid = dsNewObj.GetAnnotations()["litmuschaos.io/workflow"]
					if dsNewObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
						log.Print("EventType: Update")
						log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "DaemonSet", dsNewObj.Name, dsNewObj.Namespace)
						PolicyAuditor("DaemonSet", dsNewObj, worflowid)
					}
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
