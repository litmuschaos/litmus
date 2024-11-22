package mocks

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/authConfig"

	"github.com/golang-jwt/jwt"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MockedApplicationService struct {
	mock.Mock
}

func (m *MockedApplicationService) IsAdministrator(user *entities.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockedApplicationService) UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error {
	args := m.Called(userPassword, isAdminBeingReset)
	return args.Error(0)
}

func (m *MockedApplicationService) AddMember(projectID string, member *entities.Member) error {
	args := m.Called(projectID, member)
	return args.Error(0)
}

func (m *MockedApplicationService) LoginUser(user *entities.User) (*entities.User, error) {
	args := m.Called(user)
	return args.Get(0).(*entities.User), args.Error(1)
}

func (m *MockedApplicationService) GetUser(uid string) (*entities.User, error) {
	args := m.Called(uid)
	return args.Get(0).(*entities.User), args.Error(1)
}

func (m *MockedApplicationService) GetUsers() (*[]entities.User, error) {
	args := m.Called()
	return args.Get(0).(*[]entities.User), args.Error(1)
}

func (m *MockedApplicationService) FindUsersByUID(uid []string) (*[]entities.User, error) {
	args := m.Called(uid)
	return args.Get(0).(*[]entities.User), args.Error(1)
}

func (m *MockedApplicationService) FindUserByUsername(username string) (*entities.User, error) {
	args := m.Called(username)
	return args.Get(0).(*entities.User), args.Error(1)
}

func (m *MockedApplicationService) CheckPasswordHash(hash, password string) error {
	args := m.Called(hash, password)
	return args.Error(0)
}

func (m *MockedApplicationService) CreateUser(user *entities.User) (*entities.User, error) {
	args := m.Called(user)
	return args.Get(0).(*entities.User), args.Error(1)
}

func (m *MockedApplicationService) UpdateUser(user *entities.UserDetails) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockedApplicationService) UpdateUserByQuery(filter bson.D, updateQuery bson.D) error {
	args := m.Called(filter, updateQuery)
	return args.Error(0)
}

func (m *MockedApplicationService) UpdateUserState(ctx context.Context, username string, isDeactivate bool, deactivateTime int64) error {
	args := m.Called(ctx, username, isDeactivate, deactivateTime)
	return args.Error(0)
}

func (m *MockedApplicationService) InviteUsers(invitedUsers []string) (*[]entities.User, error) {
	args := m.Called(invitedUsers)
	return args.Get(0).(*[]entities.User), args.Error(1)
}

func (m *MockedApplicationService) GetProjectByProjectID(projectID string) (*entities.Project, error) {
	args := m.Called(projectID)
	return args.Get(0).(*entities.Project), args.Error(1)
}

func (m *MockedApplicationService) GetProjects(query bson.D) ([]*entities.Project, error) {
	args := m.Called(query)
	return args.Get(0).([]*entities.Project), args.Error(1)
}

func (m *MockedApplicationService) GetProjectsByUserID(request *entities.ListProjectRequest) (*entities.ListProjectResponse, error) {
	args := m.Called(request)
	return args.Get(0).(*entities.ListProjectResponse), args.Error(1)
}

func (m *MockedApplicationService) GetProjectStats() ([]*entities.ProjectStats, error) {
	args := m.Called()
	return args.Get(0).([]*entities.ProjectStats), args.Error(1)
}

func (m *MockedApplicationService) CreateProject(project *entities.Project) error {
	args := m.Called(project)
	return args.Error(0)
}

func (m *MockedApplicationService) RemoveInvitation(projectID, userID string, invitation entities.Invitation) error {
	args := m.Called(projectID, userID, invitation)
	return args.Error(0)
}

func (m *MockedApplicationService) UpdateInvite(projectID, userID string, invitation entities.Invitation, role *entities.MemberRole) error {
	args := m.Called(projectID, userID, invitation, role)
	return args.Error(0)
}

func (m *MockedApplicationService) UpdateProjectName(projectID, projectName string) error {
	args := m.Called(projectID, projectName)
	return args.Error(0)
}

func (m *MockedApplicationService) UpdateMemberRole(projectID, userID string, role *entities.MemberRole) error {
	args := m.Called(projectID, userID, role)
	return args.Error(0)
}

func (m *MockedApplicationService) GetAggregateProjects(pipeline mongo.Pipeline, opts *options.AggregateOptions) (*mongo.Cursor, error) {
	args := m.Called(pipeline, opts)
	return args.Get(0).(*mongo.Cursor), args.Error(1)
}

func (m *MockedApplicationService) UpdateProjectState(ctx context.Context, userID string, deactivateTime int64, isDeactivate bool) error {
	args := m.Called(ctx, userID, deactivateTime, isDeactivate)
	return args.Error(0)
}

func (m *MockedApplicationService) GetOwnerProjectIDs(ctx context.Context, userID string) ([]*entities.Project, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]*entities.Project), args.Error(1)
}

func (m *MockedApplicationService) GetProjectRole(projectID, userID string) (*entities.MemberRole, error) {
	args := m.Called(projectID, userID)
	return args.Get(0).(*entities.MemberRole), args.Error(1)
}

func (m *MockedApplicationService) GetProjectMembers(projectID, state string) ([]*entities.Member, error) {
	args := m.Called(projectID, state)
	return args.Get(0).([]*entities.Member), args.Error(1)
}

func (m *MockedApplicationService) GetProjectOwners(projectID string) ([]*entities.Member, error) {
	args := m.Called(projectID)
	return args.Get(0).([]*entities.Member), args.Error(1)
}

func (m *MockedApplicationService) ListInvitations(userID string, invitationState entities.Invitation) ([]*entities.Project, error) {
	args := m.Called(userID, invitationState)
	return args.Get(0).([]*entities.Project), args.Error(1)
}

func (m *MockedApplicationService) RevokeToken(tokenString string) error {
	args := m.Called(tokenString)
	return args.Error(0)
}

func (m *MockedApplicationService) ValidateToken(encodedToken string) (*jwt.Token, error) {
	args := m.Called(encodedToken)
	return args.Get(0).(*jwt.Token), args.Error(1)
}

func (m *MockedApplicationService) GetSignedJWT(user *entities.User, jwtSecret string) (string, error) {
	args := m.Called(user, jwtSecret)
	return args.String(0), args.Error(1)
}

func (m *MockedApplicationService) CreateApiToken(user *entities.User, request entities.ApiTokenInput) (string, error) {
	args := m.Called(user, request)
	return args.String(0), args.Error(1)
}

func (m *MockedApplicationService) GetApiTokensByUserID(userID string) ([]entities.ApiToken, error) {
	args := m.Called(userID)
	return args.Get(0).([]entities.ApiToken), args.Error(1)
}

func (m *MockedApplicationService) DeleteApiToken(token string) error {
	args := m.Called(token)
	return args.Error(0)
}

func (m *MockedApplicationService) ListCollection() ([]string, error) {
	args := m.Called()
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockedApplicationService) ListDataBase() ([]string, error) {
	args := m.Called()
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockedApplicationService) UpdateStateTransaction(userRequest entities.UpdateUserState) error {
	args := m.Called(userRequest)
	return args.Error(0)
}

func (m *MockedApplicationService) RbacValidator(userID, resourceID string, rules []string, invitationStatus string) error {
	args := m.Called(userID, resourceID, rules, invitationStatus)
	return args.Error(0)
}

func (m *MockedApplicationService) DeleteProject(projectID string) error {
	args := m.Called(projectID)
	return args.Error(0)
}

func (m *MockedApplicationService) CreateConfig(config authConfig.AuthConfig) error {
	args := m.Called(config)
	return args.Error(0)
}

func (m *MockedApplicationService) GetConfig(key string) (*authConfig.AuthConfig, error) {
	args := m.Called(key)
	return args.Get(0).(*authConfig.AuthConfig), args.Error(1)
}

func (m *MockedApplicationService) UpdateConfig(ctx context.Context, key string, value interface{}) error {
	args := m.Called(ctx, key, value)
	return args.Error(0)
}
