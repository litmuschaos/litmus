package types

type KubeObjRequest struct {
	RequestID      string
	ClusterID      string            `json:"clusterID"`
	ObjectType     string            `json:"objectType"`
	Workloads      []Workload        `json:"workloads"`
	KubeGVRRequest []*KubeGVRRequest `json:"kubeObjRequest"`
}

// Workload consists of workload details
type Workload struct {
	Name      string `json:"name"`
	Kind      string `json:"kind"`
	Namespace string `json:"namespace"`
}

type KubeGVRRequest struct {
	Group    string `json:"group"`
	Version  string `json:"version"`
	Resource string `json:"resource"`
}

//KubeObject consists of all the namespaces and its related K8S object details
type KubeObject struct {
	Namespace string       `json:"namespace"`
	Data      []ObjectData `json:"data"`
}

//ObjectData consists of Kubernetes Objects related details
type ObjectData struct {
	Name   string            `json:"name"`
	Kind   string            `json:"kind"`
	Labels map[string]string `json:"labels"`
}
