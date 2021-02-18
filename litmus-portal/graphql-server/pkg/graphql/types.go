package graphql

type SubscriberRequests struct {
	RequestType  string  `json:"request_type"`
	K8sManifest  string  `json:"k8s_manifest"`
	ExternalData *string `json:"external_data"`
	ProjectID    string  `json:"project_id"`
	ClusterID    string  `json:"cluster_id"`
	Namespace    string  `json:"namespace"`
}
