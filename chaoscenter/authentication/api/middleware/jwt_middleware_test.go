package middleware_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/middleware"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MockApplicationService struct{}

// AddMember implements services.ApplicationService.
func (m *MockApplicationService) AddMember(projectID string, member *entities.Member) error {
	panic("unimplemented")
}

// CheckPasswordHash implements services.ApplicationService.
func (m *MockApplicationService) CheckPasswordHash(hash string, password string) error {
	panic("unimplemented")
}

// CreateApiToken implements services.ApplicationService.
func (m *MockApplicationService) CreateApiToken(user *entities.User, request entities.ApiTokenInput) (string, error) {
	panic("unimplemented")
}

// CreateProject implements services.ApplicationService.
func (m *MockApplicationService) CreateProject(project *entities.Project) error {
	panic("unimplemented")
}

// CreateUser implements services.ApplicationService.
func (m *MockApplicationService) CreateUser(user *entities.User) (*entities.User, error) {
	panic("unimplemented")
}

// DeleteApiToken implements services.ApplicationService.
func (m *MockApplicationService) DeleteApiToken(token string) error {
	panic("unimplemented")
}

// FindUserByUsername implements services.ApplicationService.
func (m *MockApplicationService) FindUserByUsername(username string) (*entities.User, error) {
	panic("unimplemented")
}

// FindUsersByUID implements services.ApplicationService.
func (m *MockApplicationService) FindUsersByUID(uid []string) (*[]entities.User, error) {
	panic("unimplemented")
}

// GetAggregateProjects implements services.ApplicationService.
func (m *MockApplicationService) GetAggregateProjects(pipeline mongo.Pipeline, opts *options.AggregateOptions) (*mongo.Cursor, error) {
	panic("unimplemented")
}

// GetApiTokensByUserID implements services.ApplicationService.
func (m *MockApplicationService) GetApiTokensByUserID(userID string) ([]entities.ApiToken, error) {
	panic("unimplemented")
}

// GetOwnerProjectIDs implements services.ApplicationService.
func (m *MockApplicationService) GetOwnerProjectIDs(ctx context.Context, userID string) ([]*entities.Project, error) {
	panic("unimplemented")
}

// GetProjectByProjectID implements services.ApplicationService.
func (m *MockApplicationService) GetProjectByProjectID(projectID string) (*entities.Project, error) {
	panic("unimplemented")
}

// GetProjectMembers implements services.ApplicationService.
func (m *MockApplicationService) GetProjectMembers(projectID string, state string) ([]*entities.Member, error) {
	panic("unimplemented")
}

// GetProjectRole implements services.ApplicationService.
func (m *MockApplicationService) GetProjectRole(projectID string, userID string) (*entities.MemberRole, error) {
	panic("unimplemented")
}

// GetProjectStats implements services.ApplicationService.
func (m *MockApplicationService) GetProjectStats() ([]*entities.ProjectStats, error) {
	panic("unimplemented")
}

// GetProjects implements services.ApplicationService.
func (m *MockApplicationService) GetProjects(query primitive.D) ([]*entities.Project, error) {
	panic("unimplemented")
}

// GetProjectsByUserID implements services.ApplicationService.
func (m *MockApplicationService) GetProjectsByUserID(uid string, isOwner bool) ([]*entities.Project, error) {
	panic("unimplemented")
}

// GetSignedJWT implements services.ApplicationService.
func (m *MockApplicationService) GetSignedJWT(user *entities.User) (string, error) {
	panic("unimplemented")
}

// GetUser implements services.ApplicationService.
func (m *MockApplicationService) GetUser(uid string) (*entities.User, error) {
	panic("unimplemented")
}

// GetUsers implements services.ApplicationService.
func (m *MockApplicationService) GetUsers() (*[]entities.User, error) {
	panic("unimplemented")
}

// InviteUsers implements services.ApplicationService.
func (m *MockApplicationService) InviteUsers(invitedUsers []string) (*[]entities.User, error) {
	panic("unimplemented")
}

// IsAdministrator implements services.ApplicationService.
func (m *MockApplicationService) IsAdministrator(user *entities.User) error {
	panic("unimplemented")
}

// ListCollection implements services.ApplicationService.
func (m *MockApplicationService) ListCollection() ([]string, error) {
	panic("unimplemented")
}

// ListDataBase implements services.ApplicationService.
func (m *MockApplicationService) ListDataBase() ([]string, error) {
	panic("unimplemented")
}

// ListInvitations implements services.ApplicationService.
func (m *MockApplicationService) ListInvitations(userID string, invitationState entities.Invitation) ([]*entities.Project, error) {
	panic("unimplemented")
}

// LoginUser implements services.ApplicationService.
func (m *MockApplicationService) LoginUser(user *entities.User) (*entities.User, error) {
	panic("unimplemented")
}

// RemoveInvitation implements services.ApplicationService.
func (m *MockApplicationService) RemoveInvitation(projectID string, userID string, invitation entities.Invitation) error {
	panic("unimplemented")
}

// RevokeToken implements services.ApplicationService.
func (m *MockApplicationService) RevokeToken(tokenString string) error {
	panic("unimplemented")
}

// UpdateInvite implements services.ApplicationService.
func (m *MockApplicationService) UpdateInvite(projectID string, userID string, invitation entities.Invitation, role *entities.MemberRole) error {
	panic("unimplemented")
}

// UpdatePassword implements services.ApplicationService.
func (m *MockApplicationService) UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error {
	panic("unimplemented")
}

// UpdateProjectName implements services.ApplicationService.
func (m *MockApplicationService) UpdateProjectName(projectID string, projectName string) error {
	panic("unimplemented")
}

// UpdateProjectState implements services.ApplicationService.
func (m *MockApplicationService) UpdateProjectState(ctx context.Context, userID string, deactivateTime int64, isDeactivate bool) error {
	panic("unimplemented")
}

// UpdateStateTransaction implements services.ApplicationService.
func (m *MockApplicationService) UpdateStateTransaction(userRequest entities.UpdateUserState) error {
	panic("unimplemented")
}

// UpdateUser implements services.ApplicationService.
func (m *MockApplicationService) UpdateUser(user *entities.UserDetails) error {
	panic("unimplemented")
}

// UpdateUserState implements services.ApplicationService.
func (m *MockApplicationService) UpdateUserState(ctx context.Context, username string, isDeactivate bool, deactivateTime int64) error {
	panic("unimplemented")
}

func (m *MockApplicationService) ValidateToken(tokenString string) (*jwt.Token, error) {
	return nil, nil
}

func TestJwtMiddleware(t *testing.T) {
	// Initialize Gin Engine
	router := gin.Default()

	// Set up the middleware with the mock service
	mockService := &MockApplicationService{}
	router.Use(middleware.JwtMiddleware(mockService))

	// Define a test route that uses the middleware
	router.GET("/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Access Granted"})
	})

	// Helper function to create requests
	createRequest := func(token string) *httptest.ResponseRecorder {
		req := httptest.NewRequest("GET", "/status", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		return w
	}

	// Subtest for Valid Token
	t.Run("Valid Token", func(t *testing.T) {
		wValid := createRequest("jwtstring")
		assert.Equal(t, http.StatusOK, wValid.Code)
	})

	// Subtest for Missing Authorization Header
	t.Run("Missing Authorization Header", func(t *testing.T) {
		wMissingHeader := httptest.NewRecorder()
		reqMissingHeader := httptest.NewRequest("GET", "/status", nil)
		router.ServeHTTP(wMissingHeader, reqMissingHeader)
		assert.Equal(t, http.StatusUnauthorized, wMissingHeader.Code)
	})
}
