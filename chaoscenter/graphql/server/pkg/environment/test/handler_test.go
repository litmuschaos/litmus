package test

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
	dbOperationsEnvironment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/environments"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/environment/handler"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	mongodbMockOperator = new(dbMocks.MongoOperator)
	environmentOperator = dbOperationsEnvironment.NewEnvironmentOperator(mongodbMockOperator)
)

var JwtSecret = "testsecret"

func GetSignedJWT(name string) (string, error) {
	token := jwt.New(jwt.SigningMethodHS512)
	claims := token.Claims.(jwt.MapClaims)
	claims["uid"] = uuid.NewString()
	claims["role"] = uuid.NewString()
	claims["username"] = name
	claims["exp"] = time.Now().Add(time.Minute).Unix()

	tokenString, err := token.SignedString([]byte(JwtSecret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func TestCreateEnvironment(t *testing.T) {
	utils.Config.JwtSecret = JwtSecret
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
				token, err := GetSignedJWT("testUser")
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
			mongodbMockOperator.On("Insert", mock.Anything, mock.AnythingOfType("environments.Environment")).
				Return(tc.mockInsertFunc)
			token := tc.given()
			ctx := context.WithValue(context.Background(), authorization.AuthKey, token)
			mockOperator := environmentOperator
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
	utils.Config.JwtSecret = JwtSecret
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
				token, err := GetSignedJWT("testUser")
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
			mongodbMockOperator.On("Insert", mock.Anything, mock.AnythingOfType("environments.Environment")).
				Return(tc.mockUpdateFunc)
			token := tc.given()
			ctx := context.WithValue(context.Background(), authorization.AuthKey, token)

			mockOperator := environmentOperator
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
