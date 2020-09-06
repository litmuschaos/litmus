package usermanagement

import (
	"context"
	"log"
	"os"
	"strings"
	"time"

	self_deployer "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/self-deployer"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb/operations"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb/schema"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/project"
)

//CreateUser ...
func CreateUser(ctx context.Context, user model.UserInput) (*model.User, error) {
	uuid := uuid.New()
	newUser := &dbSchema.User{
		ID:          uuid.String(),
		Username:    user.Username,
		Email:       user.Email,
		CompanyName: user.CompanyName,
		Name:        user.Name,
		CreatedAt:   time.Now().String(),
	}

	err := database.InsertUser(ctx, newUser)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	project, err := project.CreateProjectWithUser(ctx, user.ProjectName, newUser)
	if err != nil {
		return nil, err
	}

	outputUser := newUser.GetOutputUser()
	outputUser.Projects = append(outputUser.Projects, project)

	active := os.Getenv("SELF_CLUSTER")
	if strings.ToLower(active) == "true" && strings.ToLower(outputUser.Username) == "admin" {
		go self_deployer.StartDeployer(project.ID)
	}

	return outputUser, nil
}

//GetUser ...
func GetUser(ctx context.Context, username string) (*model.User, error) {

	user, err := database.GetUserByUserName(ctx, username)
	if err != nil {
		return nil, err
	}
	outputUser := user.GetOutputUser()

	projects, err := project.GetProjectsByUserID(ctx, outputUser.ID)
	if err != nil {
		return nil, err
	}

	outputUser.Projects = projects
	return outputUser, nil
}
