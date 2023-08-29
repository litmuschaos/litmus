package utils

import (
	"fmt"
	"reflect"

	"github.com/sirupsen/logrus"

	v1 "k8s.io/api/apps/v1"
	"k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
)

// RunDeploymentInformer K8s informer watching for all the deployment changes
func RunDeploymentInformer(factory informers.SharedInformerFactory) {
	deploymentInformer := factory.Apps().V1().Deployments().Informer()

	stopper := make(chan struct{})
	defer close(stopper)

	defer runtime.HandleCrash()

	deploymentInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		// When a resource gets updated
		UpdateFunc: func(oldObj interface{}, newObj interface{}) {
			depNewObj := newObj.(*v1.Deployment)
			depOldObj := oldObj.(*v1.Deployment)

			var worflowid = depNewObj.GetAnnotations()["litmuschaos.io/workflow"]

			if depNewObj.GetResourceVersion() != depOldObj.GetResourceVersion() &&
				!reflect.DeepEqual(depNewObj, depOldObj) &&
				depNewObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" &&
				worflowid != "" {
				logrus.Infof("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "Deployment", depNewObj.Name, depNewObj.Namespace)
				err := PolicyAuditor("Deployment", depNewObj, depOldObj, worflowid)
				if err != nil {
					logrus.Error(err)
					return
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

// RunStsInformer K8s informer watching for all the Statefullset changes
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

			var worflowid = stsNewObj.GetAnnotations()["litmuschaos.io/workflow"]

			if stsNewObj.GetResourceVersion() != stsOldObj.GetResourceVersion() &&
				!reflect.DeepEqual(stsNewObj, stsOldObj) &&
				stsNewObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" &&
				worflowid != "" {
				logrus.Infof("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "Deployment", stsNewObj.Name, stsNewObj.Namespace)
				err := PolicyAuditor("Deployment", stsNewObj, stsOldObj, worflowid)
				if err != nil {
					logrus.Error(err)
					return
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

// RunDSInformer K8s informer watching for all the daemonset changes
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

			var worflowid = dsNewObj.GetAnnotations()["litmuschaos.io/workflow"]

			if dsNewObj.GetResourceVersion() != dsOldObj.GetResourceVersion() &&
				!reflect.DeepEqual(dsNewObj, dsOldObj) &&
				dsNewObj.GetAnnotations()["litmuschaos.io/gitops"] == "true" &&
				worflowid != "" {
				logrus.Infof("GitOps Notification for workflowID: %s, ResourceType: %s, ResourceName: %s, ResourceNamespace: %s", worflowid, "Deployment", dsNewObj.Name, dsNewObj.Namespace)
				err := PolicyAuditor("Deployment", dsNewObj, dsOldObj, worflowid)
				if err != nil {
					logrus.Error(err)
					return
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
