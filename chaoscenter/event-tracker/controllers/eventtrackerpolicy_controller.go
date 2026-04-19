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

	// Phase 1: atomically claim pending triggers by flipping IsTriggered to "true"
	// before any side effect. A concurrent reconcile that loses the CAS will re-read
	// and observe the winner's claim, so each trigger is owned by exactly one loop.
	var claimed []string
	err := retry.RetryOnConflict(retry.DefaultBackoff, func() error {
		claimed = nil

		var etp eventtrackerv1.EventTrackerPolicy
		if err := r.Client.Get(ctx, req.NamespacedName, &etp); err != nil {
			if errors.IsNotFound(err) {
				logrus.Infof("EventTrackerPolicy %s not found", req.NamespacedName)
				return nil
			}
			return err
		}

		for i, s := range etp.Statuses {
			if s.Result == utils.ConditionPassed && strings.ToLower(s.IsTriggered) == "false" {
				etp.Statuses[i].IsTriggered = "true"
				claimed = append(claimed, s.ExperimentID)
				logrus.Printf("claiming trigger resource=%s experimentID=%s", s.ResourceName, s.ExperimentID)
			}
		}
		if len(claimed) == 0 {
			return nil
		}
		return r.Client.Update(ctx, &etp)
	})
	if err != nil {
		return ctrl.Result{}, err
	}

	// Phase 2: side-effect dispatch. Executed outside the retry loop so each
	// claim triggers exactly one SendRequest. On a Gitops-Disabled response we
	// restore IsTriggered="false" to match the pre-fix behavior (retryable).
	var toRevert []string
	var dispatchErr error
	for _, experimentID := range claimed {
		response, sendErr := utils.SendRequest(experimentID)
		if sendErr != nil {
			logrus.WithError(sendErr).Errorf("failed to trigger experiment %s", experimentID)
			toRevert = append(toRevert, experimentID)
			dispatchErr = sendErr
			continue
		}

		var res apiResponse
		if jsonErr := json.Unmarshal([]byte(response), &res); jsonErr != nil {
			logrus.WithError(jsonErr).Errorf("failed to parse response for experiment %s", experimentID)
			toRevert = append(toRevert, experimentID)
			dispatchErr = jsonErr
			continue
		}

		if res.Data.GitopsNotifer == "Gitops Disabled" {
			logrus.Infof("gitops disabled for experiment %s; releasing claim", experimentID)
			toRevert = append(toRevert, experimentID)
			continue
		}
		logrus.Infof("successfully triggered experiment %s", experimentID)
	}

	if len(toRevert) > 0 {
		revertErr := retry.RetryOnConflict(retry.DefaultBackoff, func() error {
			var etp eventtrackerv1.EventTrackerPolicy
			if err := r.Client.Get(ctx, req.NamespacedName, &etp); err != nil {
				if errors.IsNotFound(err) {
					return nil
				}
				return err
			}
			revertSet := make(map[string]struct{}, len(toRevert))
			for _, id := range toRevert {
				revertSet[id] = struct{}{}
			}
			changed := false
			for i, s := range etp.Statuses {
				if _, ok := revertSet[s.ExperimentID]; ok && strings.ToLower(s.IsTriggered) == "true" {
					etp.Statuses[i].IsTriggered = "false"
					changed = true
				}
			}
			if !changed {
				return nil
			}
			return r.Client.Update(ctx, &etp)
		})
		if revertErr != nil {
			return ctrl.Result{}, revertErr
		}
	}

	return ctrl.Result{}, dispatchErr
}

// SetupWithManager sets up the controller with the Manager.
func (r *EventTrackerPolicyReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&eventtrackerv1.EventTrackerPolicy{}).
		Complete(r)
}
