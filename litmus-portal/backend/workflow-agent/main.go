package main

import (
	"os"
	"os/signal"

	"github.com/litmuschaos/litmus/litmus-portal/backend/workflow-agent/pkg/cluster/events"
	"github.com/litmuschaos/litmus/litmus-portal/backend/workflow-agent/pkg/gql"
	"github.com/litmuschaos/litmus/litmus-portal/backend/workflow-agent/pkg/types"
)

func main() {
	//Gql Server and Cluster ID
	server := os.Getenv("SERVER")
	cid := os.Getenv("CID")
	key := os.Getenv("KEY")

	stopCh := make(chan struct{})
	sigCh := make(chan os.Signal)
	stream := make(chan types.WorkflowEvent, 10)

	//start workflow event watcher
	events.WorkflowEventWatcher(stopCh, stream)

	//streams the event data to gql server
	go gql.SendWorkflowUpdates(server, cid, key, stream)

	// listen for cluster actions
	go gql.Subscription(server, cid, key)

	signal.Notify(sigCh, os.Kill, os.Interrupt)
	<-sigCh
	close(stopCh)
	close(stream)
}
