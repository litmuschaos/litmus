package project

import (
	"context"
	"errors"
	"log"
	"os"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/google/uuid"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	dbOperationsProject "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/project"
	dbSchemaProject "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/project"
	dbOperationsUserManagement "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/usermanagement"
	selfDeployer "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/self-deployer"
)

// CreateProjectWithUser creates a project for the user
func CreateProjectWithUser(ctx context.Context, projectName string, userID string) (*model.Project, error) {

	var (
		selfCluster = os.Getenv("SELF_CLUSTER")
	)
	user, err := dbOperationsUserManagement.GetUserByUserID(ctx, userID)
	if err != nil {
		log.Print("Error in fetching the user", err)
		return nil, err
	}

	uuid := uuid.New()
	newProject := &dbSchemaProject.Project{
		ID:   uuid.String(),
		Name: projectName,
		Members: []*dbSchemaProject.Member{
			{
				UserID:     user.ID,
				UserName:   user.Username,
				Name:       *user.Name,
				Email:      *user.Email,
				Role:       model.MemberRoleOwner,
				Invitation: dbSchemaProject.AcceptedInvitation,
				JoinedAt:   time.Now().Format(time.RFC1123Z),
			},
		},
		CreatedAt: time.Now().String(),
	}

	err = dbOperationsProject.CreateProject(ctx, newProject)
	if err != nil {
		log.Print("Error in creating the project", err)
		return nil, err
	}

	defaultHub := model.CreateMyHub{
		HubName:    "Chaos Hub",
		RepoURL:    "https://github.com/litmuschaos/chaos-charts",
		RepoBranch: "master",
	}

	log.Print("Cloning https://github.com/litmuschaos/chaos-charts")
	go myhub.AddMyHub(context.Background(), defaultHub, newProject.ID)

	if strings.ToLower(selfCluster) == "true" && strings.ToLower(*user.Role) == "admin" {
		log.Print("Starting self deployer")
		go selfDeployer.StartDeployer(newProject.ID)
	}

	return newProject.GetOutputProject(), nil
}

// GetProject queries the project with a given projectID from the database
func GetProject(ctx context.Context, projectID string) (*model.Project, error) {

	project, err := dbOperationsProject.GetProject(ctx, bson.D{{"_id", projectID}})
	if err != nil {
		return nil, err
	}
	return project.GetOutputProject(), nil
}

// GetProjectsByUserID queries the project with a given userID from the database and returns it in the appropriate format
func GetProjectsByUserID(ctx context.Context, userID string) ([]*model.Project, error) {

	projects, err := dbOperationsProject.GetProjectsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var outputProjects []*model.Project
	for _, project := range projects {
		outputProjects = append(outputProjects, project.GetOutputProject())
	}
	return outputProjects, nil
}

// SendInvitation send an invitation to a new user and
// returns an error if the member is already part of the project
func SendInvitation(ctx context.Context, member model.MemberInput) (*model.Member, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return nil, err
	}

	if invitation == dbSchemaProject.AcceptedInvitation {
		return nil, errors.New("this user is already a member of this project")
	} else if invitation == dbSchemaProject.PendingInvitation || invitation == dbSchemaProject.DeclinedInvitation || invitation == dbSchemaProject.ExitedProject {
		err = dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbSchemaProject.PendingInvitation, member.Role)
		if err != nil {
			return nil, errors.New("Unsuccessful")
		}
		return nil, err
	}

	user, err := dbOperationsUserManagement.GetUserByUserID(ctx, member.UserID)
	if err != nil {
		return nil, err
	}
	newMember := &dbSchemaProject.Member{
		UserID:     user.ID,
		UserName:   user.Username,
		Name:       *user.Name,
		Email:      *user.Email,
		Role:       *member.Role,
		Invitation: dbSchemaProject.PendingInvitation,
	}

	err = dbOperationsProject.AddMember(ctx, member.ProjectID, newMember)
	return newMember.GetOutputMember(), err
}

// AcceptInvitation accept an invitation
func AcceptInvitation(ctx context.Context, member model.MemberInput) (string, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return "Unsuccessful", err
	}

	if invitation == dbSchemaProject.AcceptedInvitation {
		return "Unsuccessful", errors.New("you are already a member of this project")
	} else if invitation == dbSchemaProject.PendingInvitation {
		err := dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbSchemaProject.AcceptedInvitation, nil)
		if err != nil {
			return "Unsuccessful", err
		}
		return "Successful", nil
	} else if invitation == dbSchemaProject.DeclinedInvitation {
		return "Unsuccessful", errors.New("you have already declined the request")
	} else if invitation == dbSchemaProject.ExitedProject {
		return "Unsuccessful", errors.New("you are no longer a member of this project")
	}

	return "Unsuccessful", errors.New("no invitation is present to accept")
}

// DeclineInvitation decline an Invitation
func DeclineInvitation(ctx context.Context, member model.MemberInput) (string, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return "Unsuccessful", err
	}

	if invitation == dbSchemaProject.AcceptedInvitation {
		return "Unsuccessful", errors.New("you are already a member of this project")
	} else if invitation == dbSchemaProject.PendingInvitation {
		err := dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbSchemaProject.DeclinedInvitation, nil)
		if err != nil {
			return "Unsuccessful", err
		}
		return "Successful", nil
	} else if invitation == dbSchemaProject.DeclinedInvitation {
		return "Unsuccessful", errors.New("you have already declined the request")
	} else if invitation == dbSchemaProject.ExitedProject {
		return "Unsuccessful", errors.New("you are no longer a member of this project")
	}

	return "Unsuccessful", errors.New("no invitation is present to decline")
}

//LeaveProject leaves a project
func LeaveProject(ctx context.Context, member model.MemberInput) (string, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return "Unsuccessful", err
	}

	if invitation == dbSchemaProject.AcceptedInvitation {
		err := dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbSchemaProject.ExitedProject, nil)
		if err != nil {
			return "Unsuccessful", err
		}
		return "Successful", err
	} else if invitation == dbSchemaProject.PendingInvitation || invitation == dbSchemaProject.DeclinedInvitation || invitation == dbSchemaProject.ExitedProject {
		return "Unsuccessful", errors.New("you are not a member of this project")
	}

	return "Unsuccessful", errors.New("no Project to perform this operation on (Leave Project)")
}

// getInvitation returns the Invitation status
func getInvitation(ctx context.Context, member model.MemberInput) (dbSchemaProject.Invitation, error) {

	project, err := dbOperationsProject.GetProject(ctx, bson.D{{"_id", member.ProjectID}})
	if err != nil {
		return "", err
	}
	for _, projectMember := range project.Members {
		if projectMember.UserID == member.UserID {
			return projectMember.Invitation, nil
		}
	}

	return "", nil
}

// RemoveInvitation removes member or cancels invitation
func RemoveInvitation(ctx context.Context, member model.MemberInput) (string, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return "Unsuccessful", err
	}
	if invitation == dbSchemaProject.AcceptedInvitation || invitation == dbSchemaProject.PendingInvitation {
		er := dbOperationsProject.RemoveInvitation(ctx, member.ProjectID, member.UserID, invitation)
		if er != nil {
			return "Unsuccessful", er
		}
	} else if invitation == dbSchemaProject.DeclinedInvitation {
		return "Unsuccessful", errors.New("user has already declined the invitation")
	} else if invitation == dbSchemaProject.ExitedProject {
		return "Unsuccessful", errors.New("user is no longer a member of this project")
	}
	return "Successful", nil
}
