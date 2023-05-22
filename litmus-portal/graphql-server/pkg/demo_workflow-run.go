

package workflowrun

import "litmus-portal/graphql-server/pkg/chaos-workflow"

type WorkflowRunManager interface {
	RunWorkflow(workflowID string) error
	GetWorkflowRunStatus(runID string) (string, error)
	// Other methods...
}

type ChaosWorkflowRun struct {
	WorkflowRunManager
	// Other fields...
}

// Other struct definitions and implementations...
