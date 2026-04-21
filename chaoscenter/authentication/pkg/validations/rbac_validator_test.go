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

func TestRbacValidator_IndividualMemberAllowed(t *testing.T) {
	service := new(mocks.MockedApplicationService)

	service.On("GetUser", "user1").Return(&entities.User{
		ID:       "user1",
		Username: "testuser",
	}, nil)
	// Individual member check returns a matching project
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{
		{ID: "proj1"},
	}, nil)

	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleOwner)}, string(entities.AcceptedInvitation),
		service)

	assert.NoError(t, err)
}

func TestRbacValidator_IndividualMemberDenied_GroupAllowed(t *testing.T) {
	service := new(mocks.MockedApplicationService)

	service.On("GetUser", "user1").Return(&entities.User{
		ID:         "user1",
		Username:   "testuser",
		OIDCGroups: []string{"dev-team"},
	}, nil)
	// First call: individual member check returns empty (denied)
	// Second call: group check returns matching project
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{}, nil).Once()
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{
		{ID: "proj1"},
	}, nil).Once()

	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleExecutor)}, string(entities.AcceptedInvitation),
		service)

	assert.NoError(t, err)
}

func TestRbacValidator_BothDenied(t *testing.T) {
	service := new(mocks.MockedApplicationService)

	service.On("GetUser", "user1").Return(&entities.User{
		ID:         "user1",
		Username:   "testuser",
		OIDCGroups: []string{"other-team"},
	}, nil)
	// Both individual and group checks return empty
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{}, nil)

	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleOwner)}, string(entities.AcceptedInvitation),
		service)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "Unauthorized")
}

func TestRbacValidator_NoGroupsNoMember(t *testing.T) {
	service := new(mocks.MockedApplicationService)

	service.On("GetUser", "user1").Return(&entities.User{
		ID:       "user1",
		Username: "testuser",
		// No OIDCGroups
	}, nil)
	// Individual member check returns empty
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{}, nil)

	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleOwner)}, string(entities.AcceptedInvitation),
		service)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "Unauthorized")
}

func TestRbacValidator_ExplicitGroupsParam(t *testing.T) {
	service := new(mocks.MockedApplicationService)

	service.On("GetUser", "user1").Return(&entities.User{
		ID:         "user1",
		Username:   "testuser",
		OIDCGroups: []string{"should-not-be-used"},
	}, nil)
	// Individual check fails
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{}, nil).Once()
	// Group check with explicit groups succeeds
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{
		{ID: "proj1"},
	}, nil).Once()

	// Pass explicit groups via variadic param — should override user.OIDCGroups
	explicitGroups := []string{"explicit-group"}
	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleExecutor)}, string(entities.AcceptedInvitation),
		service, explicitGroups)

	assert.NoError(t, err)
}

func TestRbacValidator_DeactivatedUser(t *testing.T) {
	service := new(mocks.MockedApplicationService)

	deactivatedAt := int64(1000)
	service.On("GetUser", "user1").Return(&entities.User{
		ID:            "user1",
		Username:      "testuser",
		DeactivatedAt: &deactivatedAt,
	}, nil)

	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleOwner)}, string(entities.AcceptedInvitation),
		service)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "Deactivated")
}

func TestRbacValidator_GetUserError(t *testing.T) {
	service := new(mocks.MockedApplicationService)

	service.On("GetUser", "user1").Return(&entities.User{}, errors.New("db error"))

	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleOwner)}, string(entities.AcceptedInvitation),
		service)

	assert.Error(t, err)
}

func TestRbacValidator_GetProjectsError(t *testing.T) {
	service := new(mocks.MockedApplicationService)

	service.On("GetUser", "user1").Return(&entities.User{
		ID:       "user1",
		Username: "testuser",
	}, nil)
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return(
		[]*entities.Project(nil), errors.New("db error"))

	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleOwner)}, string(entities.AcceptedInvitation),
		service)

	assert.Error(t, err)
}
