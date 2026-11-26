package rest_test

import (
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/assert"
)

func TestCheckInitialLogin(t *testing.T) {
	tests := []struct {
		name          string
		userID        string
		setupMock     func(service *mocks.MockedApplicationService)
		expectedBool  bool
		expectedError error
	}{
		{
			name:   "User has initial login true",
			userID: "user-123",
			setupMock: func(service *mocks.MockedApplicationService) {
				service.On("GetUser", "user-123").Return(&entities.User{
					ID:             "user-123",
					Username:       "testuser",
					IsInitialLogin: true,
				}, nil).Once()
			},
			expectedBool:  true,
			expectedError: nil,
		},
		{
			name:   "User has initial login false",
			userID: "user-456",
			setupMock: func(service *mocks.MockedApplicationService) {
				service.On("GetUser", "user-456").Return(&entities.User{
					ID:             "user-456",
					Username:       "testuser",
					IsInitialLogin: false,
				}, nil).Once()
			},
			expectedBool:  false,
			expectedError: nil,
		},
		{
			name:   "Error when user not found or db fails",
			userID: "user-unknown",
			setupMock: func(service *mocks.MockedApplicationService) {
				service.On("GetUser", "user-unknown").Return((*entities.User)(nil), errors.New("user not found")).Once()
			},
			expectedBool:  false,
			expectedError: errors.New("user not found"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockService := new(mocks.MockedApplicationService)
			tt.setupMock(mockService)

			isInitial, err := rest.CheckInitialLogin(mockService, tt.userID)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError.Error(), err.Error())
			} else {
				assert.NoError(t, err)
			}
			assert.Equal(t, tt.expectedBool, isInitial)
			mockService.AssertExpectations(t)
		})
	}
}
