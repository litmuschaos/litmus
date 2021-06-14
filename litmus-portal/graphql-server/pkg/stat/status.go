package stat

import (
	"encoding/json"
	"net/http"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/project"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/usermanagement"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
)

type AgentCount struct {
	Namespaced int `json:"ns_scope"`
	Cluster    int `json:"cluster_scope"`
	Total      int `json:"total_count"`
}
type OverviewStat struct {
	UserCount             int        `json:"user_count"`
	ProjectCount          int        `json:"project_count"`
	AgentCount            AgentCount `json:"agent_count"`
	WorkflowScheduleCount int        `json:"schedule_count"`
	WorkflowRunCount      int        `json:"run_count"`
}

//GetStats returns the portals overview
func GetStats(w http.ResponseWriter, r *http.Request) {
	users, err := usermanagement.GetUsers(r.Context(), bson.D{})
	if err != nil {
		logrus.WithError(err).Errorf("failed to get users for stat")
		utils.WriteHeaders(&w, http.StatusInternalServerError)
		return
	}
	agentNS, err := cluster.GetClusters(r.Context(), bson.D{{"agent_scope", "namespace"}, {"is_removed", false}})
	if err != nil {
		logrus.WithError(err).Errorf("failed to get agents(ns) for stat")
		utils.WriteHeaders(&w, http.StatusInternalServerError)
		return
	}
	agents, err := cluster.GetClusters(r.Context(), bson.D{{"is_removed", false}})
	if err != nil {
		logrus.WithError(err).Errorf("failed to get agents for stat")
		utils.WriteHeaders(&w, http.StatusInternalServerError)
		return
	}
	projects, err := project.GetProjects(r.Context(), bson.D{})
	if err != nil {
		logrus.WithError(err).Errorf("failed to get projects for stat")
		utils.WriteHeaders(&w, http.StatusInternalServerError)
		return
	}
	workflows, err := workflow.GetWorkflows(bson.D{})
	if err != nil {
		logrus.WithError(err).Errorf("failed to get workflows for stat")
		utils.WriteHeaders(&w, http.StatusInternalServerError)
		return
	}
	runCount := 0
	for _, workFlowInput := range workflows {
		runCount += len(workFlowInput.WorkflowRuns)
	}

	overview := OverviewStat{
		UserCount:             len(users),
		ProjectCount:          len(projects),
		WorkflowRunCount:      runCount,
		WorkflowScheduleCount: len(workflows),
		AgentCount: AgentCount{
			Namespaced: len(agentNS),
			Total:      len(agents),
			Cluster:    len(agents) - len(agentNS),
		},
	}
	data, err := json.Marshal(overview)
	if err != nil {
		logrus.WithError(err).Errorf("failed to marshal stat")
		utils.WriteHeaders(&w, http.StatusInternalServerError)
		return
	}
	utils.WriteHeaders(&w, http.StatusOK)
	w.Write(data)
}
