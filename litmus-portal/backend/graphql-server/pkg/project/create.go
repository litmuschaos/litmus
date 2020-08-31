package project

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb/operations"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb/schema"
)

//CreateProjectWithUser ...
func CreateProjectWithUser(ctx context.Context, projectName string, user *dbSchema.User) (*model.Project, error) {

	uuid := uuid.New()
	newProject := &dbSchema.Project{
		ID:   uuid.String(),
		Name: projectName,
		Members: []*dbSchema.Member{
			{
				UserID:   user.ID,
				UserName: user.Username,
				Role:     dbSchema.RoleOwner,
			},
		},
		CreatedAt: time.Now().String(),
	}

	err := database.CreateProject(ctx, newProject)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	return newProject.GetOutputProject(), nil
}

//GetProject ...
func GetProject(ctx context.Context, projectID string) (*model.Project, error) {
	project, err := database.GetProject(ctx, projectID)
	if err != nil {
		return nil, err
	}
	return project.GetOutputProject(), nil
}

//GetProjectsByUserID ...
func GetProjectsByUserID(ctx context.Context, userID string) ([]*model.Project, error) {
	projects, err := database.GetProjectsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	outputProjects := []*model.Project{}
	for _, project := range projects {
		outputProjects = append(outputProjects, project.GetOutputProject())
	}
	return outputProjects, nil
}
