package main

import (
	"encoding/json"
	"flag"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/types"
	"log"
	"os"

	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/gql"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/k8s"
)

var (
	clusterData = map[string]string{
		"KEY":        os.Getenv("KEY"),
		"CID":        os.Getenv("CID"),
		"GQL_SERVER": os.Getenv("GQL_SERVER"),
	}
	err    error
	newKey string
)

func init() {
	k8s.KubeConfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	flag.Parse()

	var isConfirmed bool
	isConfirmed, newKey, err = cluster.IsClusterConfirmed(clusterData)
	if err != nil {
		log.Fatal(err)
	}

	if isConfirmed == true {
		clusterData["KEY"] = newKey
	} else if isConfirmed == false {

		bodyText, err := gql.ClusterConfirm(clusterData)
		if err != nil {
			log.Fatal(err)
		}

		var responseInterface types.Payload
		err = json.Unmarshal(bodyText, &responseInterface)
		if err != nil {
			log.Fatal(err)
		}

		if responseInterface.Data.ClusterConfirm.IsClusterConfirmed == true {
			log.Println("cluster confirmed")
			clusterData["KEY"] = responseInterface.Data.ClusterConfirm.NewClusterKey
			cluster.ClusterRegister(clusterData)
		} else {
			log.Fatal("Cluster not confirmed")
		}
	}
}

func main() {
	sigCh := make(chan os.Signal)
	go gql.ClusterConnect(clusterData)
	<-sigCh
}
