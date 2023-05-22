package workflowtemplate

import (
	"context"
	"errors"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
)

// Operator is the model for cluster collection
type Operator struct {
	operator mongodb.MongoOperator
}

// NewWorkflowTemplateOperator returns a new instance of Operator
func NewWorkflowTemplateOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

// CreateWorkflowTemplate add the template details in the database
func (w *Operator) CreateWorkflowTemplate(ctx context.Context, template *WorkflowTemplate) error {
	err := w.operator.Create(ctx, mongodb.WorkflowTemplateCollection, template)
	if err != nil {
		return err
	}
	return nil
}

// GetTemplatesByProjectID is used to query the list of templates present in the project
func (w *Operator) GetTemplatesByProjectID(ctx context.Context, projectID string) ([]WorkflowTemplate, error) {
	query := bson.D{{"project_id", projectID}, {"is_removed", false}}
	results, err := w.operator.List(ctx, mongodb.WorkflowTemplateCollection, query)
	if err != nil {
		return []WorkflowTemplate{}, err
	}
	var templates []WorkflowTemplate
	err = results.All(ctx, &templates)

	if err != nil {
		return []WorkflowTemplate{}, err
	}
	return templates, nil
}

// GetTemplateByTemplateID is used to query a selected template using template id
func (w *Operator) GetTemplateByTemplateID(ctx context.Context, templateID string) (WorkflowTemplate, error) {
	var template WorkflowTemplate
	result, err := w.operator.Get(ctx, mongodb.WorkflowTemplateCollection, bson.D{{"template_id", templateID}})
	err = result.Decode(&template)
	if err != nil {
		return WorkflowTemplate{}, err
	}
	return template, err
}

// UpdateTemplateManifest is used to update the template details
func (w *Operator) UpdateTemplateManifest(ctx context.Context, query bson.D, update bson.D) error {
	updateResult, err := w.operator.Update(ctx, mongodb.WorkflowTemplateCollection, query, update)
	if err != nil {
		return err
	}
	if updateResult.MatchedCount == 0 {
		return errors.New("Template collection query didn't match")
	}
	return nil
}
