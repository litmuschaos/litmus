package cluster

import (
	"errors"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
)

//NewEvent takes a event from a subscriber, validates identity and broadcasts the event to the users
func NewEvent(clusterEvent model.ClusterEventInput, r store.StateData) (string, error) {
	cluster, err := database.GetCluster(clusterEvent.ClusterID)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}

	if len(cluster) == 1 && cluster[0].AccessKey == clusterEvent.AccessKey && cluster[0].IsRegistered {
		log.Print("CLUSTER EVENT : ID-", cluster[0].ClusterID, " PID-", cluster[0].ProjectID)
		SendClusterEvent("cluster-event", clusterEvent.EventName, clusterEvent.Description, cluster[0], r)
		return "Event Published", nil
	}
	return "", errors.New("ERROR WITH CLUSTER EVENT")
}
