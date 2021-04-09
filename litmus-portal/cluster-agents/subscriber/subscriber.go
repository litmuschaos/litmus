package main

import (
	"encoding/json"
	"flag"
	"os/signal"
	"runtime"

	"log"
	"os"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/cluster/events"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/gql"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
)

var (
	clusterData = map[string]string{
		"ACCESS_KEY":           os.Getenv("ACCESS_KEY"),
		"CLUSTER_ID":           os.Getenv("CLUSTER_ID"),
		"SERVER_ADDR":          os.Getenv("SERVER_ADDR"),
		"IS_CLUSTER_CONFIRMED": os.Getenv("IS_CLUSTER_CONFIRMED"),
		"AGENT_SCOPE":          os.Getenv("AGENT_SCOPE"),
	}

	err error
)

func init() {
	log.Printf("Go Version: %s", runtime.Version())
	log.Printf("Go OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH)

	k8s.KubeConfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	flag.Parse()

	isConfirmed, newKey, err := k8s.IsClusterConfirmed()
	if err != nil {
		log.Fatal(err)
	}

	if isConfirmed == true {
		clusterData["ACCESS_KEY"] = newKey
	} else if isConfirmed == false {
		clusterConfirmByte, err := gql.ClusterConfirm(clusterData)
		if err != nil {
			log.Fatal(err)
		}

		var clusterConfirmInterface types.Payload
		err = json.Unmarshal(clusterConfirmByte, &clusterConfirmInterface)
		if err != nil {
			log.Fatal(err)
		}

		if clusterConfirmInterface.Data.ClusterConfirm.IsClusterConfirmed == true {
			clusterData["ACCESS_KEY"] = clusterConfirmInterface.Data.ClusterConfirm.NewAccessKey
			clusterData["IS_CLUSTER_CONFIRMED"] = "true"
			_, err = k8s.ClusterRegister(clusterData)
			if err != nil {
				log.Fatal(err)
			}
			log.Println(clusterData["CLUSTER_ID"] + " has been confirmed")
		} else {
			log.Fatal(clusterData["CLUSTER_ID"] + " hasn't been confirmed")
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
