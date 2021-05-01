/*


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
	"log"
	"strings"
	"sync"

	"github.com/go-logr/logr"
	eventtrackerv1 "github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/api/v1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/pkg/utils"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// EventTrackerPolicyReconciler reconciles a EventTrackerPolicy object
type EventTrackerPolicyReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

type Response struct {
	Data struct {
		GitopsNotifer string `json:"gitopsNotifer"`
	} `json:"data"`
}

// +kubebuilder:rbac:groups=eventtracker.litmuschaos.io,resources=eventtrackerpolicies,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=eventtracker.litmuschaos.io,resources=eventtrackerpolicies/status,verbs=get;update;patch

const ConditionPassed = "ConditionPassed"

func (r *EventTrackerPolicyReconciler) Reconcile(req ctrl.Request) (ctrl.Result, error) {
	_ = context.Background()
	_ = r.Log.WithValues("eventtrackerpolicy", req.NamespacedName)

	var mutex = &sync.Mutex{}
	mutex.Lock()

	var etp eventtrackerv1.EventTrackerPolicy
	err := r.Client.Get(context.Background(), req.NamespacedName, &etp)
	if errors.IsNotFound(err) {
		log.Print(req.NamespacedName, " not found")
		return ctrl.Result{}, nil
	} else if err != nil {
		return ctrl.Result{}, err
	}

	for index, status := range etp.Statuses {
		if string(status.Result) == ConditionPassed && strings.ToLower(status.IsTriggered) == "false" {
			log.Print("ResourceName: " + status.ResourceName + "WorkflowID: " + status.WorkflowID)
			response, err := utils.SendRequest(status.WorkflowID)
			if err != nil {
				return ctrl.Result{}, err
			}
			log.Print(response)

			var res Response
			json.Unmarshal([]byte(response), &res)

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

func (r *EventTrackerPolicyReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&eventtrackerv1.EventTrackerPolicy{}).
		Complete(r)
}
