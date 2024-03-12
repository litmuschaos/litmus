package fuzz_tests

import (
	"context"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/handler"
	chaosExperimentMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/model/mocks"
	chaosExperimentRunMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run/model/mocks"
	chaosInfraMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure/model/mocks"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbGitOpsMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops/model/mocks"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbChoasInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type MockServices struct {
	ChaosExperimentService     *chaosExperimentMocks.ChaosExperimentService
	ChaosExperimentRunService  *chaosExperimentRunMocks.ChaosExperimentRunService
	InfrastructureService      *chaosInfraMocks.InfraService
	GitOpsService              *dbGitOpsMocks.GitOpsService
	ChaosExperimentOperator    *dbChaosExperiment.Operator
	ChaosExperimentRunOperator *dbChaosExperimentRun.Operator
	MongodbOperator            *dbMocks.MongoOperator
	ChaosExperimentHandler     *handler.ChaosExperimentHandler
}

func NewMockServices() *MockServices {
	var (
		mongodbMockOperator        = new(dbMocks.MongoOperator)
		infrastructureService      = new(chaosInfraMocks.InfraService)
		chaosExperimentRunService  = new(chaosExperimentRunMocks.ChaosExperimentRunService)
		gitOpsService              = new(dbGitOpsMocks.GitOpsService)
		chaosExperimentOperator    = dbChaosExperiment.NewChaosExperimentOperator(mongodbMockOperator)
		chaosExperimentRunOperator = dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodbMockOperator)
		chaosExperimentService     = new(chaosExperimentMocks.ChaosExperimentService)
	)
	var chaosExperimentHandler = handler.NewChaosExperimentHandler(chaosExperimentService, chaosExperimentRunService, infrastructureService, gitOpsService, chaosExperimentOperator, chaosExperimentRunOperator, mongodbMockOperator)
	return &MockServices{
		ChaosExperimentService:     chaosExperimentService,
		ChaosExperimentRunService:  chaosExperimentRunService,
		InfrastructureService:      infrastructureService,
		GitOpsService:              gitOpsService,
		ChaosExperimentOperator:    chaosExperimentOperator,
		ChaosExperimentRunOperator: chaosExperimentRunOperator,
		MongodbOperator:            mongodbMockOperator,
		ChaosExperimentHandler:     chaosExperimentHandler,
	}
}

func FuzzSaveChaosExperiment(f *testing.F) {

	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		experimentType := dbChaosExperiment.NonCronExperiment
		targetStruct := &struct {
			projectID string
			request   model.SaveChaosExperimentRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
		ctx := context.Background()
		ctx = context.WithValue(ctx, authorization.AuthKey, username)
		findResult := []interface{}{bson.D{
			{Key: "experiment_id", Value: targetStruct.request.ID},
		}}
		mockServices := NewMockServices()
		singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
		mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()

		mockServices.ChaosExperimentService.On("ProcessExperiment", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(&model.ChaosExperimentRequest{
			ExperimentID:   &targetStruct.request.ID,
			InfraID:        targetStruct.request.InfraID,
			ExperimentType: &model.AllExperimentType[0],
		}, &experimentType, nil).Once()

		mockServices.ChaosExperimentService.On("ProcessExperimentUpdate", mock.Anything, mock.Anything, mock.Anything, mock.Anything, false, mock.Anything, mock.Anything).Return(nil).Once()
		mockServices.GitOpsService.On("UpsertExperimentToGit", ctx, mock.Anything, mock.Anything).Return(nil).Once()
		store := store.NewStore()
		res, err := mockServices.ChaosExperimentHandler.SaveChaosExperiment(ctx, targetStruct.request, targetStruct.projectID, store)
		if err != nil {
			t.Errorf("ChaosExperimentHandler.SaveChaosExperiment() error = %v", err)
			return
		}
		if res == "" {
			t.Errorf("Returned environment is nil")
		}
	})
}

func FuzzDeleteChaosExperiment(f *testing.F) {

	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID       string
			experimentId    string
			experimentRunID string
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		logrus.Info("here", targetStruct)
		username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
		ctx := context.Background()
		ctx = context.WithValue(ctx, authorization.AuthKey, username)
		findResult := []interface{}{bson.D{
			{Key: "experiment_id", Value: targetStruct.experimentId},
			{Key: "experiment_runs", Value: []*dbChaosExperimentRun.ChaosExperimentRun{
				{ExperimentRunID: targetStruct.experimentRunID},
			}},
		}}
		mockServices := NewMockServices()
		singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
		mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()

		mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything).Return(singleResult, nil).Once()

		mockServices.ChaosExperimentRunService.On("ProcessExperimentRunDelete", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()

		store := store.NewStore()
		res, err := mockServices.ChaosExperimentHandler.DeleteChaosExperiment(ctx, targetStruct.projectID, targetStruct.experimentId, &targetStruct.experimentRunID, store)
		if err != nil {
			t.Errorf("ChaosExperimentHandler.DeleteChaosExperiment() error = %v", err)
			return
		}
		if res == false {
			t.Errorf("Returned response is false")
		}
	})
}

func FuzzUpdateChaosExperiment(f *testing.F) {

	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID  string
			experiment model.ChaosExperimentRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		experimentType := dbChaosExperiment.NonCronExperiment
		username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
		ctx := context.Background()
		ctx = context.WithValue(ctx, authorization.AuthKey, username)
		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("CountDocuments", ctx, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(int64(0), nil).Once()
		mockServices.ChaosExperimentService.On("ProcessExperiment", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(&model.ChaosExperimentRequest{
			ExperimentID:   new(string),
			InfraID:        "abc",
			ExperimentType: &model.AllExperimentType[0],
		}, &experimentType, nil).Once()
		mockServices.ChaosExperimentService.On("ProcessExperimentUpdate", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
		mockServices.GitOpsService.On("UpsertExperimentToGit", ctx, mock.Anything, mock.Anything).Return(nil).Once()
		store := store.NewStore()
		res, err := mockServices.ChaosExperimentHandler.UpdateChaosExperiment(ctx, targetStruct.experiment, targetStruct.projectID, store)
		if err != nil {
			t.Errorf("ChaosExperimentHandler.UpdateChaosExperiment() error = %v", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}
	})
}

func FuzzGetExperiment(f *testing.F) {

	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID    string
			experimentId string
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
		ctx := context.Background()
		ctx = context.WithValue(ctx, authorization.AuthKey, username)
		mockServices := NewMockServices()
		findResult := []interface{}{bson.D{
			{Key: "project_id", Value: targetStruct.projectID},
			{Key: "infra_id", Value: "abc"},
			{Key: "kubernetesInfraDetails", Value: []dbChoasInfra.ChaosInfra{
				{
					ProjectID: targetStruct.projectID,
					InfraID:   "abc",
				},
			}},
			{
				Key: "revision", Value: []dbChaosExperiment.ExperimentRevision{
					{
						RevisionID: uuid.NewString(),
					},
				},
			},
		}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		res, err := mockServices.ChaosExperimentHandler.GetExperiment(ctx, targetStruct.experimentId, targetStruct.projectID)
		if err != nil {
			t.Errorf("ChaosExperimentHandler.GetExperiment() error = %v", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}
	})
}

func FuzzListExperiment(f *testing.F) {

	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID string
			request   model.ListExperimentRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
		ctx := context.Background()
		ctx = context.WithValue(ctx, authorization.AuthKey, username)
		mockServices := NewMockServices()
		findResult := []interface{}{
			bson.D{
				{Key: "project_id", Value: targetStruct.projectID},
				{Key: "infra_id", Value: "abc"},
			}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		res, err := mockServices.ChaosExperimentHandler.ListExperiment(targetStruct.projectID, targetStruct.request)
		if err != nil {
			t.Errorf("ChaosExperimentHandler.ListExperiment() error = %v", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}
	})
}

func FuzzDisableCronExperiment(f *testing.F) {

	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID string
			request   dbChaosExperiment.ChaosExperimentRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		if len(targetStruct.request.Revision) < 1 {
			return
		}
		username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
		ctx := context.Background()
		ctx = context.WithValue(ctx, authorization.AuthKey, username)
		mockServices := NewMockServices()
		mockServices.ChaosExperimentService.On("ProcessExperimentUpdate", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()

		err = mockServices.ChaosExperimentHandler.DisableCronExperiment(username, targetStruct.request, targetStruct.projectID, store.NewStore())
		if err != nil {
			t.Errorf("ChaosExperimentHandler.DisableCronExperiment() error = %v", err)
			return
		}

	})
}

func FuzzGetExperimentStats(f *testing.F) {

	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID string
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
		ctx := context.Background()
		ctx = context.WithValue(ctx, authorization.AuthKey, username)
		mockServices := NewMockServices()
		findResult := []interface{}{
			bson.D{
				{Key: "project_id", Value: targetStruct.projectID},
			},
		}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		res, err := mockServices.ChaosExperimentHandler.GetExperimentStats(ctx, targetStruct.projectID)
		if err != nil {
			t.Errorf("ChaosExperimentHandler.DisableCronExperiment() error = %v", err)
			return
		}

		if res == nil {
			t.Errorf("response is nil")
		}

	})
}
