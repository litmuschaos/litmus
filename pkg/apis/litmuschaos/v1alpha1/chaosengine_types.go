package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ChaosEngineSpec defines the desired state of ChaosEngine
// +k8s:openapi-gen=true
// ChaosEngineSpec describes a user-facing custom resource which is used by developers
// to create a chaos profile
type ChaosEngineSpec struct {
	//Appinfo contains deployment details of AUT
	Appinfo ApplicationParams `json:"appinfo"`
	//ChaosServiceAccount is the SvcAcc specified for chaos runner pods
	ChaosServiceAccount string `json:"chaosServiceAccount"`
	//Components contains the image of runnner and monitor pod
	Components ComponentParams `json:"components"`
	//Consists of experiments executed by the engine
	Experiments []ExperimentList `json:"experiments"`
	//Monitor Enable Status
	Monitoring bool `json:"monitoring,omitempty"`
	//JobCleanUpPolicy decides to retain or delete the jobs
	JobCleanUpPolicy string `json:"jobCleanUpPolicy,omitempty"`
}

// ChaosEngineStatus defines the observed state of ChaosEngine
// +k8s:openapi-gen=true
// ChaosEngineStatus derives information about status of individual experiments
type ChaosEngineStatus struct {
	//Detailed status of individual experiments
	Experiments []ExperimentStatuses `json:"experiments"`
}

// ApplicationParams defines information about Application-Under-Test (AUT) on the cluster
// Controller expects AUT to be annotated with litmuschaos.io/chaos: "true" to run chaos
type ApplicationParams struct {
	//Namespace of the AUT
	Appns string `json:"appns"`
	//Unique label of the AUT
	Applabel string `json:"applabel"`
	//kind of application
	AppKind string `json:"appkind"`
}

// ComponentParams defines information about the runner and monitor image
type ComponentParams struct {
	//Contains informations of the monitor pod
	Monitor MonitorInfo `json:"monitor"`
	//Contains informations of the the runner pod
	Runner RunnerInfo `json:"runner"`
}

// MonitorInfo defines the information of the monitor pod
type MonitorInfo struct {
	//Image of the monitor pod
	Image string `json:"image"`
}

// RunnerInfo defines the information of the runnerinfo pod
type RunnerInfo struct {
	//Image of the runner pod
	Image string `json:"image"`
}

// ExperimentList defines information about chaos experiments defined in the chaos engine
// These experiments are "pulled" as versioned charts from a "hub"
type ExperimentList struct {
	//Name of the chaos experiment
	Name string `json:"name"`
	//Holds properties of an experiment listed in the engine
	Spec ExperimentAttributes `json:"spec"`
}

// ExperimentAttributes defines attributes of experiments
type ExperimentAttributes struct {
	//Execution priority of the chaos experiment
	Rank uint32 `json:"rank"`
	//Environment Varibles to override the default values in chaos-experiments
	Components []ExperimentENV `json:"components"`
}

// ExperimentENV varibles to override the default values in chaosexperiment
type ExperimentENV struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// ExperimentStatuses defines information about status of individual experiments
// These fields are immutable, and are derived by kubernetes(operator)
type ExperimentStatuses struct {
	//Name of experiment whose status is detailed
	Name string `json:"name"`
	//Current state of chaos experiment
	Status string `json:"status"`
	//Result of a completed chaos experiment
	Verdict string `json:"verdict"`
	//Time of last state change of chaos experiment
	LastUpdateTime metav1.Time `json:"lastUpdateTime"`
}

// +genclient
// +resource:path=chaosengine
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ChaosEngine is the Schema for the chaosengines API
// +k8s:openapi-gen=true
type ChaosEngine struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ChaosEngineSpec   `json:"spec,omitempty"`
	Status ChaosEngineStatus `json:"status,omitempty"`
}

// ChaosEngineList contains a list of ChaosEngine
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object
type ChaosEngineList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []ChaosEngine `json:"items"`
}

func init() {
	SchemeBuilder.Register(&ChaosEngine{}, &ChaosEngineList{})
}
