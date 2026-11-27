package validations_test

import (
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/validations"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
)

func TestRbacValidator_IndividualMemberAllowed(t *testing.T) {
	service := new(mocks.MockedApplicationService)

	service.On("GetUser", "user1").Return(&entities.User{
		ID:         "user1",
		Username:   "testuser",
		OIDCGroups: []string{"dev-team"},
	}, nil)
	filter := bson.D{
		{Key: "_id", Value: bson.D{{Key: "$eq", Value: "proj1"}}},
		{Key: "members", Value: bson.D{
			{Key: "$elemMatch", Value: bson.D{
				{Key: "user_id", Value: bson.D{{Key: "$eq", Value: "user1"}}},
				{Key: "role", Value: bson.D{{Key: "$in", Value: []string{string(entities.RoleOwner)}}}},
				{Key: "invitation", Value: bson.D{{Key: "$eq", Value: string(entities.AcceptedInvitation)}}},
			}},
		}},
	}
	service.On("GetProjects", filter).Return([]*entities.Project{
		{ID: "proj1"},
	}, nil).Once()

	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleOwner)}, string(entities.AcceptedInvitation),
		service)

	assert.NoError(t, err)
	service.AssertNumberOfCalls(t, "GetProjects", 1)
	service.AssertExpectations(t)
}

func TestRbacValidator_IndividualMemberDenied_GroupAllowed(t *testing.T) {
	service := new(mocks.MockedApplicationService)

	service.On("GetUser", "user1").Return(&entities.User{
		ID:         "user1",
		Username:   "testuser",
		OIDCGroups: []string{"dev-team"},
	}, nil)
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{}, nil).Once()
	groupFilter := bson.D{
		{Key: "_id", Value: bson.D{{Key: "$eq", Value: "proj1"}}},
		{Key: "groups", Value: bson.D{
			{Key: "$elemMatch", Value: bson.D{
				{Key: "group", Value: bson.D{{Key: "$in", Value: []string{"dev-team"}}}},
				{Key: "role", Value: bson.D{{Key: "$in", Value: []string{string(entities.RoleExecutor)}}}},
			}},
		}},
	}
	service.On("GetProjects", groupFilter).Return([]*entities.Project{{ID: "proj1"}}, nil).Once()

	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleExecutor)}, string(entities.AcceptedInvitation),
		service)

	assert.NoError(t, err)
	service.AssertExpectations(t)
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
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{}, nil).Once()

	// Pass explicit groups via variadic param — should override user.OIDCGroups
	explicitGroups := []string{"explicit-group"}
	groupFilter := bson.D{
		{Key: "_id", Value: bson.D{{Key: "$eq", Value: "proj1"}}},
		{Key: "groups", Value: bson.D{
			{Key: "$elemMatch", Value: bson.D{
				{Key: "group", Value: bson.D{{Key: "$in", Value: explicitGroups}}},
				{Key: "role", Value: bson.D{{Key: "$in", Value: []string{string(entities.RoleExecutor)}}}},
			}},
		}},
	}
	service.On("GetProjects", groupFilter).Return([]*entities.Project{{ID: "proj1"}}, nil).Once()
	err := validations.RbacValidator("user1", "proj1",
		[]string{string(entities.RoleExecutor)}, string(entities.AcceptedInvitation),
		service, explicitGroups)

	assert.NoError(t, err)
	service.AssertExpectations(t)
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
