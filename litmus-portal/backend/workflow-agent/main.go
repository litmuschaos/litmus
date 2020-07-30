package main

import (
	"github.com/gdsoumya/workflow_manager/pkg/events"
	"github.com/gdsoumya/workflow_manager/pkg/gql"
	"github.com/gdsoumya/workflow_manager/pkg/types"
	"os"
	"os/signal"
)

func main() {
	server := os.Getenv("SERVER")
	cid := os.Getenv("CID")
	key := os.Getenv("KEY")
	stopCh := make(chan struct{})
	sigCh := make(chan os.Signal)
	stream := make(chan types.WorkflowEvent, 10)
	events.WorkflowEventWatcher(stopCh, stream)
	go gql.SendWorkflowUpdates(server, cid, key, stream)
	signal.Notify(sigCh, os.Kill, os.Interrupt)
	<-sigCh
	close(stopCh)
	close(stream)
}
