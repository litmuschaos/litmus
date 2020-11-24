package project

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/operations"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
)

//CreateProjectWithUser ...
func CreateProjectWithUser(ctx context.Context, projectName string, user *dbSchema.User) (*model.Project, error) {

	uuid := uuid.New()
	newProject := &dbSchema.Project{
		ID:   uuid.String(),
		Name: projectName,
		Members: []*dbSchema.Member{
			{
				UserID:     user.ID,
				UserName:   user.Username,
				Name:       *user.Name,
				Email:      *user.Email,
				Role:       model.MemberRoleOwner,
				Invitation: dbSchema.AcceptedInvitation,
				JoinedAt:   time.Now().Format(time.RFC1123Z),
			},
		},
		CreatedAt: time.Now().String(),
	}

	err := database.CreateProject(ctx, newProject)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	defaultHub := model.CreateMyHub{
		HubName:    "Chaos Hub",
		RepoURL:    "https://github.com/litmuschaos/chaos-charts",
		RepoBranch: "master",
	}

	log.Print("Cloning https://github.com/litmuschaos/chaos-charts")
	go myhub.AddMyHub(context.Background(), defaultHub, newProject.ID)

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

//SendInvitation ...
func SendInvitation(ctx context.Context, member model.MemberInput) (*model.Member, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return nil, err
	}

	if invitation == dbSchema.AcceptedInvitation {
		return nil, errors.New("This user is already a member of this project")
	} else if invitation == dbSchema.PendingInvitation || invitation == dbSchema.DeclinedInvitation {
		err = database.UpdateInvite(ctx, member.ProjectID, member.UserName, dbSchema.PendingInvitation, member.Role)
		return nil, err
	}

	user, err := database.GetUserByUserName(ctx, member.UserName)
	if err != nil {
		return nil, err
	}

	newMember := &dbSchema.Member{
		UserID:     user.ID,
		UserName:   user.Username,
		Name:       *user.Name,
		Email:      *user.Email,
		Role:       *member.Role,
		Invitation: dbSchema.PendingInvitation,
	}

	err = database.AddMember(ctx, member.ProjectID, newMember)
	return newMember.GetOutputMember(), err
}

//AcceptInvitation ...
func AcceptInvitation(ctx context.Context, member model.MemberInput) (string, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return "Unsuccessful", err
	}

	if invitation == dbSchema.AcceptedInvitation {
		return "Unsuccessful", errors.New("You are already a member of this project")
	} else if invitation == dbSchema.PendingInvitation {
		err := database.UpdateInvite(ctx, member.ProjectID, member.UserName, dbSchema.AcceptedInvitation, nil)
		if err != nil {
			return "Unsuccessful", err
		}
		return "Successfull", nil
	} else if invitation == dbSchema.DeclinedInvitation {
		return "Unsuccessful", errors.New("You have already declined the request")
	}

	return "Unsuccessful", errors.New("No invitation is present to accept")
}

//DeclineInvitation ...
func DeclineInvitation(ctx context.Context, member model.MemberInput) (string, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return "Unsuccessful", err
	}

	if invitation == dbSchema.AcceptedInvitation {
		return "Unsuccessful", errors.New("You are already a member of this project")
	} else if invitation == dbSchema.PendingInvitation {
		err := database.UpdateInvite(ctx, member.ProjectID, member.UserName, dbSchema.DeclinedInvitation, nil)
		if err != nil {
			return "Unsuccessful", err
		}
		return "Successfull", nil
	} else if invitation == dbSchema.DeclinedInvitation {
		return "Unsuccessful", errors.New("You have already declined the request")
	}

	return "Unsuccessful", errors.New("No invitation is present to decline")
}

//getInvitation
func getInvitation(ctx context.Context, member model.MemberInput) (dbSchema.Invitation, error) {

	project, err := database.GetProject(ctx, member.ProjectID)
	if err != nil {
		return "", err
	}

	for _, projectMember := range project.Members {
		if projectMember.UserName == member.UserName {
			return projectMember.Invitation, nil
		}
	}

	return "", nil
}

//RemoveInvitation ...
func RemoveInvitation(ctx context.Context, member model.MemberInput) (string, error) {

	invitation, err := getInvitation(ctx, member)
	if err != nil {
		return "Unsuccessful", err
	}
	if invitation == dbSchema.AcceptedInvitation || invitation == dbSchema.PendingInvitation {
		er := database.RemoveInvitation(ctx, member.ProjectID, member.UserName, invitation)
		if er != nil {
			return "Unsuccessful", er
		}
	} else {
		return "Unsuccessful", errors.New("User has already declined the invitation")
	}
	return "Successful", nil
}
