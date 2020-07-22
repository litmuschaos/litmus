package cluster

import (
	"errors"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
)

func VerifyCluster(identity model.ClusterIdentity) (*model.Cluster, error) {
	cluster, err := database.GetCluster(identity.ClusterID)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}
	if !(len(cluster) == 1 && cluster[0].AccessKey == identity.AccessKey && cluster[0].IsRegistered) {
		log.Print(len(cluster) == 1, cluster[0].AccessKey == identity.AccessKey, cluster[0].IsRegistered)
		return nil, errors.New("ERROR:  CLUSTER ID MISMATCH")
	}
	return &cluster[0], nil
}
