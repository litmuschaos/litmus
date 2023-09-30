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

package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// EDIT THIS FILE!  THIS IS SCAFFOLDING FOR YOU TO OWN!
// NOTE: json tags are required.  Any new fields you add must have json tags for the fields to be serialized.

// EventTrackerPolicySpec defines the desired state of EventTrackerPolicy
type EventTrackerPolicySpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	ConditionType string      `json:"condition_type,omitempty"`
	Conditions    []Condition `json:"conditions,omitempty"`
}

type Condition struct {
	Key      string  `json:"key,omitempty"`
	Value    *string `json:"value,omitempty"`
	Operator string  `json:"operator,omitempty"`
}

// EventTrackerPolicyStatus defines the observed state of EventTrackerPolicy
type EventTrackerPolicyStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file
	TimeStamp    string `json:"time_stamp,omitempty"`
	Resource     string `json:"resource,omitempty"`
	ResourceName string `json:"resource_name,omitempty"`
	Result       string `json:"result,omitempty"`
	ExperimentID string `json:"experiment_id,omitempty"`
	IsTriggered  string `json:"is_triggered,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// EventTrackerPolicy is the Schema for the eventtrackerpolicies API
type EventTrackerPolicy struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec     EventTrackerPolicySpec     `json:"spec,omitempty"`
	Statuses []EventTrackerPolicyStatus `json:"statuses,omitempty"`
}

//+kubebuilder:object:root=true

// EventTrackerPolicyList contains a list of EventTrackerPolicy
type EventTrackerPolicyList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []EventTrackerPolicy `json:"items"`
}

func init() {
	SchemeBuilder.Register(&EventTrackerPolicy{}, &EventTrackerPolicyList{})
}
