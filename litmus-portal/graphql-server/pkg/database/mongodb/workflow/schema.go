package workflow

type ChaosWorkflowType string

const (
	Workflow    ChaosWorkflowType = "workflow"
	ChaosEngine ChaosWorkflowType = "chaosengine"
)

// ChaosWorkFlowInput contains the required fields to be stored in the database for a chaos workflow input
type ChaosWorkFlowInput struct {
	WorkflowID          string              `bson:"workflow_id"`
	WorkflowManifest    string              `bson:"workflow_manifest"`
	CronSyntax          string              `bson:"cronSyntax"`
	WorkflowName        string              `bson:"workflow_name"`
	WorkflowDescription string              `bson:"workflow_description"`
	Weightages          []*WeightagesInput  `bson:"weightages"`
	Type                ChaosWorkflowType   `bson:"type"`
	IsCustomWorkflow    bool                `bson:"isCustomWorkflow"`
	UpdatedAt           string              `bson:"updated_at"`
	CreatedAt           string              `bson:"created_at"`
	ProjectID           string              `bson:"project_id"`
	ClusterID           string              `bson:"cluster_id"`
	WorkflowRuns        []*ChaosWorkflowRun `bson:"workflow_runs"`
	IsRemoved           bool                `bson:"isRemoved"`
}

// ChaosWorkflowRun contains the required fields to be stored in the database for a workflow run
type ChaosWorkflowRun struct {
	WorkflowRunID string `bson:"workflow_run_id"`
	LastUpdated   string `bson:"last_updated"`
	ExecutionData string `bson:"execution_data"`
	Completed     bool   `bson:"completed"`
}

// WeightagesInput contains the required fields to be stored in the database for a weightages input
type WeightagesInput struct {
	ExperimentName string `bson:"experiment_name"`
	Weightage      int    `bson:"weightage"`
}
