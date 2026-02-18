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

	"github.com/litmuschaos/litmus/chaoscenter/event-tracker/pkg/utils"
	"github.com/sirupsen/logrus"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/client-go/util/retry"

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

	// Collect experiment IDs that need to be triggered after successful status update
	var experimentsToTrigger []string

	// Phase 1: Atomically claim the trigger status using optimistic concurrency
	err := retry.RetryOnConflict(retry.DefaultBackoff, func() error {
		// Reset on each retry - we need fresh state
		experimentsToTrigger = nil

		var etp eventtrackerv1.EventTrackerPolicy
		if err := r.Client.Get(ctx, req.NamespacedName, &etp); err != nil {
			if errors.IsNotFound(err) {
				logrus.Infof("EventTrackerPolicy %s not found", req.NamespacedName)
				return nil
			}
			return err
		}

		modified := false
		for index, status := range etp.Statuses {
			if status.Result == utils.ConditionPassed && strings.ToLower(status.IsTriggered) == "false" {
				// Mark as triggered BEFORE sending request to prevent duplicate triggers
				etp.Statuses[index].IsTriggered = "true"
				experimentsToTrigger = append(experimentsToTrigger, status.ExperimentID)
				modified = true
				logrus.Printf("Claiming trigger for ResourceName: %s, ExperimentID: %s",
					status.ResourceName, status.ExperimentID)
			}
		}

		if modified {
			// Atomically update - if this fails due to conflict, retry will re-read
			// and see IsTriggered="true" set by the winning reconcile
			return r.Client.Update(ctx, &etp)
		}
		return nil
	})

	if err != nil {
		return ctrl.Result{}, err
	}

	// Phase 2: Trigger experiments only after successfully claiming the status
	// This runs outside the retry loop - experiments are only triggered once
	for _, experimentID := range experimentsToTrigger {
		logrus.Printf("Triggering ExperimentID: %s", experimentID)
		response, err := utils.SendRequest(experimentID)
		if err != nil {
			logrus.WithError(err).Errorf("Failed to trigger experiment %s", experimentID)
			// Continue with other experiments - don't fail the whole reconcile
			continue
		}

		var res apiResponse
		if err := json.Unmarshal([]byte(response), &res); err != nil {
			logrus.WithError(err).Errorf("Failed to parse response for experiment %s", experimentID)
			continue
		}

		if res.Data.GitopsNotifer == "Gitops Disabled" {
			logrus.Infof("GitOps disabled for experiment %s", experimentID)
		} else {
			logrus.Infof("Successfully triggered experiment %s", experimentID)
		}
	}

	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *EventTrackerPolicyReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&eventtrackerv1.EventTrackerPolicy{}).
		Complete(r)
}
