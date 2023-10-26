package services

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type projectService interface {
	GetProjectByProjectID(projectID string) (*entities.Project, error)
	GetProjects(query bson.D) ([]*entities.Project, error)
	GetProjectsByUserID(uid string, isOwner bool) ([]*entities.Project, error)
	GetProjectStats() ([]*entities.ProjectStats, error)
	CreateProject(project *entities.Project) error
	AddMember(projectID string, member *entities.Member) error
	RemoveInvitation(projectID string, userID string, invitation entities.Invitation) error
	UpdateInvite(projectID string, userID string, invitation entities.Invitation, role *entities.MemberRole) error
	UpdateProjectName(projectID string, projectName string) error
	GetAggregateProjects(pipeline mongo.Pipeline, opts *options.AggregateOptions) (*mongo.Cursor, error)
	UpdateProjectState(ctx context.Context, userID string, deactivateTime int64, isDeactivate bool) error
	GetOwnerProjectIDs(ctx context.Context, userID string) ([]*entities.Project, error)
	GetProjectRole(projectID string, userID string) (*entities.MemberRole, error)
	GetProjectMembers(projectID string, state string) ([]*entities.Member, error)
	ListInvitations(userID string, invitationState entities.Invitation) ([]*entities.Project, error)
}

func (a applicationService) GetProjectByProjectID(projectID string) (*entities.Project, error) {
	return a.projectRepository.GetProjectByProjectID(projectID)
}

func (a applicationService) GetProjects(query bson.D) ([]*entities.Project, error) {
	return a.projectRepository.GetProjects(query)
}

func (a applicationService) GetProjectsByUserID(uid string, isOwner bool) ([]*entities.Project, error) {
	return a.projectRepository.GetProjectsByUserID(uid, isOwner)
}

func (a applicationService) GetProjectStats() ([]*entities.ProjectStats, error) {
	return a.projectRepository.GetProjectStats()
}

func (a applicationService) CreateProject(project *entities.Project) error {
	return a.projectRepository.CreateProject(project)
}

func (a applicationService) AddMember(projectID string, member *entities.Member) error {
	return a.projectRepository.AddMember(projectID, member)
}

func (a applicationService) RemoveInvitation(projectID string, userID string, invitation entities.Invitation) error {
	return a.projectRepository.RemoveInvitation(projectID, userID, invitation)
}

func (a applicationService) UpdateInvite(projectID string, userID string, invitation entities.Invitation, role *entities.MemberRole) error {
	return a.projectRepository.UpdateInvite(projectID, userID, invitation, role)
}

func (a applicationService) UpdateProjectName(projectID string, projectName string) error {
	return a.projectRepository.UpdateProjectName(projectID, projectName)
}

func (a applicationService) GetAggregateProjects(pipeline mongo.Pipeline, opts *options.AggregateOptions) (*mongo.Cursor, error) {
	return a.projectRepository.GetAggregateProjects(pipeline, opts)
}

func (a applicationService) UpdateProjectState(ctx context.Context, userID string, deactivateTime int64, isDeactivate bool) error {
	return a.projectRepository.UpdateProjectState(ctx, userID, deactivateTime, isDeactivate)
}
func (a applicationService) GetOwnerProjectIDs(ctx context.Context, userID string) ([]*entities.Project, error) {
	return a.projectRepository.GetOwnerProjects(ctx, userID)
}
func (a applicationService) GetProjectRole(projectID string, userID string) (*entities.MemberRole, error) {
	return a.projectRepository.GetProjectRole(projectID, userID)
}

func (a applicationService) GetProjectMembers(projectID string, state string) ([]*entities.Member, error) {
	return a.projectRepository.GetProjectMembers(projectID, state)
}

func (a applicationService) ListInvitations(userID string, invitationState entities.Invitation) ([]*entities.Project, error) {
	return a.projectRepository.ListInvitations(userID, invitationState)
}
