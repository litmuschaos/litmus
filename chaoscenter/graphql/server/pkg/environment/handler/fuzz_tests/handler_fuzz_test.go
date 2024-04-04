package fuzz_tests

import (
	"context"
	"testing"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	dbOperationsEnvironment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/environments"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/environment/handler"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
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

func FuzzCreateEnvironment(f *testing.F) {
	utils.Config.JwtSecret = JwtSecret
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			input     model.CreateEnvironmentRequest
			projectID string
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		mongodbMockOperator.On("Create", mock.Anything, mongodb.EnvironmentCollection, mock.Anything).Return(nil).Once()
		token, err := GetSignedJWT("testUser")
		if err != nil {
			logrus.Errorf("Error genrating token %v", err)
		}

		ctx := context.WithValue(context.Background(), authorization.AuthKey, token)
		service := handler.NewEnvironmentService(environmentOperator)

		env, err := service.CreateEnvironment(ctx, targetStruct.projectID, &targetStruct.input)
		if err != nil {
			t.Errorf("Unexpected error: %v", err)
		}
		if env == nil {
			t.Errorf("Returned environment is nil")
		}
	})
}

func FuzzTestDeleteEnvironment(f *testing.F) {
	utils.Config.JwtSecret = JwtSecret
	testCases := []struct {
		projectID     string
		environmentID string
	}{
		{
			projectID:     "testProject",
			environmentID: "testEnvID",
		},
	}
	for _, tc := range testCases {
		f.Add(tc.projectID, tc.environmentID)
	}

	f.Fuzz(func(t *testing.T, projectID string, environmentID string) {

		findResult := []interface{}{bson.D{
			{Key: "environment_id", Value: environmentID},
			{Key: "project_id", Value: projectID},
		}}
		singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
		mongodbMockOperator.On("Get", mock.Anything, mongodb.EnvironmentCollection, mock.Anything).Return(singleResult, nil).Once()
		mongodbMockOperator.On("UpdateMany", mock.Anything, mongodb.EnvironmentCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, nil).Once()
		token, err := GetSignedJWT("testUser")
		if err != nil {
			logrus.Errorf("Error genrating token %v", err)
		}

		ctx := context.WithValue(context.Background(), authorization.AuthKey, token)
		service := handler.NewEnvironmentService(environmentOperator)

		env, err := service.DeleteEnvironment(ctx, projectID, environmentID)
		if err != nil {
			t.Errorf("Unexpected error: %v", err)
		}

		if env == "" {
			t.Errorf("Returned environment is nil")
		}
	})
}

func FuzzTestGetEnvironment(f *testing.F) {
	utils.Config.JwtSecret = JwtSecret
	testCases := []struct {
		projectID     string
		environmentID string
	}{
		{
			projectID:     "testProject",
			environmentID: "testEnvID",
		},
	}
	for _, tc := range testCases {
		f.Add(tc.projectID, tc.environmentID)
	}

	f.Fuzz(func(t *testing.T, projectID string, environmentID string) {

		findResult := []interface{}{bson.D{
			{Key: "environment_id", Value: environmentID},
			{Key: "project_id", Value: projectID},
		}}
		singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
		mongodbMockOperator.On("Get", mock.Anything, mongodb.EnvironmentCollection, mock.Anything).Return(singleResult, nil).Once()
		service := handler.NewEnvironmentService(environmentOperator)

		env, err := service.GetEnvironment(projectID, environmentID)
		if err != nil {
			t.Errorf("Unexpected error: %v", err)
		}

		if env == nil {
			t.Errorf("Returned environment is nil")
		}
	})
}
