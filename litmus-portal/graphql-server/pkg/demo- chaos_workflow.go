
package workflow

type WorkflowClient interface {
	CreateWorkflow() error
	GetWorkflowByID(id string) (*Workflow, error)
	// Other methods...
}

type ExperimentClient interface {
	CreateExperiment() error
	GetExperimentByID(id string) (*Experiment, error)
	// Other methods...
}

type WorkflowTemplateClient interface {
	CreateTemplate() error
	GetTemplateByID(id string) (*WorkflowTemplate, error)
	// Other methods...
}

type ChaosWorkflow struct {
	WorkflowClient
	ExperimentClient
	WorkflowTemplateClient
	// Other fields...
}

// Other struct definitions and implementations...
