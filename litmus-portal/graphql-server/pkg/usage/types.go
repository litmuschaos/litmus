package usage

type WorkflowStat struct {
	Schedules int `bson:"schedules"`
	Runs      int `bson:"runs"`
	ExpRuns   int `bson:"expRuns"`
}
type AgentStat struct {
	Ns      int `bson:"ns"`
	Cluster int `bson:"cluster"`
	Total   int `bson:"total"`
	Active  int `bson:"active"`
}
type ProjectData struct {
	Workflows *WorkflowStat `bson:"workflows"`
	Agents    *AgentStat    `bson:"agents"`
	ProjectID string        `bson:"_id"`
}
type Pagination struct {
	TotalEntries int `bson:"totalEntries"`
}
type TotalCount struct {
	Projects  int           `bson:"projects"`
	Agents    *AgentStat    `bson:"agents"`
	Workflows *WorkflowStat `bson:"workflows"`
}
type AggregateData struct {
	Projects   []*ProjectData `bson:"projects"`
	Pagination []Pagination   `bson:"pagination"`
	TotalCount []TotalCount   `bson:"totalCount"`
}
