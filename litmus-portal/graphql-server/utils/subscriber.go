package utils

import (
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/types"

	"os"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
)

func SendRequestToSubscriber(subscriberRequest types.SubscriberRequests, r store.StateData) {
	if os.Getenv("AGENT_SCOPE") == "cluster" {
		/*
			namespace = Obtain from WorkflowManifest or
			from frontend as a separate workflowNamespace field under ChaosWorkFlowInput model
			for CreateChaosWorkflow mutation to be passed to this function.
		*/
	}
	newAction := &model.ClusterAction{
		ProjectID: subscriberRequest.ProjectID,
		Action: &model.ActionPayload{
			K8sManifest: subscriberRequest.K8sManifest,
			Namespace:   subscriberRequest.Namespace,
			RequestType: subscriberRequest.RequestType,
		},
	}

	r.Mutex.Lock()

	if observer, ok := r.ConnectedCluster[subscriberRequest.ClusterID]; ok {
		observer <- newAction
	}

	r.Mutex.Unlock()
}
