package usermanagement

import (
	"context"
	"log"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/project"
	"github.com/pborman/uuid"
)

//CreateUser ...
func CreateUser(ctx context.Context, user model.UserInput) (*model.User, error) {

	project, err := project.CreateProject(ctx, user.ProjectName)
	if err != nil {
		return nil, err
	}

	uuid := uuid.New()
	newUser := &model.User{
		ID:          uuid,
		Username:    user.Username,
		Email:       user.Email,
		CompanyName: user.CompanyName,
		ProjectID:   project.ID,
		Name:        user.Name,
		CreatedAt:   time.Now().String(),
	}

	err = database.InsertUser(ctx, newUser)
	if err != nil {
		log.Print("ERROR", err)
		return newUser, err
	}

	return newUser, nil
}

//GetUser ...
func GetUser(ctx context.Context, username string) (*model.User, error) {

	user, err := database.GetUserByUserName(ctx, username)
	return user, err
}
