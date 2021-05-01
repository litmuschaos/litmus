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
	dbOperationsUserManagement "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/usermanagement"
	selfDeployer "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/self-deployer"
)

// CreateProjectWithUser :creates a project for the user
func CreateProjectWithUser(ctx context.Context, projectName string, userID string) (*model.Project, error) {

	var (
		self_cluster = os.Getenv("SELF_CLUSTER")
	)
	user, er := dbOperationsUserManagement.GetUserByUserID(ctx, userID)
	if er != nil {
		log.Print("ERROR", er)
		return nil, er
	}

	uuid := uuid.New()
	newProject := &dbOperationsProject.Project{
		ID:   uuid.String(),
		Name: projectName,
		Members: []*dbOperationsProject.Member{
			{
				UserID:     user.ID,
				UserName:   user.Username,
				Name:       *user.Name,
				Email:      *user.Email,
				Role:       model.MemberRoleOwner,
				Invitation: dbOperationsProject.AcceptedInvitation,
				JoinedAt:   time.Now().Format(time.RFC1123Z),
			},
		},
		CreatedAt: time.Now().String(),
	}

	err := dbOperationsProject.CreateProject(ctx, newProject)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	defaultHub := model.CreateMyHub{
		HubName:    "Chaos Hub",
		RepoURL:    "https://github.com/litmuschaos/chaos-charts",
		RepoBranch: os.Getenv("HUB_BRANCH_NAME"),
	}

	log.Print("Cloning https://github.com/litmuschaos/chaos-charts")
	go myhub.AddMyHub(context.Background(), defaultHub, newProject.ID) //nolint

	if strings.ToLower(self_cluster) == "true" && strings.ToLower(*user.Role) == "admin" {
		log.Print("Starting self deployer")
		go selfDeployer.StartDeployer(newProject.ID)
	}

	return newProject.GetOutputProject(), nil
}

// GetProject ...
func GetProject(ctx context.Context, projectID string) (*model.Project, error) {

	project, err := dbOperationsProject.GetProject(ctx, bson.D{{Key: "_id", Value: projectID}})
	if err != nil {
		return nil, err
	}
	return project.GetOutputProject(), nil
}

// GetProjectsByUserID ...
func GetProjectsByUserID(ctx context.Context, userID string) ([]*model.Project, error) {

	projects, err := dbOperationsProject.GetProjectsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	outputProjects := []*model.Project{}
	for _, project := range projects {
		outputProjects = append(outputProjects, project.GetOutputProject())
	}
	return outputProjects, nil
}

// SendInvitation :Send an invitation
func SendInvitation(ctx context.Context, member model.MemberInput) (*model.Member, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return nil, err
	}

	if invitation == dbOperationsProject.AcceptedInvitation {
		return nil, errors.New("this user is already a member of your project")
	} else if invitation == dbOperationsProject.PendingInvitation || invitation == dbOperationsProject.DeclinedInvitation || invitation == dbOperationsProject.ExitedProject {
		err = dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbOperationsProject.PendingInvitation, member.Role)
		if err != nil {
			return nil, errors.New("Unsuccessful")
		}
		return nil, err
	}

	user, err := dbOperationsUserManagement.GetUserByUserID(ctx, member.UserID)
	if err != nil {
		return nil, err
	}
	newMember := &dbOperationsProject.Member{
		UserID:     user.ID,
		UserName:   user.Username,
		Name:       *user.Name,
		Email:      *user.Email,
		Role:       *member.Role,
		Invitation: dbOperationsProject.PendingInvitation,
	}

	err = dbOperationsProject.AddMember(ctx, member.ProjectID, newMember)
	return newMember.GetOutputMember(), err
}

// AcceptInvitation :Accept an invitaion
func AcceptInvitation(ctx context.Context, member model.MemberInput) (string, error) {

	err := dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbOperationsProject.AcceptedInvitation, nil)
	if err != nil {
		return "Unsuccessful", err
	}
	return "Successfull", nil
}

// DeclineInvitation :Decline an Invitaion
func DeclineInvitation(ctx context.Context, member model.MemberInput) (string, error) {

	err := dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbOperationsProject.DeclinedInvitation, nil)
	if err != nil {
		return "Unsuccessful", err
	}
	return "Successfull", nil
}

//LeaveProject :Leave a Project
func LeaveProject(ctx context.Context, member model.MemberInput) (string, error) {

	err := dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbOperationsProject.ExitedProject, nil)
	if err != nil {
		return "Unsuccessful", err
	}
	return "Successfull", err
}

// getInvitation :Returns the Invitation Status
func getInvitation(ctx context.Context, member model.MemberInput) (dbOperationsProject.Invitation, error) {

	project, err := dbOperationsProject.GetProject(ctx, bson.D{{Key: "_id", Value: member.ProjectID}})
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

// RemoveInvitation :Removes member or cancels invitation
func RemoveInvitation(ctx context.Context, member model.MemberInput) (string, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return "Unsuccessful", err
	}

	switch invitation {
	case dbOperationsProject.AcceptedInvitation, dbOperationsProject.PendingInvitation:
		{
			err := dbOperationsProject.RemoveInvitation(ctx, member.ProjectID, member.UserID, invitation)
			if err != nil {
				return "Unsuccessful", err
			}
		}

	case dbOperationsProject.DeclinedInvitation, dbOperationsProject.ExitedProject:
		{
			return "Unsuccessful", errors.New("user is already not a part of your project")
		}
	}

	return "Successful", nil
}

//  UpdateProjectName :Updates project name (Multiple projects can have same name)
func UpdateProjectName(ctx context.Context, projectID string, projectName string) (string, error) {

	err := dbOperationsProject.UpdateProjectName(ctx, projectID, projectName)
	if err != nil {
		return "Unsuccessful", errors.New("error updating project name")
	}
	return "Successful", nil
}
