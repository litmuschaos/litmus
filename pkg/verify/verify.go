/*
Copyright 2018 The OpenEBS Authors

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

package verify

import (
	"fmt"
	"io/ioutil"
	"strings"

	"github.com/ghodss/yaml"
	"github.com/openebs/litmus/pkg/kubectl"
)

// VerifyFile type defines a yaml file path that represents an installation
// and is used for various verification purposes
//
// A verify file is a yaml version of Installation struct
type VerifyFile string

// Condition type defines a condition that can be applied against a component
// or a set of components
type Condition string

const (
	// UniqueNodeCond is a condition to check uniqueness of node
	UniqueNodeCond Condition = "is-unique-node"
	// ThreeReplicasCond is a condition to check if replica count is 3
	ThreeReplicasCond Condition = "is-three-replicas"
	// PVCBoundCond is a condition to check if PVC is bound
	PVCBoundCond Condition = "is-pvc-bound"
	// PVCUnBoundCond is a condition to check if PVC is unbound
	PVCUnBoundCond Condition = "is-pvc-unbound"
)

// Action type defines a action that can be applied against a component
// or a set of components
type Action string

const (
	// DeleteAnyPodAction is an action to delete any pod
	DeleteAnyPodAction Action = "delete-any-pod"
	// DeleteOldestPodAction is an action to delete the oldest pod
	DeleteOldestPodAction Action = "delete-oldest-pod"
)

// DeleteVerifier provides contract(s) i.e. method signature(s) to evaluate
// if an installation was deleted successfully
type DeleteVerifier interface {
	IsDeleted() (yes bool, err error)
}

// DeployVerifier provides contract(s) i.e. method signature(s) to evaluate
// if an installation was deployed successfully
type DeployVerifier interface {
	IsDeployed() (yes bool, err error)
}

// ConnectVerifier provides contract(s) i.e. method signature(s) to evaluate
// if a connection is possible or not
type ConnectVerifier interface {
	IsConnected() (yes bool, err error)
}

// RunVerifier provides contract(s) i.e. method signature(s) to evaluate
// if an entity is in a running state or not
type RunVerifier interface {
	IsRunning() (yes bool, err error)
}

// ConditionVerifier provides contract(s) i.e. method signature(s) to evaluate
// if specific entities passes the condition
type ConditionVerifier interface {
	IsCondition(alias string, condition Condition) (yes bool, err error)
}

// ActionVerifier provides contract(s) i.e. method signature(s) to evaluate
// if specific entities passes the action
type ActionVerifier interface {
	IsAction(alias string, action Action) (yes bool, err error)
}

// DeployRunVerifier provides contract(s) i.e. method signature(s) to
// evaluate:
//
// 1/ if an entity is deployed &,
// 2/ if the entity is running
type DeployRunVerifier interface {
	// DeployVerifier will check if the instance has been deployed or not
	DeployVerifier
	// RunVerifier will check if the instance is in a running state or not
	RunVerifier
}

// AllVerifier provides contract(s) i.e. method signature(s) to
// evaluate:
//
// - if an entity is deleted,
// - if an entity is deployed,
// - if the entity is running,
// - if the entity satisfies the provided condition &
// - if the entity satisfies the provided action
type AllVerifier interface {
	// DeleteVerifier will check if the instance has been deleted or not
	DeleteVerifier
	// DeployVerifier will check if the instance has been deployed or not
	DeployVerifier
	// RunVerifier will check if the instance is in a running state or not
	RunVerifier
	// ConditionVerifier will check if the instance satisfies the provided
	// condition
	ConditionVerifier
	// ActionVerifier will check if the instance satisfies the provided action
	ActionVerifier
}

// Installation represents a set of components that represent an installation
// e.g. an operator represented by its CRDs, RBACs and Deployments forms an
// installation
//
// NOTE:
//  Installation struct is accepted as a yaml file that is meant to be verified.
// In addition this file allows the testing logic to take appropriate actions
// as directed in the .feature file.
type Installation struct {
	// VerifyID is an identifier that is used to tie together related installations
	// meant to be verified
	VerifyID string `json:"verifyID"`
	// Version of this installation, operator etc
	Version string `json:"version"`
	// Components of this installation
	Components []Component `json:"components"`
}

// Component is the information about a particular component
// e.g. a Kubernetes Deployment, or a Kubernetes Pod, etc can be
// a component in the overall installation
type Component struct {
	// Name of the component
	Name string `json:"name"`
	// Namespace of the component
	Namespace string `json:"namespace"`
	// Kind name of the component
	// e.g. pods, deployments, services, etc
	Kind string `json:"kind"`
	// APIVersion of the component
	APIVersion string `json:"apiVersion"`
	// Labels of the component that is used for filtering the components
	//
	// Following are some valid sample values for labels:
	//
	//    labels: name=app
	//    labels: name=app,env=prod
	Labels string `json:"labels"`
	// Alias provides a user understood description used for filtering the
	// components. This is a single word setting.
	//
	// NOTE:
	//  Ensure unique alias values in an installation
	//
	// DETAILS:
	//  This is the text which is typically understood by the end user. This text
	// which will be set in the installation file against a particular component.
	// Verification logic will filter the component based on this alias & run
	// various checks &/or actions
	Alias string `json:"alias"`
}

// unmarshal takes the raw yaml data and unmarshals it into Installation
func unmarshal(data []byte) (installation *Installation, err error) {
	installation = &Installation{}

	err = yaml.Unmarshal(data, installation)
	return
}

// load converts a verify file into an instance of *Installation
func load(file VerifyFile) (installation *Installation, err error) {
	if len(file) == 0 {
		err = fmt.Errorf("failed to load: verify file is not provided")
		return
	}

	d, err := ioutil.ReadFile(string(file))
	if err != nil {
		return
	}

	return unmarshal(d)
}

// KubeInstallVerify provides methods that handles verification related logic of
// an installation within kubernetes e.g. application, deployment, operator, etc
type KubeInstallVerify struct {
	// installation is the set of components that determine the install
	installation *Installation
}

// NewKubeInstallVerify provides a new instance of NewKubeInstallVerify based on
// the provided kubernetes runner & verify file
func NewKubeInstallVerify(file VerifyFile) (*KubeInstallVerify, error) {
	i, err := load(file)
	if err != nil {
		return nil, err
	}

	return &KubeInstallVerify{
		installation: i,
	}, nil
}

// IsDeployed evaluates if all components of the installation are deployed
func (v *KubeInstallVerify) IsDeployed() (yes bool, err error) {
	if v.installation == nil {
		err = fmt.Errorf("failed to check IsDeployed: installation object is nil")
		return
	}

	for _, component := range v.installation.Components {
		yes, err = v.isComponentDeployed(component)
		if err != nil || !yes {
			break
		}
	}

	return
}

// IsDeleted evaluates if all components of the installation are deleted
func (v *KubeInstallVerify) IsDeleted() (yes bool, err error) {
	if v.installation == nil {
		err = fmt.Errorf("failed to check IsDeleted: installation object is nil")
		return
	}

	for _, component := range v.installation.Components {
		yes, err = v.isComponentDeleted(component)
		if err != nil || !yes {
			break
		}
	}

	return
}

// IsRunning evaluates if all components of the installation are running
func (v *KubeInstallVerify) IsRunning() (yes bool, err error) {
	if v.installation == nil {
		err = fmt.Errorf("failed to check IsRunning: installation object is nil")
		return
	}

	for _, component := range v.installation.Components {
		if component.Kind != "pod" {
			continue
		}

		yes, err = v.isPodComponentRunning(component)
		if err != nil || !yes {
			break
		}
	}

	return
}

// IsCondition evaluates if specific components satisfies the condition
func (v *KubeInstallVerify) IsCondition(alias string, condition Condition) (yes bool, err error) {
	switch condition {
	case UniqueNodeCond:
		return v.isEachComponentOnUniqueNode(alias)
	case ThreeReplicasCond:
		return v.hasComponentThreeReplicas(alias)
	case PVCBoundCond:
		return v.isPVCBound(alias)
	case PVCUnBoundCond:
		return v.isPVCUnBound(alias)
	default:
		err = fmt.Errorf("condition '%s' is not supported", condition)
	}
	return
}

// IsAction evaluates if specific components satisfies the action
func (v *KubeInstallVerify) IsAction(alias string, action Action) (yes bool, err error) {
	switch action {
	case DeleteAnyPodAction:
		return v.isDeleteAnyRunningPod(alias)
	case DeleteOldestPodAction:
		return v.isDeleteOldestRunningPod(alias)
	default:
		err = fmt.Errorf("action '%s' is not supported", action)
	}
	return
}

// isDeleteAnyPod deletes a pod based on the alias
func (v *KubeInstallVerify) isDeleteAnyRunningPod(alias string) (yes bool, err error) {
	var pods = []string{}

	c, err := v.getMatchingPodComponent(alias)
	if err != nil {
		return
	}

	if len(strings.TrimSpace(c.Labels)) == 0 {
		err = fmt.Errorf("unable to fetch component '%s' '%s': component labels are missing '%s'", c.Kind, alias)
		return
	}

	k := kubectl.New().Namespace(c.Namespace).Labels(c.Labels)
	pods, err = kubectl.GetRunningPods(k)
	if err != nil {
		return
	}

	if len(pods) == 0 {
		err = fmt.Errorf("failed to delete any running pod: pods with alias '%s' and running state are not found", alias)
		return
	}

	// delete any running pod
	k = kubectl.New().Namespace(c.Namespace)
	err = kubectl.DeletePod(k, pods[0])
	if err != nil {
		return
	}

	yes = true
	return
}

// isDeleteOldestRunningPod deletes the oldset pod based on the alias
func (v *KubeInstallVerify) isDeleteOldestRunningPod(alias string) (yes bool, err error) {
	var pod string

	c, err := v.getMatchingPodComponent(alias)
	if err != nil {
		return
	}

	// check for presence of labels
	if len(strings.TrimSpace(c.Labels)) == 0 {
		err = fmt.Errorf("unable to fetch component '%s' '%s': component labels are missing '%s'", c.Kind, alias)
		return
	}

	// fetch oldest running pod
	k := kubectl.New().Namespace(c.Namespace).Labels(c.Labels)
	pod, err = kubectl.GetOldestRunningPod(k)
	if err != nil {
		return
	}

	if len(pod) == 0 {
		err = fmt.Errorf("failed to delete oldest running pod: pod with alias '%s' and running state is not found", alias)
		return
	}

	// delete oldest running pod
	k = kubectl.New().Namespace(c.Namespace)
	err = kubectl.DeletePod(k, pod)
	if err != nil {
		return
	}

	yes = true
	return
}

func (v *KubeInstallVerify) getMatchingPodComponent(alias string) (comp Component, err error) {
	var filtered = []Component{}

	// filter the components that are pods & match with the provided alias
	for _, c := range v.installation.Components {
		if c.Alias == alias && kubectl.IsPod(c.Kind) {
			filtered = append(filtered, c)
		}
	}

	if len(filtered) == 0 {
		err = fmt.Errorf("component not found for alias '%s'", alias)
		return
	}

	// there should be only one component that matches the alias
	if len(filtered) > 1 {
		err = fmt.Errorf("multiple components found for alias '%s': alias should be unique in an install", alias)
		return
	}

	return filtered[0], nil
}

// isComponentDeleted flags if a particular component is deleted
func (v *KubeInstallVerify) isComponentDeleted(component Component) (yes bool, err error) {
	var op string

	if len(strings.TrimSpace(component.Kind)) == 0 {
		err = fmt.Errorf("unable to verify component delete status: component kind is missing")
		return
	}

	// either name or labels is required
	if len(strings.TrimSpace(component.Name)) == 0 && len(strings.TrimSpace(component.Labels)) == 0 {
		err = fmt.Errorf("unable to verify component delete status: either component name or its labels is required")
		return
	}

	// check via name
	if len(strings.TrimSpace(component.Name)) != 0 {
		op, err = kubectl.New().
			Namespace(component.Namespace).
			Run([]string{"get", component.Kind, component.Name})

		if err == nil {
			err = fmt.Errorf("component '%#v' is not deleted: output '%s'", component, op)
			return
		}

		if strings.Contains(err.Error(), "(NotFound)") {
			// yes, it is deleted
			yes = true
			// We wanted to make sure that this component was deleted.
			// Hence the get operation is expected to result in NotFound error
			// from server. Now we can reset the err to nil to let the flow
			// continue
			err = nil
			return
		}

		err = fmt.Errorf("unable to verify delete status of component '%#v': output '%s'", component, op)
		return
	}

	// or check via labels
	op, err = kubectl.New().
		Namespace(component.Namespace).
		Labels(component.Labels).
		Run([]string{"get", component.Kind})

	if err != nil {
		return
	}

	if len(strings.TrimSpace(op)) == 0 || strings.Contains(op, "No resources found") {
		// yes, it is deleted
		yes = true
		return
	}

	err = fmt.Errorf("unable to verify delete status of component '%#v': output '%s'", component, op)
	return
}

// isComponentDeployed flags if a particular component is deployed
func (v *KubeInstallVerify) isComponentDeployed(component Component) (yes bool, err error) {
	var op string

	if len(strings.TrimSpace(component.Kind)) == 0 {
		err = fmt.Errorf("unable to verify component deploy status: component kind is missing")
		return
	}

	// either name or labels is required
	if len(strings.TrimSpace(component.Name)) == 0 && len(strings.TrimSpace(component.Labels)) == 0 {
		err = fmt.Errorf("unable to verify component deploy status: either component name or its labels is required")
		return
	}

	// check via name
	if len(strings.TrimSpace(component.Name)) != 0 {
		op, err = kubectl.New().
			Namespace(component.Namespace).
			Run([]string{"get", component.Kind, component.Name, "-o", "jsonpath='{.metadata.name}'"})

		if err == nil && len(strings.TrimSpace(op)) != 0 {
			// yes, it is deployed
			yes = true
		}
		return
	}

	// or check via labels
	op, err = kubectl.New().
		Namespace(component.Namespace).
		Labels(component.Labels).
		Run([]string{"get", component.Kind, "-o", "jsonpath='{.items[*].metadata.name}'"})

	if err == nil && len(strings.TrimSpace(op)) != 0 {
		// yes, it is deployed
		yes = true
	}
	return
}

// isPodComponentRunning flags if a particular component is running
func (v *KubeInstallVerify) isPodComponentRunning(component Component) (yes bool, err error) {
	// either name or labels is required
	if len(strings.TrimSpace(component.Name)) == 0 && len(strings.TrimSpace(component.Labels)) == 0 {
		err = fmt.Errorf("unable to verify pod component running status: either name or its labels is required")
		return
	}

	// check via name
	if len(strings.TrimSpace(component.Name)) != 0 {
		k := kubectl.New().Namespace(component.Namespace)
		return kubectl.IsPodRunning(k, component.Name)
	}

	// or check via labels
	k := kubectl.New().
		Namespace(component.Namespace).
		Labels(component.Labels)
	return kubectl.ArePodsRunning(k)
}

// hasComponentThreeReplicas flags if a component has three replicas
func (v *KubeInstallVerify) hasComponentThreeReplicas(alias string) (yes bool, err error) {
	err = fmt.Errorf("hasComponentThreeReplicas is not implemented")
	return
}

// getPVCVolume fetches the PVC's volume
func (v *KubeInstallVerify) getPVCVolume(alias string) (op string, err error) {
	var filtered = []Component{}

	// filter the components based on the provided alias
	for _, c := range v.installation.Components {
		if c.Alias == alias {
			filtered = append(filtered, c)
		}
	}

	if len(filtered) == 0 {
		err = fmt.Errorf("unable to check pvc bound status: no component with alias '%s'", alias)
		return
	}

	if len(filtered) > 1 {
		err = fmt.Errorf("unable to check pvc bound status: more than one components found with alias '%s'", alias)
		return
	}

	if len(filtered[0].Name) == 0 {
		err = fmt.Errorf("unable to check pvc bound status: component name is required: '%#v'", filtered[0])
		return
	}

	if filtered[0].Kind != "pvc" {
		err = fmt.Errorf("unable to check pvc bound status: component is not a pvc resource: '%#v'", filtered[0])
		return
	}

	op, err = kubectl.New().
		Namespace(filtered[0].Namespace).
		Run([]string{"get", "pvc", filtered[0].Name, "-o", "jsonpath='{.spec.volumeName}'"})

	return
}

// isPVCBound flags if a PVC component is bound
func (v *KubeInstallVerify) isPVCBound(alias string) (yes bool, err error) {
	var vol string
	vol, err = v.getPVCVolume(alias)
	if err != nil {
		return
	}

	// if no vol then pvc is not bound
	if len(strings.TrimSpace(vol)) == 0 {
		err = fmt.Errorf("pvc component is not bound")
		return
	}

	yes = true
	return
}

// isPVCUnBound flags if a PVC component is unbound
func (v *KubeInstallVerify) isPVCUnBound(alias string) (yes bool, err error) {
	var vol string
	vol, err = v.getPVCVolume(alias)
	if err != nil {
		return
	}

	// if no vol then pvc is not bound
	if len(strings.TrimSpace(vol)) != 0 {
		err = fmt.Errorf("pvc component is bound")
		return
	}

	yes = true
	return
}

// isEachComponentOnUniqueNode flags if each component is placed on unique node
func (v *KubeInstallVerify) isEachComponentOnUniqueNode(alias string) (bool, error) {
	var filtered = []Component{}
	var nodes = []string{}

	// filter the components based on the provided alias
	for _, c := range v.installation.Components {
		if c.Alias == alias {
			filtered = append(filtered, c)
		}
	}

	// get the node of each filtered component
	for _, f := range filtered {
		// skip for non pod components
		if !kubectl.IsPod(f.Kind) {
			continue
		}

		// if pod then get the node on which it is running
		if len(strings.TrimSpace(f.Labels)) == 0 {
			return false, fmt.Errorf("unable to fetch component '%s' node: component labels are required", f.Kind)
		}

		k := kubectl.New().Namespace(f.Namespace).Labels(f.Labels)
		n, err := kubectl.GetPodNodes(k)
		if err != nil {
			return false, err
		}

		nodes = append(nodes, n...)
	}

	// check if condition is satisfied i.e. no duplicate nodes
	exists := map[string]string{}
	for _, n := range nodes {
		if _, ok := exists[n]; ok {
			return false, nil
		}
		exists[n] = "tracked"
	}

	return true, nil
}

// KubeConnectionVerify provides methods that verifies connection to a kubernetes
// environment
type KubeConnectionVerify struct{}

// NewKubeConnectionVerify provides a new instance of KubeConnectionVerify
func NewKubeConnectionVerify() *KubeConnectionVerify {
	return &KubeConnectionVerify{}
}

// IsConnected verifies if kubectl can connect to the target Kubernetes cluster
func (k *KubeConnectionVerify) IsConnected() (yes bool, err error) {
	_, err = kubectl.New().Run([]string{"get", "pods"})
	if err == nil {
		yes = true
	}
	return
}
