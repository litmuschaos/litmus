package grpc_test

import (
	"context"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/grpc"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter/protos"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/assert"
)

func TestGetProjectById(t *testing.T) {
	s := &grpc.ServerGrpc{
		ApplicationService: &mocks.MockedApplicationService{},
	}

	// Mocking ApplicationService methods
	mockService := s.ApplicationService.(*mocks.MockedApplicationService)
	mockService.On("GetProjectByProjectID", "project-id").Return(&entities.Project{
		ID:      "project-id",
		Name:    "test-project",
		Members: []*entities.Member{
			{
				UserID:    "user-1",
				Invitation: entities.PendingInvitation,
				JoinedAt:  1234567890,
			},
		},
	}, nil)
	mockService.On("FindUsersByUID", []string{"user-1"}).Return(&[]entities.User{
		{
			ID:       "user-1",
			Email:    "user1@email.com",
			Username: "user1",
		},
	}, nil)

	req := &protos.GetProjectByIdRequest{
		ProjectID: "project-id",
	}

	ctx := context.Background()

	resp, err := s.GetProjectById(ctx, req)

	// Assertions
	assert.Nil(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, "test-project", resp.Name)
	assert.Equal(t, "user1@email.com", resp.Members[0].Email)
}

func TestGetUserById(t *testing.T) {
	s := &grpc.ServerGrpc{
		ApplicationService: &mocks.MockedApplicationService{},
	}

	deactivatedTimestamp := int64(1234567892)

	// Mocking ApplicationService methods
	mockService := s.ApplicationService.(*mocks.MockedApplicationService)
	mockService.On("GetUser", "user-id").Return(&entities.User{
		ID:           "user-id",
		Name:         "test-user",
		Username:     "username",
		DeactivatedAt: &deactivatedTimestamp,
		Role:         "admin", // adjust to your actual type
		Email:        "user@email.com",
	}, nil)

	req := &protos.GetUserByIdRequest{
		UserID: "user-id",
	}

	ctx := context.Background()

	resp, err := s.GetUserById(ctx, req)

	// Assertions
	assert.Nil(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, "test-user", resp.Name)
	assert.Equal(t, "user@email.com", resp.Email)
}