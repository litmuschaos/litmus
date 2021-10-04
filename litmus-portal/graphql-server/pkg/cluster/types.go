package cluster

// SubscriberRequests contains the required configurable parameters for the requests sent to the subscriber
type SubscriberRequests struct {
	RequestType  string  `json:"request_type"`
	K8sManifest  string  `json:"k8s_manifest"`
	ExternalData *string `json:"external_data"`
	ProjectID    string  `json:"project_id"`
	ClusterID    string  `json:"cluster_id"`
	Namespace    string  `json:"namespace"`
}

type Toleration struct {
	Key               *string `yaml:"key"`
	Operator          *string `yaml:"operator"`
	Effect            *string `yaml:"effect"`
	TolerationSeconds *string `yaml:"tolerationSeconds"`
}
