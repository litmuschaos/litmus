package grpc

import (
	"context"
	"strconv"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter/protos"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/validations"

	log "github.com/sirupsen/logrus"

	"github.com/golang-jwt/jwt"
)

func (s *ServerGrpc) ValidateRequest(ctx context.Context,
	inputRequest *protos.ValidationRequest) (*protos.ValidationResponse, error) {
	token, err := s.ValidateToken(inputRequest.Jwt)
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
	inputRequest *protos.GetProjectByIdRequest) (*protos.GetProjectByIdResponse, error) {

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
		projectMember.Username = memberMap[member.UserID].Username
		projectMember.Invitation = string(member.Invitation)
		projectMember.Uid = member.UserID
		projectMember.JoinedAt = strconv.FormatInt(member.JoinedAt, 10)
		projectMembers = append(projectMembers, &projectMember)
	}

	if err != nil {
		return nil, err
	}

	return &protos.GetProjectByIdResponse{
		Id:        project.ID,
		Name:      project.Name,
		Members:   projectMembers,
		State:     "",
		CreatedAt: strconv.FormatInt(project.CreatedAt, 10),
		UpdatedAt: strconv.FormatInt(project.UpdatedAt, 10),
	}, nil
}

func (s *ServerGrpc) GetUserById(ctx context.Context,
	inputRequest *protos.GetUserByIdRequest) (*protos.GetUserByIdResponse, error) {
	user, err := s.ApplicationService.GetUser(inputRequest.UserID)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	var deactivatedAt string
	if user.DeactivatedAt != nil {
		deactivatedAt = strconv.FormatInt(*user.DeactivatedAt, 10)
	}
	return &protos.GetUserByIdResponse{
		Id:            user.ID,
		Name:          user.Name,
		Username:      user.Username,
		CreatedAt:     strconv.FormatInt(user.CreatedAt, 10),
		UpdatedAt:     strconv.FormatInt(user.UpdatedAt, 10),
		DeactivatedAt: deactivatedAt,
		Role:          string(user.Role),
		Email:         user.Email,
	}, nil
}
