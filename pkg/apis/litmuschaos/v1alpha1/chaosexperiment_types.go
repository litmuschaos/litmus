package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ChaosExperimentSpec defines the desired state of ChaosExperiment
// +k8s:openapi-gen=true
// An experiment is the definition of a chaos test and is listed as an item
// in the chaos engine to be run against a given app.
type ChaosExperimentSpec struct {
	// Definition carries low-level chaos options
	Definition ExperimentDef `json:"definition"`
}

// ChaosExperimentStatus defines the observed state of ChaosExperiment
// +k8s:openapi-gen=true
type ChaosExperimentStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "operator-sdk generate k8s" to regenerate code after modifying this file
	// Add custom validation using kubebuilder tags: https://book.kubebuilder.io/beyond_basics/generating_crd.html
}

// ExperimentDef defines information about nature of chaos & components subjected to it
type ExperimentDef struct {
	// Default labels of the executor pod
	// +optional
	Labels map[string]string `json:"labels"`
	// Image of the chaos executor
	Image string `json:"image"`
	// List of ENV vars passed to executor pod
	ENVList []ENVPair `json:"env"`
	// Defines command to invoke experiment
	Command []string `json:"command"`
	// Defines arguments to executor's entrypoint command
	Args []string `json:"args"`
}

// ENVPair defines env var list to hold chaos params
type ENVPair struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// +genclient
// +resource:path=chaosexperiment
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ChaosExperiment is the Schema for the chaosexperiments API
// +k8s:openapi-gen=true
type ChaosExperiment struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ChaosExperimentSpec   `json:"spec,omitempty"`
	Status ChaosExperimentStatus `json:"status,omitempty"`
}

// ChaosExperimentList contains a list of ChaosExperiment
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object
type ChaosExperimentList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []ChaosExperiment `json:"items"`
}

func init() {
	SchemeBuilder.Register(&ChaosExperiment{}, &ChaosExperimentList{})
}
