package events

import (
	"subscriber/pkg/graphql"
	"subscriber/pkg/types"

	"subscriber/pkg/k8s"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	v1alpha13 "github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	v1alpha12 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
)

type SubscriberEvents interface {
	ChaosEventWatcher(stopCh chan struct{}, stream chan types.WorkflowEvent, infraData map[string]string)
	StopChaosEngineState(namespace string, workflowRunID *string) error
	CheckChaosData(nodeStatus v1alpha13.NodeStatus, workflowNS string, chaosClient *v1alpha12.LitmuschaosV1alpha1Client) (string, *types.ChaosData, error)
	GetWorkflowObj(uid string) (*v1alpha1.Workflow, error)
	ListWorkflowObject(wfid string) (*v1alpha1.WorkflowList, error)
	GenerateWorkflowPayload(cid, accessKey, version, completed string, wfEvent types.WorkflowEvent) ([]byte, error)
	WorkflowEventWatcher(stopCh chan struct{}, stream chan types.WorkflowEvent, infraData map[string]string)
	WorkflowEventHandler(workflowObj *v1alpha1.Workflow, eventType string, startTime int64) (types.WorkflowEvent, error)
	SendWorkflowUpdates(infraData map[string]string, event types.WorkflowEvent) (string, error)
	WorkflowUpdates(infraData map[string]string, event chan types.WorkflowEvent)
	StopWorkflow(wfName string, namespace string) error
}

type subscriberEvents struct {
	gqlSubscriberServer graphql.SubscriberGql
	subscriberK8s       k8s.SubscriberK8s
}

func NewSubscriberEventsOperator(gqlSubscriberServer graphql.SubscriberGql, subscriberK8s k8s.SubscriberK8s) SubscriberEvents {
	return &subscriberEvents{
		gqlSubscriberServer: gqlSubscriberServer,
		subscriberK8s:       subscriberK8s,
	}
}
