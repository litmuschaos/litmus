package project

import (
	"context"
	"errors"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	imageRegistryOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/image_registry/ops"
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
		bl_true     = true
	)
	user, err := dbOperationsUserManagement.GetUserByUserID(ctx, userID)
	if err != nil {
		log.Print("Error in fetching the user", err)
		return nil, err
	}

	if projectName == "" {
		return nil, errors.New("project name can't be empty")
	}

	//checking duplicate projectname
	filter := bson.D{{"name", projectName}, {"members.user_id", userID}, {"members.role", model.MemberRoleOwner}}
	projects, err := dbOperationsProject.GetProjects(ctx, filter)
	if err != nil {
		return nil, err
	}

	if len(projects) > 0 {
		return nil, errors.New("project with name: " + projectName + " already exists.")
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
				JoinedAt:   strconv.FormatInt(time.Now().Unix(), 10),
			},
		},
		CreatedAt: strconv.FormatInt(time.Now().Unix(), 10),
	}

	err = dbOperationsProject.CreateProject(ctx, newProject)
	if err != nil {
		log.Print("Error in creating the project", err)
		return nil, err
	}

	defaultHub := model.CreateMyHub{
		HubName:    "Chaos Hub",
		RepoURL:    "https://github.com/litmuschaos/chaos-charts",
		RepoBranch: os.Getenv("HUB_BRANCH_NAME"),
	}

	log.Print("Cloning https://github.com/litmuschaos/chaos-charts")
	go myhub.AddMyHub(context.Background(), defaultHub, newProject.ID)
	_, err = imageRegistryOps.CreateImageRegistry(ctx, newProject.ID, model.ImageRegistryInput{
		IsDefault:         bl_true,
		ImageRegistryName: "docker.io",
		ImageRepoName:     "litmuschaos",
		ImageRegistryType: "public",
		SecretName:        nil,
		SecretNamespace:   nil,
		EnableRegistry:    &bl_true,
	})

	if err != nil {
		return nil, err
	}

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

	projects, err := dbOperationsProject.GetProjectsByUserID(ctx, userID, false)
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

	user, err := dbOperationsUserManagement.GetUserByUserID(ctx, member.UserID)
	if err != nil {
		return nil, err
	}

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

	err := dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbSchemaProject.AcceptedInvitation, nil)
	if err != nil {
		return "Unsuccessful", err
	}
	return "Successful", nil
}

// DeclineInvitation decline an Invitation
func DeclineInvitation(ctx context.Context, member model.MemberInput) (string, error) {

	err := dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbSchemaProject.DeclinedInvitation, nil)
	if err != nil {
		return "Unsuccessful", err
	}
	return "Successful", nil
}

//LeaveProject leaves a project
func LeaveProject(ctx context.Context, member model.MemberInput) (string, error) {

	err := dbOperationsProject.UpdateInvite(ctx, member.ProjectID, member.UserID, dbSchemaProject.ExitedProject, nil)
	if err != nil {
		return "Unsuccessful", err
	}
	return "Successful", err
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

	switch invitation {
	case dbSchemaProject.AcceptedInvitation, dbSchemaProject.PendingInvitation:
		{
			err := dbOperationsProject.RemoveInvitation(ctx, member.ProjectID, member.UserID, invitation)
			if err != nil {
				return "Unsuccessful", err
			}
		}

	case dbSchemaProject.DeclinedInvitation, dbSchemaProject.ExitedProject:
		{
			return "Unsuccessful", errors.New("User is already not a part of your project")
		}
	}

	return "Successful", nil
}

//  UpdateProjectName :Updates project name (Multiple projects can have same name)
func UpdateProjectName(ctx context.Context, projectID string, projectName string, userID string) (string, error) {

	//checking duplicate projectname
	filter := bson.D{{"name", projectName}, {"members.user_id", userID}, {"members.role", model.MemberRoleOwner}}
	projects, err := dbOperationsProject.GetProjects(ctx, filter)
	if err != nil {
		return "", err
	}

	if len(projects) > 0 {
		return "", errors.New("project with name: " + projectName + " already exists.")
	}

	err = dbOperationsProject.UpdateProjectName(ctx, projectID, projectName)
	if err != nil {
		return "Unsuccessful", errors.New("Error updating project name")
	}
	return "Successful", nil
}
