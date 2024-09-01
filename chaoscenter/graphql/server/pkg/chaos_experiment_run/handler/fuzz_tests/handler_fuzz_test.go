package fuzz_tests

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run/handler"
	chaosInfraMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure/model/mocks"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbGitOpsMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops/model/mocks"

	fuzz "github.com/AdaLogics/go-fuzz-headers"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	typesMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run/model/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type MockServices struct {
	ChaosExperimentRunService  *typesMocks.ChaosExperimentRunService
	InfrastructureService      *chaosInfraMocks.InfraService
	GitOpsService              *dbGitOpsMocks.GitOpsService
	ChaosExperimentOperator    *dbChaosExperiment.Operator
	ChaosExperimentRunOperator *dbChaosExperimentRun.Operator
	MongodbOperator            *dbMocks.MongoOperator
	ChaosExperimentRunHandler  *handler.ChaosExperimentRunHandler
}

func NewMockServices() *MockServices {
	var (
		mongodbMockOperator        = new(dbMocks.MongoOperator)
		infrastructureService      = new(chaosInfraMocks.InfraService)
		gitOpsService              = new(dbGitOpsMocks.GitOpsService)
		chaosExperimentRunService  = new(typesMocks.ChaosExperimentRunService)
		chaosExperimentOperator    = dbChaosExperiment.NewChaosExperimentOperator(mongodbMockOperator)
		chaosExperimentRunOperator = dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodbMockOperator)
	)
	var chaosExperimentRunHandler = handler.NewChaosExperimentRunHandler(
		chaosExperimentRunService,
		infrastructureService,
		gitOpsService,
		chaosExperimentOperator,
		chaosExperimentRunOperator,
		mongodbMockOperator,
	)
	return &MockServices{
		ChaosExperimentRunService:  chaosExperimentRunService,
		InfrastructureService:      infrastructureService,
		GitOpsService:              gitOpsService,
		ChaosExperimentOperator:    chaosExperimentOperator,
		ChaosExperimentRunOperator: chaosExperimentRunOperator,
		MongodbOperator:            mongodbMockOperator,
		ChaosExperimentRunHandler:  chaosExperimentRunHandler,
	}
}

func FuzzGetExperimentRun(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			ProjectID       string
			ExperimentRunID string
			NotifyID        string
		}{}

		targetStruct.ProjectID = uuid.New().String()

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		ctx := context.Background()
		mockServices := NewMockServices()
		findResult := []interface{}{bson.D{
			{Key: "experiment_run_id", Value: targetStruct.ExperimentRunID},
			{Key: "project_id", Value: targetStruct.ProjectID},
			{Key: "infra_id", Value: "mockInfraID"},
			{Key: "kubernetesInfraDetails", Value: bson.A{
				bson.D{
					{Key: "InfraID", Value: "mockInfraID"},
					{Key: "Name", Value: "MockInfra"},
					{Key: "EnvironmentID", Value: "mockEnvID"},
					{Key: "Description", Value: "Mock Infrastructure"},
					{Key: "PlatformName", Value: "Kubernetes"},
					{Key: "IsActive", Value: true},
					{Key: "UpdatedAt", Value: time.Now().Unix()},
					{Key: "CreatedAt", Value: time.Now().Unix()},
				},
			}},
			{Key: "experiment", Value: bson.A{
				bson.D{
					{Key: "ExperimentName", Value: "MockExperiment"},
					{Key: "ExperimentType", Value: "MockType"},
					{Key: "Revision", Value: bson.A{
						bson.D{
							{Key: "RevisionID", Value: uuid.NewString()},
							{Key: "ExperimentManifest", Value: "mockManifest"},
							{Key: "Weightages", Value: bson.A{
								bson.D{{Key: "FaultName", Value: "fault1"}, {Key: "Weightage", Value: 10}},
								bson.D{{Key: "FaultName", Value: "fault2"}, {Key: "Weightage", Value: 20}},
							}},
						},
					}},
				},
			}},
		}}

		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mockServices.MongodbOperator.On("Aggregate", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		res, err := mockServices.ChaosExperimentRunHandler.GetExperimentRun(ctx, targetStruct.ProjectID, &targetStruct.ExperimentRunID, &targetStruct.NotifyID)
		if err != nil {
			t.Errorf("ChaosExperimentRunHandler.GetExperimentRun() error = %v", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}
	})
}

func FuzzListExperimentRun(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			ProjectID string
			Request   model.ListExperimentRunRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		findResult := []interface{}{bson.D{
			{Key: "project_id", Value: targetStruct.ProjectID},
			{Key: "infra_id", Value: "abc"},
			{
				Key: "revision", Value: []dbChaosExperiment.ExperimentRevision{
					{
						RevisionID: uuid.NewString(),
					},
				},
			},
		}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		res, err := mockServices.ChaosExperimentRunHandler.ListExperimentRun(targetStruct.ProjectID, targetStruct.Request)
		if err != nil {
			t.Errorf("ListExperimentRun() error = %v", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}

	})
}

func FuzzRunChaosWorkFlow(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			ProjectID string
			Workflow  dbChaosExperiment.ChaosExperimentRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("StartSession").Return(mock.Anything, nil).Once()
		mockServices.MongodbOperator.On("Update", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, nil).Once()
		mockServices.MongodbOperator.On("CommitTransaction", mock.Anything).Return(nil).Once()
		mockServices.MongodbOperator.On("AbortTransaction", mock.Anything).Return(nil).Once()

		findResult := []interface{}{bson.D{
			{Key: "infra_id", Value: targetStruct.ProjectID},
		}}
		singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
		mockServices.MongodbOperator.On("Get", mock.Anything, mock.Anything, mock.Anything).Return(singleResult, nil).Once()

		res, err := mockServices.ChaosExperimentRunHandler.RunChaosWorkFlow(context.Background(), targetStruct.ProjectID, targetStruct.Workflow, nil)
		if strings.Contains(err.Error(), "inactive infra") {
			t.Log("Handled expected error due to inactive infrastructure: ", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}
	})
}

func FuzzGetExperimentRunStats(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			ProjectID string
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		targetStruct.ProjectID = uuid.New().String()

		mockServices := NewMockServices()

		findResult := []interface{}{bson.D{
			{Key: "project_id", Value: targetStruct.ProjectID},
			{Key: "infra_id", Value: "abc"},
			{
				Key: "revision", Value: []dbChaosExperiment.ExperimentRevision{
					{
						RevisionID: uuid.NewString(),
					},
				},
			},
		}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		res, err := mockServices.ChaosExperimentRunHandler.GetExperimentRunStats(context.Background(), targetStruct.ProjectID)
		if err != nil {
			t.Errorf("GetExperimentRunStats() error = %v", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}
	})
}
