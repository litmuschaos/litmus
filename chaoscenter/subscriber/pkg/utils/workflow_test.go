package utils

import (
	"errors"
	"reflect"
	"testing"

	"subscriber/pkg/events"
	"subscriber/pkg/k8s"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/rest"
)

// fakeEvents records the calls WorkflowRequest makes. Methods it doesn't
// override panic through the nil embedded interface if called.
type fakeEvents struct {
	events.SubscriberEvents
	workflow    *v1alpha1.Workflow
	workflowErr error
	list        *v1alpha1.WorkflowList
	calls       []string
}

func (f *fakeEvents) GetWorkflowObj(uid string) (*v1alpha1.Workflow, error) {
	f.calls = append(f.calls, "GetWorkflowObj "+uid)
	return f.workflow, f.workflowErr
}

func (f *fakeEvents) ListWorkflowObject(wfid string) (*v1alpha1.WorkflowList, error) {
	f.calls = append(f.calls, "ListWorkflowObject "+wfid)
	return f.list, nil
}

func (f *fakeEvents) StopChaosEngineState(namespace string, workflowRunID *string) error {
	f.calls = append(f.calls, "StopChaosEngineState ns="+namespace+" run="+*workflowRunID)
	return nil
}

func (f *fakeEvents) StopWorkflow(wfName string, namespace string) error {
	f.calls = append(f.calls, "StopWorkflow "+namespace+"/"+wfName)
	return nil
}

// fakeK8s fails GetKubeConfig so DeleteWorkflow returns without a cluster.
type fakeK8s struct{ k8s.SubscriberK8s }

func (fakeK8s) GetKubeConfig() (*rest.Config, error) {
	return nil, errors.New("no cluster in unit tests")
}

var agentData = map[string]string{"INFRA_NAMESPACE": "litmus"}

func assertCalls(t *testing.T, ev *fakeEvents, want ...string) {
	t.Helper()
	if !reflect.DeepEqual(ev.calls, want) {
		t.Fatalf("calls:\n got  %q\n want %q", ev.calls, want)
	}
}

func TestWorkflowRequest_DeleteStopsEnginesInInfraNamespace(t *testing.T) {
	wf := v1alpha1.Workflow{ObjectMeta: metav1.ObjectMeta{Name: "wf-1", Namespace: "litmus", UID: types.UID("uid-1")}}
	ev := &fakeEvents{list: &v1alpha1.WorkflowList{Items: []v1alpha1.Workflow{wf}}}

	if err := NewSubscriberUtils(ev, fakeK8s{}).WorkflowRequest(agentData, "workflow_delete", "exp-1", ""); err != nil {
		t.Fatalf("workflow_delete: %v", err)
	}
	assertCalls(t, ev, "ListWorkflowObject exp-1", "StopChaosEngineState ns=litmus run=uid-1")
}

func TestWorkflowRequest_RunDeleteWhenWorkflowIsGone(t *testing.T) {
	ev := &fakeEvents{}

	if err := NewSubscriberUtils(ev, fakeK8s{}).WorkflowRequest(agentData, "workflow_run_delete", "run-1", ""); err != nil {
		t.Fatalf("deleting a run whose workflow is gone should be a no-op, got %v", err)
	}
	assertCalls(t, ev, "GetWorkflowObj run-1")
}

func TestWorkflowRequest_RunStopWhenWorkflowIsGone(t *testing.T) {
	ev := &fakeEvents{}

	if err := NewSubscriberUtils(ev, fakeK8s{}).WorkflowRequest(agentData, "workflow_run_stop", "run-1", ""); err != nil {
		t.Fatalf("stopping a run whose workflow is gone should succeed, got %v", err)
	}
	// The run's ChaosEngines are still stopped; there is no workflow to stop.
	assertCalls(t, ev, "GetWorkflowObj run-1", "StopChaosEngineState ns=litmus run=run-1")
}

func TestWorkflowRequest_RunStopStopsEnginesAndWorkflow(t *testing.T) {
	ev := &fakeEvents{workflow: &v1alpha1.Workflow{ObjectMeta: metav1.ObjectMeta{Name: "wf-1", Namespace: "litmus"}}}

	if err := NewSubscriberUtils(ev, fakeK8s{}).WorkflowRequest(agentData, "workflow_run_stop", "run-1", ""); err != nil {
		t.Fatalf("workflow_run_stop: %v", err)
	}
	assertCalls(t, ev, "GetWorkflowObj run-1", "StopChaosEngineState ns=litmus run=run-1", "StopWorkflow litmus/wf-1")
}

func TestWorkflowRequest_WorkflowLookupErrorIsReturned(t *testing.T) {
	ev := &fakeEvents{workflowErr: errors.New("list failed")}

	if err := NewSubscriberUtils(ev, fakeK8s{}).WorkflowRequest(agentData, "workflow_run_stop", "run-1", ""); err == nil {
		t.Fatal("expected the lookup error to be returned")
	}
	assertCalls(t, ev, "GetWorkflowObj run-1")
}
