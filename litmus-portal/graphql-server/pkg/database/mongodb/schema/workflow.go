package schema

type ChaosWorkFlowInput struct {
	WorkflowID          string             `bson:"workflow_id"`
	WorkflowManifest    string             `bson:"workflow_manifest"`
	CronSyntax          string             `bson:"cronSyntax"`
	WorkflowName        string             `bson:"workflow_name"`
	WorkflowDescription string             `bson:"workflow_description"`
	Weightages          []*WeightagesInput `bson:"weightages"`
	IsCustomWorkflow    bool               `bson:"isCustomWorkflow"`
	UpdatedAt           string             `bson:"updated_at"`
	CreatedAt           string             `bson:"created_at"`
	ProjectID           string             `bson:"project_id"`
	ClusterID           string             `bson:"cluster_id"`
	WorkflowRuns        []*WorkflowRun     `bson:"workflow_runs"`
	IsRemoved           bool               `bson:"isRemoved"`
}

type WorkflowRun struct {
	WorkflowRunID string `bson:"workflow_run_id"`
	LastUpdated   string `bson:"last_updated"`
	ExecutionData string `bson:"execution_data"`
	Completed     bool   `bson:"completed"`
}

type WeightagesInput struct {
	ExperimentName string `bson:"experiment_name"`
	Weightage      int    `bson:"weightage"`
}
