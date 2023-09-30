/*
Copyright 2021.

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

package controllers

import (
	"context"
	"encoding/json"
	"strings"
	"sync"

	"github.com/litmuschaos/litmus/chaoscenter/event-tracker/pkg/utils"
	"github.com/sirupsen/logrus"
	"k8s.io/apimachinery/pkg/api/errors"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	eventtrackerv1 "github.com/litmuschaos/litmus/chaoscenter/event-tracker/api/v1"
)

// EventTrackerPolicyReconciler reconciles a EventTrackerPolicy object
type EventTrackerPolicyReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

type apiResponse struct {
	Data struct {
		GitopsNotifer string `json:"gitopsNotifer"`
	} `json:"data"`
}

//+kubebuilder:rbac:groups=eventtracker.litmuschaos.io,resources=eventtrackerpolicies,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=eventtracker.litmuschaos.io,resources=eventtrackerpolicies/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=eventtracker.litmuschaos.io,resources=eventtrackerpolicies/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// Modify the Reconcile function to compare the state specified by
// the EventTrackerPolicy object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.10.0/pkg/reconcile
func (r *EventTrackerPolicyReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)

	var mutex = &sync.Mutex{}
	mutex.Lock()

	var etp eventtrackerv1.EventTrackerPolicy
	err := r.Client.Get(context.Background(), req.NamespacedName, &etp)
	if errors.IsNotFound(err) {
		logrus.Infof("namespace: %s not found", req.NamespacedName)
		return ctrl.Result{}, nil
	} else if err != nil {
		return ctrl.Result{}, err
	}

	for index, status := range etp.Statuses {
		if status.Result == utils.ConditionPassed && strings.ToLower(status.IsTriggered) == "false" {
			logrus.Print("ResourceName: " + status.ResourceName + ", ExperimentID: " + status.ExperimentID)
			response, err := utils.SendRequest(status.ExperimentID)
			if err != nil {
				return ctrl.Result{}, err
			}

			logrus.Print(response)

			var res apiResponse
			err = json.Unmarshal([]byte(response), &res)
			if err != nil {
				return ctrl.Result{}, err
			}

			if res.Data.GitopsNotifer == "Gitops Disabled" {
				etp.Statuses[index].IsTriggered = "false"
			} else {
				etp.Statuses[index].IsTriggered = "true"
			}
		}
	}

	err = r.Client.Update(context.Background(), &etp)
	if err != nil {
		return ctrl.Result{}, err
	}

	defer mutex.Unlock()

	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *EventTrackerPolicyReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&eventtrackerv1.EventTrackerPolicy{}).
		Complete(r)
}
