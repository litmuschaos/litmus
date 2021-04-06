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
	"log"

	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"

	eventtrackerv1 "github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/api/v1"
)

// EventTrackerPolicyReconciler reconciles a EventTrackerPolicy object
type EventTrackerPolicyReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=eventtracker.litmuschaos.io,resources=eventtrackerpolicies,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=eventtracker.litmuschaos.io,resources=eventtrackerpolicies/status,verbs=get;update;patch

func (r *EventTrackerPolicyReconciler) Reconcile(req ctrl.Request) (ctrl.Result, error) {
	_ = context.Background()
	_ = r.Log.WithValues("eventtrackerpolicy", req.NamespacedName)

	// your logic here

	log.Print(req.Name)
	var etp eventtrackerv1.EventTrackerPolicy

	err := r.Client.Get(context.Background(), req.NamespacedName , &etp)
	if err != nil{
		return ctrl.Result{}, err
	}

	log.Print(etp.Statuses)

	return ctrl.Result{}, nil
}

func (r *EventTrackerPolicyReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&eventtrackerv1.EventTrackerPolicy{}).
		Complete(r)
}
