package grpc

import (
	"context"
	log "github.com/sirupsen/logrus"
	"litmus/litmus-portal/authentication/api/middleware"
	"litmus/litmus-portal/authentication/api/presenter/protos"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/validations"

	"github.com/golang-jwt/jwt"
)

func (s *ServerGrpc) ValidateRequest(ctx context.Context,
	inputRequest *protos.ValidationRequest) (*protos.ValidationResponse, error) {
	token, err := middleware.ValidateToken(inputRequest.Jwt)
	if err != nil {
		return &protos.ValidationResponse{Error: err.Error(), IsValid: false}, err
	}
	claims := token.Claims.(jwt.MapClaims)
	uid := claims["uid"].(string)
	err = validations.RbacValidator(uid, inputRequest.ProjectId,
		inputRequest.RequiredRoles, inputRequest.Invitation, s.ApplicationService)
	if err != nil {
		return &protos.ValidationResponse{Error: err.Error(), IsValid: false}, err
	}
	return &protos.ValidationResponse{Error: "", IsValid: true}, nil
}

func (s *ServerGrpc) GetProjectById(ctx context.Context,
	inputRequest *protos.GetProjectByIdRequest) (*protos.
	GetProjectByIdResponse, error) {

	project, err := s.ApplicationService.GetProjectByProjectID(inputRequest.ProjectID)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	// Fetching user ids of all the members in the project
	var uids []string

	for _, member := range project.Members {
		uids = append(uids, member.UserID)
	}

	memberMap := make(map[string]entities.User)

	authUsers, err := s.ApplicationService.FindUsersByUID(uids)
	for _, authUser := range *authUsers {
		memberMap[authUser.ID] = authUser
	}

	var projectMembers []*protos.ProjectMembers

	// Adding additional details of project members
	for _, member := range project.Members {
		var projectMember protos.ProjectMembers
		projectMember.Email = memberMap[member.UserID].Email
		projectMember.UserName = memberMap[member.UserID].UserName
		projectMember.Invitation = string(member.Invitation)
		projectMember.Uid = member.UserID
		projectMember.JoinedAt = member.JoinedAt
		projectMembers = append(projectMembers, &projectMember)
	}

	if err != nil {
		return nil, err
	}

	return &protos.GetProjectByIdResponse{
		Id:        project.ID,
		Uid:       project.UID,
		Name:      project.Name,
		Members:   projectMembers,
		State:     "",
		CreatedAt: project.CreatedAt,
		UpdatedAt: project.UpdatedAt,
		RemovedAt: project.RemovedAt,
	}, nil
}
