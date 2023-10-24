package handler_test

import (
	"context"
	"errors"
	"testing"

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

func TestCreateEnvironment(t *testing.T) {
	testCases := []struct {
		name           string
		projectID      string
		input          *model.CreateEnvironmentRequest
		token          string
		mockInsertFunc func(ctx context.Context, env environments.Environment) error
		expectedEnv    *model.Environment
		expectedErr    error
	}{
		{
			name:      "Failed environment creation due to invalid token",
			projectID: "testProject",
			input: &model.CreateEnvironmentRequest{
				EnvironmentID: "testEnvID",
				Name:          "testName",
			},
			token: "invalidToken",
			mockInsertFunc: func(ctx context.Context, env environments.Environment) error {
				return nil
			},
			expectedEnv: nil,
			expectedErr: errors.New("invalid Token"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			ctx := context.WithValue(context.Background(), authorization.AuthKey, tc.token)
			mockOperator := &MockEnvironmentOperator{
				InsertEnvironmentFunc: tc.mockInsertFunc,
			}
			service := handler.NewEnvironmentService(mockOperator)
			//service := handler.NewEnvironmentService(operator)

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
		token                  string
		mockGetEnvironmentFunc func(query bson.D) (environments.Environment, error)
		mockUpdateFunc         func(ctx context.Context, query bson.D, update bson.D) error
		expectedResult         string
		expectedErr            error
	}{
		{
			name:          "Failed environment deletion due to invalid token",
			projectID:     "testProject",
			environmentID: "testEnvID",
			token:         "invalidToken",
			mockGetEnvironmentFunc: func(query bson.D) (environments.Environment, error) {
				return environments.Environment{
					EnvironmentID: "testEnvID",
				}, nil
			},
			mockUpdateFunc: func(ctx context.Context, query bson.D, update bson.D) error {
				return nil
			},
			expectedErr: errors.New("invalid Token"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			ctx := context.WithValue(context.Background(), authorization.AuthKey, tc.token)

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
