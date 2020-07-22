package cluster

import (
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
)

func GetProjectClusters(pid string) ([]*model.Cluster, error) {
	clusters, err := database.GetClusters(pid)
	if err != nil {
		log.Print("ERROR", err)
		return []*model.Cluster{}, err
	}
	resp := []*model.Cluster{}
	for i := 0; i < len(clusters); i++ {
		resp = append(resp, &clusters[i])
	}
	return resp, nil
}
