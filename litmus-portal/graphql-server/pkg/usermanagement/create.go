package usermanagement

import (
	"context"
	"errors"
	"log"
	"os"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	dbOperationsUserManagement "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/usermanagement"
	dbSchemaUserManagement "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/usermanagement"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/project"
	selfDeployer "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/self-deployer"
)

// CreateUser ...
func CreateUser(ctx context.Context, user model.CreateUserInput, userID string, role string) (*model.User, error) {

	var (
		self_cluster = os.Getenv("SELF_CLUSTER")
	)
	outputUser, err := GetUser(ctx, user.Username)
	if err != nil && err != mongo.ErrNoDocuments {
		return nil, err
	} else if outputUser != nil {
		return outputUser, errors.New("User already exists")
	}

	newUser := &dbSchemaUserManagement.User{
		ID:          userID,
		Username:    user.Username,
		Email:       user.Email,
		CompanyName: user.CompanyName,
		Name:        user.Name,
		CreatedAt:   time.Now().Format(time.RFC1123Z),
	}

	err = dbOperationsUserManagement.InsertUser(ctx, newUser)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	project, err := project.CreateProjectWithUser(ctx, user.ProjectName, newUser)
	if err != nil {
		return nil, err
	}

	outputUser = newUser.GetOutputUser()
	outputUser.Projects = append(outputUser.Projects, project)

	if strings.ToLower(self_cluster) == "true" && strings.ToLower(role) == "admin" {
		log.Print("Starting self deployer")
		go selfDeployer.StartDeployer(project.ID)
	}

	return outputUser, nil
}

// GetUser ...
func GetUser(ctx context.Context, username string) (*model.User, error) {

	user, err := dbOperationsUserManagement.GetUserByUserName(ctx, username)
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

// GetUsers ...
func GetUsers(ctx context.Context) ([]*model.User, error) {

	users, err := dbOperationsUserManagement.GetUsers(ctx)
	if err != nil {
		return nil, err
	}

	var outputUsers []*model.User
	for _, user := range users {
		outputUsers = append(outputUsers, user.GetOutputUser())
	}

	return outputUsers, nil
}

// UpdateUser ...
func UpdateUser(ctx context.Context, user model.UpdateUserInput) (string, error) {

	dbUser := &dbSchemaUserManagement.User{
		ID:          user.ID,
		Email:       user.Email,
		CompanyName: user.CompanyName,
		Name:        user.Name,
		UpdatedAt:   time.Now().Format(time.RFC1123Z),
	}
	err := dbOperationsUserManagement.UpdateUser(ctx, dbUser)
	if err != nil {
		return "Updating user aborted", err
	}
	return "Update Successful", err
}
