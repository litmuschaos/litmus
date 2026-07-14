package chaos_infrastructure

import (
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
)

// ChaosInfra contains the required fields to be stored in the database for an chaos_infra
type ChaosInfra struct {
	mongodb.ResourceDetails `bson:",inline"`
	mongodb.Audit           `bson:",inline"`
	ProjectID               string        `bson:"project_id"`
	InfraID                 string        `bson:"infra_id"`
	InfraNamespace          *string       `bson:"infra_namespace"`
	PlatformName            string        `bson:"platform_name"`
	ServiceAccount          *string       `bson:"service_account"`
	InfraScope              string        `bson:"infra_scope"`
	InfraNsExists           *bool         `bson:"infra_ns_exists"`
	EnvironmentID           string        `bson:"environment_id"`
	InfraSaExists           *bool         `bson:"infra_sa_exists"`
	AccessKey               string        `bson:"access_key"`
	InfraType               string        `bson:"infra_type"`
	IsRegistered            bool          `bson:"is_registered"`
	IsInfraConfirmed        bool          `bson:"is_infra_confirmed"`
	IsActive                bool          `bson:"is_active"`
	Token                   string        `bson:"token"`
	SkipSSL                 *bool         `bson:"skip_ssl"`
	NodeSelector            *string       `bson:"node_selector"`
	Tolerations             []*Toleration `bson:"tolerations,omitempty"`
	StartTime               string        `bson:"start_time"`
	Version                 string        `bson:"version"`
}

type TotalFilteredData struct {
	Count int `bson:"count"`
}

// ChaosInfraDetails contains the fields required for sending infra details as response
type ChaosInfraDetails struct {
	InfraID                 string `bson:"infra_id"`
	mongodb.ResourceDetails `bson:",inline"`
	mongodb.Audit           `bson:",inline"`
	ProjectID               string           `bson:"project_id"`
	EnvironmentID           string           `bson:"environment_id"`
	PlatformName            string           `bson:"platform_name"`
	Token                   string           `bson:"token"`
	InfraScope              string           `bson:"infra_scope"`
	AccessKey               string           `bson:"access_key"`
	StartTime               string           `bson:"start_time"`
	Version                 string           `bson:"version"`
	NodeSelector            *string          `bson:"node_selector"`
	InfraNamespace          *string          `bson:"infra_namespace"`
	ServiceAccount          *string          `bson:"service_account"`
	Tolerations             []*Toleration    `bson:"tolerations,omitempty"`
	ExperimentRunDetails    []ExperimentRuns `bson:"expRunDetails"`
	ExperimentDetails       []Experiments    `bson:"experimentDetails"`
	IsRegistered            bool             `bson:"is_registered"`
	IsInfraConfirmed        bool             `bson:"is_infra_confirmed"`
	IsActive                bool             `bson:"is_active"`
	SkipSSL                 *bool            `bson:"skip_ssl"`
	InfraNsExists           *bool            `bson:"infra_ns_exists"`
	InfraSaExists           *bool            `bson:"infra_sa_exists"`
}

type AggregatedGetInfras struct {
	TotalFilteredInfras []TotalFilteredData `bson:"total_filtered_infras"`
	Infras              []ChaosInfraDetails `bson:"infras"`
}

type AggregatedInfras struct {
	TotalFilteredInfras []TotalFilteredData `bson:"total_filtered_infras"`
	Infras              []ChaosInfraDetails `bson:"infras"`
}

// ExperimentRuns returns corresponding experiment run details
type ExperimentRuns struct {
	LastRunTimestamp int64 `bson:"last_run_timestamp"`
	TotalRuns        int   `bson:"exp_run_count"`
}

// Experiments returns corresponding experiment run details
type Experiments struct {
	TotalSchedules   int   `bson:"experiments_count"`
	LastRunTimestamp int64 `bson:"last_run_timestamp"`
	TotalRuns        int   `bson:"exp_run_count"`
}

type Toleration struct {
	Key               *string `bson:"key,omitempty" yaml:"key,omitempty" json:"key,omitempty"`
	Operator          *string `bson:"operator,omitempty" yaml:"operator,omitempty" json:"operator,omitempty"`
	Effect            *string `bson:"effect,omitempty" yaml:"effect,omitempty" json:"effect,omitempty"`
	Value             *string `bson:"value,omitempty" yaml:"value,omitempty" json:"value,omitempty"`
	TolerationSeconds *int    `bson:"toleration_seconds,omitempty" yaml:"tolerationSeconds,omitempty" json:"tolerationSeconds,omitempty"`
}

type TotalCount struct {
	Id    bool `bson:"_id"`
	Count int  `bson:"count"`
}

type AggregatedInfraStats struct {
	TotalActiveInfrastructure     []TotalCount `bson:"total_active_infras"`
	TotalConfirmedInfrastructures []TotalCount `bson:"total_confirmed_infras"`
}
