package environments

import "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

type EnvironmentType string

const (
	Prod    EnvironmentType = "prod"
	NonProd EnvironmentType = "non_prod"
)

type Environment struct {
	mongodb.Audit           `bson:",inline"`
	mongodb.ResourceDetails `bson:",inline"`
	ProjectID               string          `bson:"project_id"`
	EnvironmentID           string          `bson:"environment_id"`
	Type                    EnvironmentType `bson:"type"`
	InfraIDs                []string        `bson:"infra_ids"`
}

type TotalFilteredData struct {
	Count int `bson:"count"`
}

type AggregatedEnvironments struct {
	TotalFilteredEnvironments []TotalFilteredData `bson:"total_filtered_environments"`
	Environments              []Environment       `bson:"environments"`
}
