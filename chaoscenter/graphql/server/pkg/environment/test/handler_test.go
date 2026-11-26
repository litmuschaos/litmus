package test

import (
	"context"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/environments"
	dbOperationsEnvironment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/environments"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/environment/handler"
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
			expectedErr: nil,
			given: func() string {
				token, err := GetSignedJWT("testUser")
				if err != nil {
					return token
				}
				return "invalid Token"
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mongodbMockOperator.On("Create", mock.Anything, mock.Anything, mock.AnythingOfType("environments.Environment")).
				Return(nil)
			token := tc.given()
			ctx := context.WithValue(context.Background(), authorization.AuthKey, token)
			mockOperator := environmentOperator
			service := handler.NewEnvironmentService(mockOperator)

			env, err := service.CreateEnvironment(ctx, tc.projectID, tc.input, "")
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
	findResult := []interface{}{bson.D{
		{Key: "environment_id", Value: "testEnvID"},
	}}
	singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
	testCases := []struct {
		name                   string
		projectID              string
		environmentID          string
		mockGetEnvironmentFunc *mongo.SingleResult
		mockUpdateFunc         *mongo.UpdateResult
		expectedResult         string
		expectedErr            error
		given                  func() string
	}{
		{
			name:                   "success",
			projectID:              "testProject",
			environmentID:          "testEnvID",
			mockGetEnvironmentFunc: singleResult,
			mockUpdateFunc:         &mongo.UpdateResult{},
			expectedErr:            nil,
			given: func() string {
				token, err := GetSignedJWT("testUser")
				if err != nil {
					return token
				}
				return "invalid Token"
			},
		}}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {

			mongodbMockOperator.On("Get", mock.Anything, mock.Anything, mock.Anything).Return(tc.mockGetEnvironmentFunc, nil)
			mongodbMockOperator.On("UpdateMany", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
				Return(tc.mockUpdateFunc, nil)
			token := tc.given()
			ctx := context.WithValue(context.Background(), authorization.AuthKey, token)

			mockOperator := environmentOperator
			service := handler.NewEnvironmentService(mockOperator)

			_, err := service.DeleteEnvironment(ctx, tc.projectID, tc.environmentID, "")
			if (err != nil && tc.expectedErr == nil) ||
				(err == nil && tc.expectedErr != nil) ||
				(err != nil && tc.expectedErr != nil && err.Error() != tc.expectedErr.Error()) {
				t.Fatalf("Expected error %v, but got %v", tc.expectedErr, err)
			}
		})
	}
}

func TestListEnvironmentsPreservesTotalOnEmptyPage(t *testing.T) {
	op := new(dbMocks.MongoOperator)
	findResult := []interface{}{bson.D{
		{Key: "total_filtered_environments", Value: bson.A{bson.D{{Key: "count", Value: 16}}}},
		{Key: "environments", Value: bson.A{}},
	}}
	cursor, err := mongo.NewCursorFromDocuments(findResult, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	op.On("Aggregate", mock.Anything, mongodb.EnvironmentCollection, mock.Anything, mock.Anything).
		Return(cursor, nil).Once()
	service := handler.NewEnvironmentService(dbOperationsEnvironment.NewEnvironmentOperator(op))
	response, err := service.ListEnvironments("testProject", &model.ListEnvironmentRequest{
		Pagination: &model.Pagination{Page: 2, Limit: 15},
	})
	if err != nil {
		t.Fatal(err)
	}
	op.AssertExpectations(t)
	if len(response.Environments) != 0 {
		t.Fatalf("Expected empty page, but got %d environments", len(response.Environments))
	}
	if response.TotalNoOfEnvironments != 16 {
		t.Fatalf("Expected total environment count 16, but got %d", response.TotalNoOfEnvironments)
	}
}
