package usermanagement

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	dbOperationsUserManagement "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/usermanagement"
	dbSchemaUserManagement "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/usermanagement"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/project"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	AcceptedInvitation = "Accepted"
	PendingInvitation  = "Pending"
)

// CreateUser checks if the user with the given username is already present in the database
// if not it creates a new user and puts in the DB
func CreateUser(ctx context.Context, user model.CreateUserInput) (*model.User, error) {

	outputUser, err := GetUser(ctx, user.Username)
	if err != nil && err != mongo.ErrNoDocuments {
		return nil, err
	} else if outputUser != nil {
		return outputUser, errors.New("user already exists")
	}

	newUser := &dbSchemaUserManagement.User{
		ID:          user.UserID,
		Username:    user.Username,
		Email:       user.Email,
		CompanyName: user.CompanyName,
		Name:        user.Name,
		CreatedAt:   time.Now().Format(time.RFC1123Z),
		Role:        &user.Role,
	}

	err = dbOperationsUserManagement.CreateUser(ctx, newUser)
	if err != nil {
		log.Print("Error in creating a new user:", err)
		return nil, err
	}

	outputUser = newUser.GetOutputUser()
	return outputUser, nil
}

// GetUser queries the user collection for a user with a given username,
// then queries the project collection for the projects of the user with the userID
// and finally return the user with its projects set properly
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

// GetUsers queries the list of all the users from the DB and returns it in the appropriate format
func GetUsers(ctx context.Context) ([]*model.User, error) {

	users, err := dbOperationsUserManagement.GetUsers(ctx, bson.D{})
	if err != nil {
		return nil, err
	}

	var outputUsers []*model.User
	for _, user := range users {
		outputUsers = append(outputUsers, user.GetOutputUser())
	}

	return outputUsers, nil
}

// UpdateUser updates the user details and returns a status
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
