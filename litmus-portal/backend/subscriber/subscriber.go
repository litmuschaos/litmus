package main

import (
	"encoding/json"
	"flag"
	"os/signal"

	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/cluster/events"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/cluster/operations"

	"log"
	"os"

	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/types"

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
	isConfirmed, newKey, err = operations.IsClusterConfirmed(clusterData)
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
			operations.ClusterRegister(clusterData)
		} else {
			log.Fatal("Cluster not confirmed")
		}
	}
}

func main() {
	stopCh := make(chan struct{})
	sigCh := make(chan os.Signal)
	stream := make(chan types.WorkflowEvent, 10)

	//start workflow event watcher
	events.WorkflowEventWatcher(stopCh, stream)

	//streams the event data to gql server
	go gql.SendWorkflowUpdates(clusterData, stream)

	// listen for cluster actions
	go gql.ClusterConnect(clusterData)

	signal.Notify(sigCh, os.Kill, os.Interrupt)
	<-sigCh
	close(stopCh)
	close(stream)
}
