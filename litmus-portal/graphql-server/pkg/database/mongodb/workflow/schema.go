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
	WorkflowType        ChaosWorkflowType   `bson:"type"`
	IsCustomWorkflow    bool                `bson:"isCustomWorkflow"`
	UpdatedAt           string              `bson:"updated_at"`
	CreatedAt           string              `bson:"created_at"`
	ProjectID           string              `bson:"project_id"`
	ClusterID           string              `bson:"cluster_id"`
	ClusterName         string              `bson:"cluster_name"`
	ClusterType         string              `bson:"cluster_type"`
	WorkflowRuns        []*ChaosWorkflowRun `bson:"workflow_runs"`
	IsRemoved           bool                `bson:"isRemoved"`
}

// WeightagesInput contains the required fields to be stored in the database for a weightages input
type WeightagesInput struct {
	ExperimentName string `bson:"experiment_name"`
	Weightage      int    `bson:"weightage"`
}

// ChaosWorkflowRun contains the required fields to be stored in the database for a workflow run
type ChaosWorkflowRun struct {
	WorkflowRunID      string   `bson:"workflow_run_id"`
	LastUpdated        string   `bson:"last_updated"`
	Phase              string   `bson:"phase"`
	ResiliencyScore    *float64 `bson:"resiliency_score,string,omitempty"`
	ExperimentsPassed  *int     `bson:"experiments_passed,string,omitempty"`
	ExperimentsFailed  *int     `bson:"experiments_failed,string,omitempty"`
	ExperimentsAwaited *int     `bson:"experiments_awaited,string,omitempty"`
	ExperimentsStopped *int     `bson:"experiments_stopped,string,omitempty"`
	ExperimentsNA      *int     `bson:"experiments_na,string,omitempty"`
	TotalExperiments   *int     `bson:"total_experiments,string,omitempty"`
	ExecutionData      string   `bson:"execution_data"`
	Completed          bool     `bson:"completed"`
	IsRemoved          *bool    `bson:"isRemoved"`
}

type AggregatedWorkflowRuns struct {
	TotalFilteredWorkflowRuns []TotalFilteredData    `bson:"total_filtered_workflow_runs"`
	FlattenedWorkflowRuns     []FlattenedWorkflowRun `bson:"flattened_workflow_runs"`
}

type TotalFilteredData struct {
	Count int `bson:"count"`
}

type FlattenedWorkflowRun struct {
	WorkflowID       string             `bson:"workflow_id"`
	CronSyntax       string             `bson:"cronSyntax"`
	WorkflowName     string             `bson:"workflow_name"`
	Weightages       []*WeightagesInput `bson:"weightages"`
	IsCustomWorkflow bool               `bson:"isCustomWorkflow"`
	UpdatedAt        string             `bson:"updated_at"`
	CreatedAt        string             `bson:"created_at"`
	ProjectID        string             `bson:"project_id"`
	ClusterID        string             `bson:"cluster_id"`
	ClusterName      string             `bson:"cluster_name"`
	ClusterType      string             `bson:"cluster_type"`
	WorkflowRuns     ChaosWorkflowRun   `bson:"workflow_runs"`
	IsRemoved        bool               `bson:"isRemoved"`
}

type AggregatedWorkflows struct {
	TotalFilteredWorkflows []TotalFilteredData  `bson:"total_filtered_workflows"`
	ScheduledWorkflows     []ChaosWorkFlowInput `bson:"scheduled_workflows"`
}
