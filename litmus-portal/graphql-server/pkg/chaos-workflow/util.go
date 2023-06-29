package chaos_workflow

import (
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	clusterOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/tidwall/gjson"
)

// SendWorkflowToSubscriber sends the workflow to the subscriber to be handled
func SendWorkflowToSubscriber(workflow *model.ChaosWorkFlowRequest, username *string, externalData *string, reqType string, r *store.StateData) {
	workflowNamespace := gjson.Get(workflow.WorkflowManifest, "metadata.namespace").String()

	if workflowNamespace == "" {
		workflowNamespace = utils.Config.AgentNamespace
	}
	clusterOps.SendRequestToSubscriber(clusterOps.SubscriberRequests{
		K8sManifest:  workflow.WorkflowManifest,
		RequestType:  reqType,
		ProjectID:    workflow.ProjectID,
		ClusterID:    workflow.ClusterID,
		Namespace:    workflowNamespace,
		ExternalData: externalData,
		Username:     username,
	}, *r)
}
