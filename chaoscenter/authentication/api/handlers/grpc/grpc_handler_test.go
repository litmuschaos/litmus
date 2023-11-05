package grpc_test

import (
	"context"
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/grpc"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter/protos"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestGetProjectById(t *testing.T) {
	testCases := []struct {
		name                   string
		projectID              string
		mockGetProjectResponse *entities.Project
		mockGetProjectError    error
		mockFindUsersResponse  *[]entities.User
		mockFindUsersError     error
		expectedResponse       *protos.GetProjectByIdResponse
		expectedError          bool
	}{
		{
			name:      "PositiveTestProjectExists",
			projectID: "project-id",
			mockGetProjectResponse: &entities.Project{
				ID:   "project-id",
				Name: "test-project",
				Members: []*entities.Member{
					{
						UserID:     "user-1",
						Invitation: entities.PendingInvitation,
						JoinedAt:   1234567890,
					},
				},
			},
			mockGetProjectError: nil,
			mockFindUsersResponse: &[]entities.User{
				{
					ID:       "user-1",
					Email:    "user1@email.com",
					Username: "user1",
				},
			},
			mockFindUsersError: nil,
			expectedResponse: &protos.GetProjectByIdResponse{
				Id:   "project-id",
				Name: "test-project",
			},
			expectedError: false,
		},
		{
			name:                   "NegativeTestProjectDoesNotExist",
			projectID:              "non-existing-project-id",
			mockGetProjectResponse: nil,
			mockGetProjectError:    errors.New("project not found"),
			mockFindUsersResponse:  nil,
			mockFindUsersError:     nil,
			expectedResponse:       nil,
			expectedError:          true,
		},
	}

	s := &grpc.ServerGrpc{
		ApplicationService: &mocks.MockedApplicationService{},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			ctx := context.Background()

			mockService := s.ApplicationService.(*mocks.MockedApplicationService)
			mockService.On("GetProjectByProjectID", tc.projectID).Return(tc.mockGetProjectResponse, tc.mockGetProjectError)
			if tc.mockFindUsersResponse != nil {
				mockService.On("FindUsersByUID", mock.Anything).Return(tc.mockFindUsersResponse, tc.mockFindUsersError)
			}

			req := &protos.GetProjectByIdRequest{
				ProjectID: tc.projectID,
			}

			resp, err := s.GetProjectById(ctx, req)

			if tc.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, resp)
				assert.Equal(t, tc.expectedResponse.Name, resp.Name)
			}
			mockService.AssertExpectations(t)
		})
	}
}

func TestGetUserById(t *testing.T) {
	testcases := []struct {
		name                string
		userID              string
		mockServiceResponse *entities.User
		mockServiceError    error
		expectedResponse    *protos.GetUserByIdResponse
		expectedError       bool
	}{
		{
			name:   "PositiveTestUserExists",
			userID: "user-id",
			mockServiceResponse: &entities.User{
				ID:            "user-id",
				Name:          "test-user",
				Username:      "username",
				DeactivatedAt: nil,
				Role:          "admin",
				Email:         "user@email.com",
			},
			mockServiceError: nil,
			expectedResponse: &protos.GetUserByIdResponse{
				Id:            "user-id",
				Name:          "test-user",
				Email:         "user@email.com",
				DeactivatedAt: "nil",
			},
			expectedError: false,
		},
		{
			name:                "NegativeTestUserDoesNotExist",
			userID:              "non-existing-user-id",
			mockServiceResponse: nil,
			mockServiceError:    errors.New("user not found"),
			expectedResponse:    nil,
			expectedError:       true,
		},
	}

	s := &grpc.ServerGrpc{
		ApplicationService: &mocks.MockedApplicationService{},
	}

	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			ctx := context.Background()

			mockService := s.ApplicationService.(*mocks.MockedApplicationService)
			mockService.On("GetUser", tc.userID).Return(tc.mockServiceResponse, tc.mockServiceError)

			req := &protos.GetUserByIdRequest{
				UserID: tc.userID,
			}

			resp, err := s.GetUserById(ctx, req)

			if tc.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, resp)
				assert.Equal(t, tc.expectedResponse.Name, resp.Name)
				assert.Equal(t, tc.expectedResponse.Email, resp.Email)
			}

			mockService.AssertExpectations(t)
		})
	}
}
