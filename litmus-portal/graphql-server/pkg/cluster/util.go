package cluster

import (
	"errors"

	dbOperations "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/operations"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

//VerifyCluster utils function used to verify cluster identity
func VerifyCluster(identity model.ClusterIdentity) (*dbSchema.Cluster, error) {
	cluster, err := dbOperations.GetCluster(identity.ClusterID)
	if err != nil {
		return nil, err
	}

	if !(cluster.AccessKey == identity.AccessKey && cluster.IsRegistered) {
		return nil, errors.New("ERROR:  CLUSTER ID MISMATCH")
	}
	return &cluster, nil
}
