package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ChaosResultSpec defines the desired state of ChaosResult
// +k8s:openapi-gen=true
// The chaosresult holds the status of a chaos experiment that is listed as an item
// in the chaos engine to be run against a given app.
type ChaosResultSpec struct {
	// Definition carries low-level chaos options
	ExperimentStatus TestStatus `json:"experimentstatus"`
}

// ChaosResultStatus defines the observed state of ChaosResult
// +k8s:openapi-gen=true
type ChaosResultStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "operator-sdk generate k8s" to regenerate code after modifying this file
	// Add custom validation using kubebuilder tags: https://book.kubebuilder.io/beyond_basics/generating_crd.html
}

// TestStatus defines information about the status and results of a chaos experiment
type TestStatus struct {
	// Phase defines whether an experiment is running or completed
	Phase string `json:"phase"`
	// Verdict defines whether an experiment result is pass or fail
	Verdict string `json:"verdict"`
}

// +genclient
// +resource:path=chaosresult
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ChaosResult is the Schema for the chaosresults API
// +k8s:openapi-gen=true
type ChaosResult struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ChaosResultSpec   `json:"spec,omitempty"`
	Status ChaosResultStatus `json:"status,omitempty"`
}

// ChaosResultList contains a list of ChaosResult
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object
type ChaosResultList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []ChaosResult `json:"items"`
}

func init() {
	SchemeBuilder.Register(&ChaosResult{}, &ChaosResultList{})
}
