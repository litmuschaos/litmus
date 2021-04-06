package utils

import (
	"fmt"
	v1 "k8s.io/api/apps/v1"
	"k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
	"log"
)


// K8s informer watching for all the deployment changes
func RunDeploymentInformer(factory informers.SharedInformerFactory) {
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
				PolicyAuditor("Deployment", depObj, worflowid)
			}
		},

		// When a resource gets updated
		UpdateFunc: func(_ interface{}, newObj interface{}) {
			depObj := newObj.(*v1.Deployment)

			var worflowid = depObj.GetAnnotations()["litmuschaos.io/workflow"]
			if depObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
					log.Print("EventType: Add")
					log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "Deployment", depObj.Name, depObj.Namespace)
					PolicyAuditor("Deployment", depObj, worflowid)
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
		// When a new resource gets created
		AddFunc: func(obj interface{}) {
			stsObj := obj.(*v1.StatefulSet)

			var worflowid = stsObj.GetAnnotations()["litmuschaos.io/workflow"]
			if stsObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
				log.Print("EventType: Add")
				log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "StateFulSet", stsObj.Name, stsObj.Namespace)
				PolicyAuditor("StateFulSet", stsObj, worflowid)
			}
		},

		// When a resource gets updated
		UpdateFunc: func(oldObj interface{}, newObj interface{}) {
			stsObj := newObj.(*v1.StatefulSet)

			var worflowid = stsObj.GetAnnotations()["litmuschaos.io/workflow"]
			if stsObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
				log.Print("EventType: Update")
				log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "StateFulSet", stsObj.Name, stsObj.Namespace)
				PolicyAuditor("StateFulSet", stsObj, worflowid)
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
		// When a new resource gets created
		AddFunc: func(obj interface{}) {
			dsObj := obj.(*v1.DaemonSet)

			var worflowid = dsObj.GetAnnotations()["litmuschaos.io/workflow"]
			if dsObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
				log.Print("EventType: Add")
				log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "DaemonSet", dsObj.Name, dsObj.Namespace)
				PolicyAuditor("DaemonSet", dsObj, worflowid)
			}
		},

		// When a resource gets updated
		UpdateFunc: func(oldObj interface{}, newObj interface{}) {
			dsObj := newObj.(*v1.DaemonSet)

			var worflowid = dsObj.GetAnnotations()["litmuschaos.io/workflow"]
			if dsObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" && worflowid != "" {
				log.Print("EventType: Update")
				log.Printf("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "DaemonSet", dsObj.Name, dsObj.Namespace)
				PolicyAuditor("DaemonSet", dsObj, worflowid)
			}
		},
	})

	dsInformer.Run(stopper)
	if !cache.WaitForCacheSync(stopper, dsInformer.HasSynced) {
		runtime.HandleError(fmt.Errorf("Timed out waiting for caches to sync"))
		return
	}
}

