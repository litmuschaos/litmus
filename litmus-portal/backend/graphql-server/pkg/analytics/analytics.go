package analytics

import (
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/analytics/github"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/analytics/google"
	"strconv"
)

func StartHandlers(){
	go github.Handler()
	go google.Handler()
}

func GetTotalOperatorInstalled() string{
	return google.GAResponseJSONObject["operator-installs"]
}

func GetTotalExperimentRun() string{
	return google.GAResponseJSONObject["total-count"]
}

func GetTotalExperiments() string{
	return strconv.Itoa(github.Github.ExperimentCount)
}

func GetTotalStars() string{
	return strconv.Itoa(github.Github.Stars)
}