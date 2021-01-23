package usermanagement

import (
	"context"
	"errors"
	"log"
	"os"
	"strings"
	"time"

	self_deployer "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/self-deployer"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/operations"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/project"
)

//CreateUser ...
func CreateUser(ctx context.Context, user model.CreateUserInput) (*model.User, error) {

	var (
		uuid         = uuid.New()
		self_cluster = os.Getenv("SELF_CLUSTER")
	)
	outputUser, err := GetUser(ctx, user.Username)
	if err != nil && err != mongo.ErrNoDocuments {
		return nil, err
	} else if outputUser != nil {
		return outputUser, errors.New("User already exists")
	}

	newUser := &dbSchema.User{
		ID:          uuid.String(),
		Username:    user.Username,
		Email:       user.Email,
		CompanyName: user.CompanyName,
		Name:        user.Name,
		CreatedAt:   time.Now().Format(time.RFC1123Z),
	}

	err = database.InsertUser(ctx, newUser)
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

	if strings.ToLower(self_cluster) == "true" && strings.ToLower(outputUser.Username) == "admin" {
		log.Print("Starting self deployer")
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

//GetUsers ...
func GetUsers(ctx context.Context) ([]*model.User, error) {

	users, err := database.GetUsers(ctx)
	if err != nil {
		return nil, err
	}

	var outputUsers []*model.User
	for _, user := range users {
		outputUsers = append(outputUsers, user.GetOutputUser())
	}

	return outputUsers, nil
}

//UpdateUser ...
func UpdateUser(ctx context.Context, user model.UpdateUserInput) (string, error) {

	dbUser := &dbSchema.User{
		ID:          user.ID,
		Email:       user.Email,
		CompanyName: user.CompanyName,
		Name:        user.Name,
		UpdatedAt:   time.Now().Format(time.RFC1123Z),
	}
	err := database.UpdateUser(ctx, dbUser)
	if err != nil {
		return "Updating user aborted", err
	}
	return "Update Successful", err
}
