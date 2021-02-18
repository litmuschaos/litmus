package schema

type Cluster struct {
	ClusterID          string  `bson:"cluster_id"`
	ProjectID          string  `bson:"project_id"`
	ClusterName        string  `bson:"cluster_name"`
	Description        *string `bson:"description"`
	PlatformName       string  `bson:"platform_name"`
	AgentNamespace     *string `bson:"agent_namespace"`
	Serviceaccount     *string `bson:"serviceaccount"`
	AgentScope         string  `bson:"agent_scope"`
	AgentNsExists      *bool   `bson:"agent_ns_exists"`
	AgentSaExists      *bool   `bson:"agent_sa_exists"`
	AccessKey          string  `bson:"access_key"`
	IsRegistered       bool    `bson:"is_registered"`
	IsClusterConfirmed bool    `bson:"is_cluster_confirmed"`
	IsActive           bool    `bson:"is_active"`
	UpdatedAt          string  `bson:"updated_at"`
	CreatedAt          string  `bson:"created_at"`
	ClusterType        string  `bson:"cluster_type"`
	Token              string  `bson:"token"`
	IsRemoved          bool    `bson:"is_removed"`
}
