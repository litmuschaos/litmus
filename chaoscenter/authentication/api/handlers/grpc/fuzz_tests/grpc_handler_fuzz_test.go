package grpc_test

import (
	"context"
	"testing"
	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/grpc"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter/protos"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/mock"
)

func FuzzGetProjectById(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		ctx := context.Background()
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			name                   string
			projectID              string
			UserID 			   	   string
			mockGetProjectResponse *entities.Project
			mockGetProjectError    error
			mockFindUsersResponse  *[]entities.User
			mockFindUsersError     error
			expectedResponse       *protos.GetProjectByIdResponse
			expectedError          bool
			JoinedAt			   int64
			User				  entities.User

		}{}
		targetStruct.mockGetProjectResponse = &entities.Project{
			ID:   targetStruct.projectID,
				Name: targetStruct.name,
				Members: []*entities.Member{
					{
						UserID:     targetStruct.UserID,
						Invitation: entities.PendingInvitation,
						JoinedAt:   targetStruct.JoinedAt,
					},
				},
		}
		targetStruct.mockFindUsersResponse = &[]entities.User{
			{
				ID:       targetStruct.User.ID,
				Email:    targetStruct.User.Email,
				Username: targetStruct.User.Username,
			},
		}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		s := &grpc.ServerGrpc{
			ApplicationService: &mocks.MockedApplicationService{},
		}			
		mockService := s.ApplicationService.(*mocks.MockedApplicationService)
		mockService.On("GetProjectByProjectID", targetStruct.projectID).Return(targetStruct.mockGetProjectResponse, targetStruct.mockGetProjectError)
		if targetStruct.mockFindUsersResponse != nil {
			mockService.On("FindUsersByUID", mock.Anything).Return(targetStruct.mockFindUsersResponse, targetStruct.mockFindUsersError)
		}

		req := &protos.GetProjectByIdRequest{
			ProjectID: targetStruct.projectID,
		}

		_, err1 := s.GetProjectById(ctx, req)
		if err1 != nil {
			t.Errorf("ChaosExperimentHandler.GetExperiment() error = %v", err)
			return
		}


	})
}

func FuzzGetUserById(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		ctx := context.Background()
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			name                   string
			userID 			   	   string
			username 				string
			mockServiceResponse    *entities.User
			mockServiceError   	 error
			expectedResponse       *protos.GetProjectByIdResponse
			expectedError          bool
			DeactivatedAt		   *int64
			User				  entities.User

		}{}
		targetStruct.mockServiceResponse = &entities.User{
			ID:            targetStruct.User.ID,
			Name:          targetStruct.User.Name,
			Username:      targetStruct.User.Username,
			DeactivatedAt: targetStruct.User.DeactivatedAt,
			Role:          targetStruct.User.Role,
			Email:         targetStruct.User.Email,
		}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		s := &grpc.ServerGrpc{
			ApplicationService: &mocks.MockedApplicationService{},
		}			

		mockService := s.ApplicationService.(*mocks.MockedApplicationService)
		mockService.On("GetUser", targetStruct.userID).Return(targetStruct.mockServiceResponse, targetStruct.mockServiceError)

		req := &protos.GetUserByIdRequest{
			UserID: targetStruct.userID,
		}

		_, err1 := s.GetUserById(ctx, req)
		if err1 != nil {
			t.Errorf("ChaosExperimentHandler.GetExperiment() error = %v", err)
			return
		}
	})	
}