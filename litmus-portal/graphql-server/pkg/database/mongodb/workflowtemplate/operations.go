package workflowtemplate

import (
	"context"
	"errors"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var workflowtemplateCollection *mongo.Collection

func init() {
	workflowtemplateCollection = mongodb.Database.Collection("workflow-template")
}

// CreateWorkflowTemplate add the template details in the database
func CreateWorkflowTemplate(ctx context.Context, template *ManifestTemplate) error {
	_, err := workflowtemplateCollection.InsertOne(ctx, template)
	if err != nil {
		log.Print("Error while creating template: ", err)
	}
	return nil
}

// GetTemplatesByProjectID is used to query the list of templates present in the project
func GetTemplatesByProjectID(ctx context.Context, projectID string) ([]ManifestTemplate, error) {
	query := bson.M{"project_id": projectID, "is_removed": false}
	cursor, err := workflowtemplateCollection.Find(ctx, query)
	if err != nil {
		log.Print("Error getting template: ", err)
	}
	var templates []ManifestTemplate
	err = cursor.All(ctx, &templates)

	if err != nil {
		log.Println(err)
		return []ManifestTemplate{}, err
	}
	return templates, nil
}

// GetTemplateByTemplateID is used to query a selected template using template id
func GetTemplateByTemplateID(ctx context.Context, templateID string) (ManifestTemplate, error) {
	var template ManifestTemplate
	err := workflowtemplateCollection.FindOne(ctx, bson.M{"template_id": templateID}).Decode(&template)
	if err != nil {
		return ManifestTemplate{}, err
	}
	return template, err
}

// UpdateTemplateManifest is used to update the template details
func UpdateTemplateManifest(ctx context.Context, query bson.D, update bson.D) error {
	updateResult, err := workflowtemplateCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}
	if updateResult.MatchedCount == 0 {
		return errors.New("Template collection query didn't match")
	}
	return nil
}
