package grpc

import (
	"context"
	"litmus/litmus-portal/authentication/api/middleware"
	"litmus/litmus-portal/authentication/api/presenter/protos"
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
