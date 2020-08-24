package cluster

import (
	"errors"

	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
)

//VerifyCluster utils function used to verify cluster identity
func VerifyCluster(identity model.ClusterIdentity) (*database.Cluster, error) {
	cluster, err := database.GetCluster(identity.ClusterID)
	if err != nil {
		return nil, err
	}

	if !(cluster.AccessKey == identity.AccessKey && cluster.IsRegistered) {
		return nil, errors.New("ERROR:  CLUSTER ID MISMATCH")
	}
	return &cluster, nil
}
