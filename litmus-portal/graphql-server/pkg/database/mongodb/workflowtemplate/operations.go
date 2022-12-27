package workflowtemplate

import (
	"context"
	"errors"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
)

// CreateWorkflowTemplate add the template details in the database
func CreateWorkflowTemplate(ctx context.Context, template *WorkflowTemplate) error {
	err := mongodb.Operator.Create(ctx, mongodb.WorkflowTemplateCollection, template)
	if err != nil {
		log.Print("Error while creating template: ", err)
	}
	return nil
}

// GetTemplatesByProjectID is used to query the list of templates present in the project
func GetTemplatesByProjectID(ctx context.Context, projectID string) ([]WorkflowTemplate, error) {
	query := bson.D{{"project_id", projectID}, {"is_removed", false}}
	results, err := mongodb.Operator.List(ctx, mongodb.WorkflowTemplateCollection, query)
	if err != nil {
		log.Print("Error getting template: ", err)
	}
	var templates []WorkflowTemplate
	err = results.All(ctx, &templates)

	if err != nil {
		log.Println(err)
		return []WorkflowTemplate{}, err
	}
	return templates, nil
}

// GetTemplateByTemplateID is used to query a selected template using template id
func GetTemplateByTemplateID(ctx context.Context, templateID string) (WorkflowTemplate, error) {
	var template WorkflowTemplate
	result, err := mongodb.Operator.Get(ctx, mongodb.WorkflowTemplateCollection, bson.D{{"template_id", templateID}})
	err = result.Decode(&template)
	if err != nil {
		return WorkflowTemplate{}, err
	}
	return template, err
}

// UpdateTemplateManifest is used to update the template details
func UpdateTemplateManifest(ctx context.Context, query bson.D, update bson.D) error {
	updateResult, err := mongodb.Operator.Update(ctx, mongodb.WorkflowTemplateCollection, query, update)
	if err != nil {
		return err
	}
	if updateResult.MatchedCount == 0 {
		return errors.New("Template collection query didn't match")
	}
	return nil
}
