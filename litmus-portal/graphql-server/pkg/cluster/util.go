package cluster

import (
	"errors"
	"fmt"
	"os"
	"strings"

	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

const (
	// CIVersion specifies the version tag used for ci builds
	CIVersion = "ci"
)

// VerifyCluster utils function used to verify cluster identity
func VerifyCluster(identity model.ClusterIdentity) (*dbSchemaCluster.Cluster, error) {
	currentVersion := os.Getenv("VERSION")
	if strings.Contains(strings.ToLower(currentVersion), CIVersion) {
		if currentVersion != identity.Version {
			return nil, fmt.Errorf("ERROR: CLUSTER VERSION MISMATCH (need %v got %v)", currentVersion, identity.Version)
		}
	} else {
		splitCPVersion := strings.Split(currentVersion, ".")
		splitSubVersion := strings.Split(identity.Version, ".")
		if len(splitSubVersion) != 3 || splitSubVersion[0] != splitCPVersion[0] || splitSubVersion[1] != splitCPVersion[1] {
			return nil, fmt.Errorf("ERROR: CLUSTER VERSION MISMATCH (need %v.%v.x got %v)", splitCPVersion[0], splitCPVersion[1], identity.Version)
		}
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
