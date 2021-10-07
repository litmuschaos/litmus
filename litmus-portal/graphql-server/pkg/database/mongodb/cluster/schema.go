package cluster

// Cluster contains the required fields to be stored in the database for a cluster
type Cluster struct {
	ClusterID          string        `bson:"cluster_id"`
	ProjectID          string        `bson:"project_id"`
	ClusterName        string        `bson:"cluster_name"`
	Description        *string       `bson:"description"`
	PlatformName       string        `bson:"platform_name"`
	AgentNamespace     *string       `bson:"agent_namespace"`
	Serviceaccount     *string       `bson:"serviceaccount"`
	AgentScope         string        `bson:"agent_scope"`
	AgentNsExists      *bool         `bson:"agent_ns_exists"`
	AgentSaExists      *bool         `bson:"agent_sa_exists"`
	AccessKey          string        `bson:"access_key"`
	IsRegistered       bool          `bson:"is_registered"`
	IsClusterConfirmed bool          `bson:"is_cluster_confirmed"`
	IsActive           bool          `bson:"is_active"`
	UpdatedAt          string        `bson:"updated_at"`
	CreatedAt          string        `bson:"created_at"`
	ClusterType        string        `bson:"cluster_type"`
	Token              string        `bson:"token"`
	IsRemoved          bool          `bson:"is_removed"`
	NodeSelector       *string       `bson:"node_selector"`
	Tolerations        []*Toleration `bson:"tolerations,omitempty"`
	StartTime          string        `bson:"start_time"`
}

type Toleration struct {
	TolerationSeconds *int    `bson:"tolerationSeconds,omitempty" yaml:"tolerationSeconds,omitempty"`
	Key               *string `bson:"key,omitempty" yaml:"key,omitempty"`
	Operator          *string `bson:"operator,omitempty" yaml:"operator,omitempty"`
	Effect            *string `bson:"effect,omitempty" yaml:"effect,omitempty"`
	Value             *string `bson:"value,omitempty" yaml:"value,omitempty"`
}
