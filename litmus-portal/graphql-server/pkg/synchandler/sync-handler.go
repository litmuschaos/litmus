package synchandler

import (
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/gitops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/usermanagement"
)

const (
	timeInterval = 6 * time.Hour
)

//RecurringHubSync is used for syncing
func RecurringHubSync() {
	for {
		//Started Syncing of hubs
		users, _ := usermanagement.GetUsers(nil)
		for _, user := range users {
			for _, n := range user.MyHub {
				chartsInput := model.ChartsInput{
					HubName:    n.HubName,
					UserName:   user.Username,
					RepoURL:    n.RepoURL,
					RepoBranch: n.RepoBranch,
				}
				gitops.GitSyncHandlerForUser(chartsInput)
			}
		}
		//Syncing Completed
		time.Sleep(timeInterval)
	}
}
