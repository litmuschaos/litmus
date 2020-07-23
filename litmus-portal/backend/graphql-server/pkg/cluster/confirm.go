package cluster

import (
	"errors"
	"log"
	"strconv"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/util"
)

func ConfirmClusterRegistration(identity model.ClusterIdentity, r store.StateData) (string, error) {
	cluster, err := database.GetCluster(identity.ClusterID)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	if len(cluster) == 1 && cluster[0].AccessKey == identity.AccessKey {
		newKey := util.RandomString(32)
		time := strconv.FormatInt(time.Now().Unix(), 10)
		err = database.UpdateCluster(identity.ClusterID, newKey, true, time)
		cluster[0].IsRegistered = true
		cluster[0].AccessKey = ""
		if err != nil {
			log.Print("ERROR", err)
			return "", err
		}
		log.Print("CLUSTER Confirmed : ID-", cluster[0].ClusterID, " PID-", cluster[0].ProjectID)
		SendClusterEvent("cluster-registration", "New Cluster", "New Cluster registration", cluster[0], r)
		return newKey, nil
	}
	return "", errors.New("error finding cluster")
}
