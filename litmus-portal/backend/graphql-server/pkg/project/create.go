package project

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
)

//CreateProject ...
func CreateProject(ctx context.Context, projectName string) (*model.Project, error) {

	uuid := uuid.New()
	newProject := &model.Project{
		ID:        uuid.String(),
		Name:      projectName,
		CreatedAt: time.Now().String(),
	}

	err := database.CreateProject(ctx, newProject)
	if err != nil {
		log.Print("ERROR", err)
		return newProject, err
	}

	return newProject, nil
}

//GetProject ...
func GetProject(ctx context.Context, projectID string) (*model.Project, error) {
	project, err := database.GetProject(ctx, projectID)
	return project, err
}
