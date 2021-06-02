package main

import (
	"encoding/json"
	"flag"
	"log"
	"os"
	"os/signal"
	"runtime"
	"strconv"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/cluster/events"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/gql"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/sirupsen/logrus"
)

var (
	clusterData = map[string]string{
		"ACCESS_KEY":           os.Getenv("ACCESS_KEY"),
		"CLUSTER_ID":           os.Getenv("CLUSTER_ID"),
		"SERVER_ADDR":          os.Getenv("SERVER_ADDR"),
		"IS_CLUSTER_CONFIRMED": os.Getenv("IS_CLUSTER_CONFIRMED"),
		"AGENT_SCOPE":          os.Getenv("AGENT_SCOPE"),
		"COMPONENTS":           os.Getenv("COMPONENTS"),
		"START_TIME":			os.Getenv("START_TIME"),
	}

	err error
)

func init() {
	log.Printf("Go Version: %s", runtime.Version())
	log.Printf("Go OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH)

	k8s.KubeConfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	flag.Parse()

	// check agent component status
	err := k8s.CheckComponentStatus(clusterData["COMPONENTS"])
	if err != nil {
		log.Fatal(err)
	}
	logrus.Info("all components live...starting up subscriber")

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
			clusterData["START_TIME"] = strconv.FormatInt(time.Now().Unix(), 10)
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

	//start workflow event watcher
	events.ChaosEventWatcher(stopCh, stream)

	//streams the event data to gql server
	go gql.SendWorkflowUpdates(clusterData, stream)

	// listen for cluster actions
	go gql.ClusterConnect(clusterData)

	signal.Notify(sigCh, os.Kill, os.Interrupt)
	<-sigCh
	close(stopCh)
	close(stream)
}
