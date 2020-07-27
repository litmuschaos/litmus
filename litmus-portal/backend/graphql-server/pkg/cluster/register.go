package cluster

import (
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/util"
)

//ClusterRegister creates an entry for a new cluster in DB and generates the url used to apply manifest
func ClusterRegister(input model.ClusterInput) (string, error) {
	cid := uuid.New()
	newCluster := model.Cluster{
		ClusterID:    cid.String(),
		ClusterName:  input.ClusterName,
		Description:  input.Description,
		ProjectID:    input.ProjectID,
		AccessKey:    util.RandomString(32),
		ClusterType:  input.ClusterType,
		PlatformName: input.PlatformName,
		CreatedAt:    strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:    strconv.FormatInt(time.Now().Unix(), 10),
	}
	err := database.InsertCluster(newCluster)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	log.Print("NEW CLUSTER REGISTERED : ID-", newCluster.ClusterID, " PID-", newCluster.ProjectID)
	token, err := ClusterCreateJWT(newCluster.ClusterID)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	return token, nil
}
