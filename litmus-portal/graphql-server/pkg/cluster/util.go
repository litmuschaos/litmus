package cluster

import (
	"errors"
	"fmt"
	"os"

	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

// VerifyCluster utils function used to verify cluster identity
func VerifyCluster(identity model.ClusterIdentity) (*dbSchemaCluster.Cluster, error) {
	currentVersion := os.Getenv("VERSION")
	if currentVersion != identity.Version {
		return nil, fmt.Errorf("ERROR: CLUSTER VERSION MISMATCH (need %v got %v)", currentVersion, identity.Version)
	}
	cluster, err := dbOperationsCluster.GetCluster(identity.ClusterID)
	if err != nil {
		return nil, err
	}

	if !(cluster.AccessKey == identity.AccessKey && cluster.IsRegistered) {
		return nil, errors.New("ERROR:  CLUSTER ID MISMATCH")
	}
	return &cluster, nil
}
