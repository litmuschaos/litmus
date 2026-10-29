package validations_test

import (
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/validations"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestRbacValidator(t *testing.T) {
	uid := "user-001"
	projectID := "proj-001"
	requiredRoles := []string{"Owner", "Editor"}
	invitation := "Accepted"

	tests := []struct {
		name          string
		setupMock     func(service *mocks.MockedApplicationService)
		expectedError string
	}{
		{
			name: "Success - User is active and has valid project role",
			setupMock: func(service *mocks.MockedApplicationService) {
				service.On("GetUser", uid).Return(&entities.User{
					ID:            uid,
					Username:      "activeUser",
					DeactivatedAt: nil,
				}, nil).Once()

				service.On("GetProjects", mock.Anything).Return([]*entities.Project{
					{
						ID:   projectID,
						Name: "Test Project",
					},
				}, nil).Once()
			},
			expectedError: "",
		},
		{
			name: "Failure - GetUser returns database error",
			setupMock: func(service *mocks.MockedApplicationService) {
				service.On("GetUser", uid).Return((*entities.User)(nil), errors.New("database connection failed")).Once()
			},
			expectedError: "database connection failed",
		},
		{
			name: "Failure - User is deactivated",
			setupMock: func(service *mocks.MockedApplicationService) {
				var deactivatedTime int64 = 1700000000
				service.On("GetUser", uid).Return(&entities.User{
					ID:            uid,
					Username:      "deactivatedUser",
					DeactivatedAt: &deactivatedTime,
				}, nil).Once()
			},
			expectedError: "auth gRPC - Deactivated User",
		},
		{
			name: "Failure - GetProjects returns database error",
			setupMock: func(service *mocks.MockedApplicationService) {
				service.On("GetUser", uid).Return(&entities.User{
					ID:            uid,
					Username:      "activeUser",
					DeactivatedAt: nil,
				}, nil).Once()

				service.On("GetProjects", mock.Anything).Return(([]*entities.Project)(nil), errors.New("mongo query error")).Once()
			},
			expectedError: "mongo query error",
		},
		{
			name: "Failure - Project not found or user lacks required role (Unauthorized)",
			setupMock: func(service *mocks.MockedApplicationService) {
				service.On("GetUser", uid).Return(&entities.User{
					ID:            uid,
					Username:      "activeUser",
					DeactivatedAt: nil,
				}, nil).Once()

				service.On("GetProjects", mock.Anything).Return([]*entities.Project{}, nil).Once()
			},
			expectedError: "auth gRPC - Unauthorized",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockService := new(mocks.MockedApplicationService)
			tt.setupMock(mockService)

			err := validations.RbacValidator(uid, projectID, requiredRoles, invitation, mockService)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err.Error())
			} else {
				assert.NoError(t, err)
			}
			mockService.AssertExpectations(t)
		})
	}
}

func TestMutationRbacRules(t *testing.T) {
	// Verify critical security operations are restricted to Owner only
	ownerOnlyRules := []string{
		"sendInvitation",
		"removeInvitation",
		"updateProjectName",
		"updateMemberRole",
		"deleteProject",
		"getActiveProjectMembers",
	}

	for _, op := range ownerOnlyRules {
		roles, exists := validations.MutationRbacRules[op]
		assert.True(t, exists, "Expected mutation rule to exist: "+op)
		assert.Equal(t, []string{string(entities.RoleOwner)}, roles, "Operation "+op+" should be restricted to Owner only")
	}

	// Verify read / member operations allow multiple roles
	multiRoleRules := []string{
		"acceptInvitation",
		"declineInvitation",
		"leaveProject",
		"getProject",
	}

	for _, op := range multiRoleRules {
		roles, exists := validations.MutationRbacRules[op]
		assert.True(t, exists, "Expected mutation rule to exist: "+op)
		assert.Contains(t, roles, string(entities.RoleOwner))
		assert.Contains(t, roles, string(entities.RoleViewer))
		assert.Contains(t, roles, string(entities.RoleEditor))
		assert.Contains(t, roles, string(entities.RoleExecutor))
	}
}
