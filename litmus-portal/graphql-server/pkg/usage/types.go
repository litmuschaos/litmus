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
type Owner struct {
	UserId   string `bson:"user_id"`
	Username string `bson:"username"`
	Name     string `bson:"name"`
}
type MemberStat struct {
	Owner *Owner `bson:"owner"`
	Total int    `bson:"total"`
}
type ProjectData struct {
	Name      string        `bson:"name"`
	Workflows *WorkflowStat `bson:"workflows"`
	Agents    *AgentStat    `bson:"agents"`
	ProjectId string        `bson:"project_id"`
	Members   *MemberStat   `bson:"members"`
}

type Pagination struct {
	TotalEntries int `bson:"totalEntries"`
}

type TotalCount struct {
	Projects  int           `bson:"projects"`
	Users     int           `bson:"users"`
	Agents    *AgentStat    `bson:"agents"`
	Workflows *WorkflowStat `bson:"workflows"`
}
type AggregateData struct {
	Projects   []*ProjectData `bson:"projects"`
	Pagination []Pagination   `bson:"pagination"`
	TotalCount []TotalCount   `bson:"totalCount"`
}
