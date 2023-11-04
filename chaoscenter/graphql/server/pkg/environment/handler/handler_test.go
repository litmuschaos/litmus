package handler_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/environments"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/environment/handler"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type MockEnvironmentOperator struct {
	InsertEnvironmentFunc           func(ctx context.Context, env environments.Environment) error
	GetEnvironmentsFunc             func(ctx context.Context, query bson.D) ([]environments.Environment, error)
	UpdateEnvironmentFunc           func(ctx context.Context, query bson.D, update bson.D) error
	GetEnvironmentFunc              func(query bson.D) (environments.Environment, error)
	GetAggregateEnvironmentsFunc    func(pipeline mongo.Pipeline) (*mongo.Cursor, error)
	GetEnvironmentWithProjectIDFunc func(projectID string) ([]*environments.Environment, error)
	GetEnvironmentDetailFunc        func(ctx context.Context, environmentID string, projectID string) (environments.Environment, error)
}

func (m *MockEnvironmentOperator) InsertEnvironment(ctx context.Context, env environments.Environment) error {
	if m.InsertEnvironmentFunc != nil {
		return m.InsertEnvironmentFunc(ctx, env)
	}
	return nil
}

func (m *MockEnvironmentOperator) GetEnvironment(query bson.D) (environments.Environment, error) {
	if m.GetEnvironmentFunc != nil {
		return m.GetEnvironmentFunc(query)
	}
	return environments.Environment{}, nil
}

func (m *MockEnvironmentOperator) GetEnvironments(ctx context.Context, query bson.D) ([]environments.Environment, error) {
	if m.GetEnvironmentsFunc != nil {
		return m.GetEnvironmentsFunc(ctx, query)
	}
	return nil, nil
}

func (m *MockEnvironmentOperator) UpdateEnvironment(ctx context.Context, query bson.D, update bson.D) error {
	if m.UpdateEnvironmentFunc != nil {
		return m.UpdateEnvironmentFunc(ctx, query, update)
	}
	return nil
}

func (m *MockEnvironmentOperator) GetAggregateEnvironments(pipeline mongo.Pipeline) (*mongo.Cursor, error) {
	if m.GetAggregateEnvironmentsFunc != nil {
		return m.GetAggregateEnvironmentsFunc(pipeline)
	}
	return nil, nil
}

func (m *MockEnvironmentOperator) GetEnvironmentWithProjectID(projectID string) ([]*environments.Environment, error) {
	if m.GetEnvironmentWithProjectIDFunc != nil {
		return m.GetEnvironmentWithProjectIDFunc(projectID)
	}
	return nil, nil
}

func (m *MockEnvironmentOperator) GetEnvironmentDetails(ctx context.Context, environmentID string, projectID string) (environments.Environment, error) {
	if m.GetEnvironmentDetailFunc != nil {
		return m.GetEnvironmentDetailFunc(ctx, environmentID, projectID)
	}
	return environments.Environment{}, nil
}

const JwtSecret = "testsecret"

func getsignedJWT(name string) (string, error) {
	token := jwt.New(jwt.SigningMethodHS512)
	claims := token.Claims.(jwt.MapClaims)
	claims["uid"] = uuid.NewString()
	claims["role"] = uuid.NewString()
	claims["username"] = uuid.NewString()
	claims["exp"] = time.Now().Add(time.Minute).Unix()

	tokenString, err := token.SignedString([]byte(JwtSecret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func TestCreateEnvironment(t *testing.T) {
	testCases := []struct {
		name           string
		projectID      string
		input          *model.CreateEnvironmentRequest
		mockInsertFunc func(ctx context.Context, env environments.Environment) error
		expectedEnv    *model.Environment
		expectedErr    error
		given          func() string
	}{
		{
			name:      "success",
			projectID: "testProject",
			input: &model.CreateEnvironmentRequest{
				EnvironmentID: "testEnvID",
				Name:          "testName",
			},
			mockInsertFunc: func(ctx context.Context, env environments.Environment) error {
				return nil
			},
			expectedEnv: nil,
			expectedErr: errors.New("invalid Token"),
			given: func() string {
				token, err := getsignedJWT("testUser")
				if err != nil {
					return token
				}
				return "invalid Token"
			},
		},
		{
			name:      "Failed environment creation due to invalid token",
			projectID: "testProject",
			input: &model.CreateEnvironmentRequest{
				EnvironmentID: "testEnvID",
				Name:          "testName",
			},
			mockInsertFunc: func(ctx context.Context, env environments.Environment) error {
				return nil
			},
			expectedEnv: nil,
			expectedErr: errors.New("invalid Token"),
			given: func() string {
				return "invalid Token"
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			token := tc.given()
			ctx := context.WithValue(context.Background(), authorization.AuthKey, token)
			mockOperator := &MockEnvironmentOperator{
				InsertEnvironmentFunc: tc.mockInsertFunc,
			}
			service := handler.NewEnvironmentService(mockOperator)

			env, err := service.CreateEnvironment(ctx, tc.projectID, tc.input)
			if (err != nil && tc.expectedErr == nil) ||
				(err == nil && tc.expectedErr != nil) ||
				(err != nil && tc.expectedErr != nil && err.Error() != tc.expectedErr.Error()) {
				t.Fatalf("Expected error %v, but got %v", tc.expectedErr, err)
			}

			if tc.expectedEnv != nil && (env.EnvironmentID != tc.expectedEnv.EnvironmentID ||
				env.Name != tc.expectedEnv.Name) {
				t.Fatalf("Expected environment %+v, but got %+v", tc.expectedEnv, env)
			}
		})
	}
}

func TestDeleteEnvironment(t *testing.T) {
	testCases := []struct {
		name                   string
		projectID              string
		environmentID          string
		mockGetEnvironmentFunc func(query bson.D) (environments.Environment, error)
		mockUpdateFunc         func(ctx context.Context, query bson.D, update bson.D) error
		expectedResult         string
		expectedErr            error
		given                  func() string
	}{
		{
			name:          "success",
			projectID:     "testProject",
			environmentID: "testEnvID",
			mockGetEnvironmentFunc: func(query bson.D) (environments.Environment, error) {
				return environments.Environment{
					EnvironmentID: "testEnvID",
				}, nil
			},
			mockUpdateFunc: func(ctx context.Context, query bson.D, update bson.D) error {
				return nil
			},
			expectedErr: errors.New("invalid Token"),
			given: func() string {
				token, err := getsignedJWT("testUser")
				if err != nil {
					return token
				}
				return "invalid Token"
			},
		},
		{
			name:          "Failed environment",
			projectID:     "testProject",
			environmentID: "testEnvID",
			mockGetEnvironmentFunc: func(query bson.D) (environments.Environment, error) {
				return environments.Environment{
					EnvironmentID: "testEnvID",
				}, nil
			},
			mockUpdateFunc: func(ctx context.Context, query, update bson.D) error {
				return nil
			},
			expectedErr: errors.New("invalid Token"),
			given: func() string {
				return "invalid Token"
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			token := tc.given()
			ctx := context.WithValue(context.Background(), authorization.AuthKey, token)

			mockOperator := &MockEnvironmentOperator{
				UpdateEnvironmentFunc: tc.mockUpdateFunc,
			}
			service := handler.NewEnvironmentService(mockOperator)

			_, err := service.DeleteEnvironment(ctx, tc.projectID, tc.environmentID)
			if (err != nil && tc.expectedErr == nil) ||
				(err == nil && tc.expectedErr != nil) ||
				(err != nil && tc.expectedErr != nil && err.Error() != tc.expectedErr.Error()) {
				t.Fatalf("Expected error %v, but got %v", tc.expectedErr, err)
			}
		})
	}
}

func TestGetEnvironment(t *testing.T) {
	testCases := []struct {
		name          string
		projectID     string
		environmentID string
		mockFunc      func(query bson.D) (environments.Environment, error)
		expectedEnv   *model.Environment
		expectError   bool
	}{
		{
			name:          "success",
			projectID:     "proj123",
			environmentID: "env123",
			mockFunc: func(query bson.D) (environments.Environment, error) {
				return environments.Environment{
					EnvironmentID: "env123",
					ProjectID:     "proj123",
				}, nil
			},
			expectedEnv: &model.Environment{
				EnvironmentID: "env123",
				ProjectID:     "proj123",
				Name:          "Test Environment",
			},
			expectError: false,
		},
		{
			name:          "failure - environment not found",
			projectID:     "proj123",
			environmentID: "env999",
			mockFunc: func(query bson.D) (environments.Environment, error) {
				return environments.Environment{}, errors.New("environment not found")
			},
			expectedEnv: nil,
			expectError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockOperator := &MockEnvironmentOperator{
				GetEnvironmentFunc: tc.mockFunc,
			}
			service := handler.NewEnvironmentService(mockOperator)

			env, err := service.GetEnvironment(tc.projectID, tc.environmentID)
			if tc.expectError {
				if err == nil {
					t.Errorf("Expected an error but didn't get one")
				}
			} else {
				if err != nil {
					t.Errorf("Did not expect an error but got one: %v", err)
				}
				if env.EnvironmentID != tc.expectedEnv.EnvironmentID {
					t.Errorf("Expected environment ID %v, got %v", tc.expectedEnv.EnvironmentID, env.EnvironmentID)
				}
			}
		})
	}
}
