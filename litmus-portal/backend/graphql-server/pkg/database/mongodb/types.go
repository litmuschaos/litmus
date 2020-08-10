package database

type ChaosWorkFlowInput struct {
	WorkflowManifest    string             `bson:"workflow_manifest"`
	CronSyntax          string             `bson:"cronSyntax"`
	WorkflowName        string             `bson:"Workflow_name"`
	WorkflowDescription string             `bson:"Workflow_description"`
	Weightages          []*WeightagesInput `bson:"Weightages"`
	IsCustomWorkflow    bool               `bson:"isCustomWorkflow"`
	UpdatedAt           string             `json:"updated_at"`
	CreatedAt           string             `json:"created_at"`
}

type WeightagesInput struct {
	ExperimentName string `bson:"experiment_name"`
	Weightage      int    `bson:"weightage"`
}
