package analytics

import (
	dbSchemaAnalytics "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/analytics"
)

type STATE string

type PromDSDetails struct {
	URL   string
	Start string
	End   string
}

type PromQuery struct {
	Queryid    string
	Query      string
	Legend     *string
	Resolution *string
	Minstep    int
	DSdetails  *PromDSDetails
}

type PromSeries struct {
	Series    string
	DSdetails *PromDSDetails
}

type DataSourceInfo struct {
	HealthStatus string
	DataSource   *dbSchemaAnalytics.DataSource
}
