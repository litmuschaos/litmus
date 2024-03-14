package handler

import (
	"context"
	"errors"
	"reflect"
	"testing"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	chaosExperimentMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/model/mocks"
	chaosExperimentRunMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run/model/mocks"
	chaosInfraMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure/model/mocks"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChoasInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	"github.com/stretchr/testify/mock"

	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbGitOpsMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops/model/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
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
	ChaosExperimentHandler     *ChaosExperimentHandler
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
	var chaosExperimentHandler = NewChaosExperimentHandler(chaosExperimentService, chaosExperimentRunService, infrastructureService, gitOpsService, chaosExperimentOperator, chaosExperimentRunOperator, mongodbMockOperator)
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

func assertExpectations(mockServices *MockServices, t *testing.T) {
	mockServices.ChaosExperimentService.AssertExpectations(t)
	mockServices.ChaosExperimentRunService.AssertExpectations(t)
	mockServices.InfrastructureService.AssertExpectations(t)
	mockServices.GitOpsService.AssertExpectations(t)
	mockServices.MongodbOperator.AssertExpectations(t)
}

func TestChaosExperimentHandler_SaveChaosExperiment(t *testing.T) {

	type args struct {
		request   model.SaveChaosExperimentRequest
		request2  *model.ChaosExperimentRequest
		projectID string
	}

	username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
	ctx := context.Background()
	projectId := uuid.New().String()
	experimentId := uuid.New().String()
	experimentType := dbChaosExperiment.NonCronExperiment
	infraId := uuid.New().String()

	store := store.NewStore()
	tests := []struct {
		name    string
		args    args
		wantErr bool
		given   func(request *model.ChaosExperimentRequest, mockServices *MockServices)
	}{
		{
			name: "Save Chaos Experiment",
			args: args{
				projectID: projectId,
				request: model.SaveChaosExperimentRequest{
					ID:      experimentId,
					Type:    &model.AllExperimentType[0],
					InfraID: infraId,
				},
				request2: &model.ChaosExperimentRequest{
					ExperimentID:   &experimentId,
					InfraID:        infraId,
					ExperimentType: &model.AllExperimentType[0],
				},
			},
			given: func(request2 *model.ChaosExperimentRequest, mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := []interface{}{bson.D{
					{Key: "experiment_id", Value: experimentId},
				}}
				singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()

				mockServices.ChaosExperimentService.On("ProcessExperiment", mock.Anything, request2, mock.Anything, mock.Anything).Return(request2, &experimentType, nil).Once()

				mockServices.ChaosExperimentService.On("ProcessExperimentUpdate", request2, mock.Anything, mock.Anything, mock.Anything, false, mock.Anything, mock.Anything).Return(nil).Once()
				mockServices.GitOpsService.On("UpsertExperimentToGit", ctx, mock.Anything, request2).Return(nil).Once()
			},
			wantErr: false,
		},
		{
			name: "Failure: mongo error",
			args: args{
				projectID: projectId,
				request: model.SaveChaosExperimentRequest{
					ID:      experimentId,
					Type:    &model.AllExperimentType[0],
					InfraID: infraId,
				},
				request2: &model.ChaosExperimentRequest{
					ExperimentID:   &experimentId,
					InfraID:        infraId,
					ExperimentType: &model.AllExperimentType[0],
				},
			},
			given: func(request2 *model.ChaosExperimentRequest, mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, errors.New("single result error")).Once()
			},
			wantErr: true,
		},
		{
			name: "Failed to process experiment",
			args: args{
				projectID: projectId,
				request: model.SaveChaosExperimentRequest{
					ID:      experimentId,
					Type:    &model.AllExperimentType[0],
					InfraID: infraId,
				},
				request2: &model.ChaosExperimentRequest{
					ExperimentID:   &experimentId,
					InfraID:        infraId,
					ExperimentType: &model.AllExperimentType[0],
				},
			},
			given: func(request2 *model.ChaosExperimentRequest, mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := []interface{}{bson.D{
					{Key: "experiment_id", Value: experimentId},
				}}
				singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()

				mockServices.ChaosExperimentService.On("ProcessExperiment", mock.Anything, request2, mock.Anything, mock.Anything).Return(request2, &experimentType, errors.New("Incorrect request format")).Once()
			},
			wantErr: true,
		},
		{
			name: "Failed to create experiment",
			args: args{
				projectID: projectId,
				request: model.SaveChaosExperimentRequest{
					ID:      experimentId,
					Type:    &model.AllExperimentType[0],
					InfraID: infraId,
				},
				request2: &model.ChaosExperimentRequest{
					ExperimentID:   &experimentId,
					InfraID:        infraId,
					ExperimentType: &model.AllExperimentType[0],
				},
			},
			given: func(request2 *model.ChaosExperimentRequest, mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := []interface{}{bson.D{
					{Key: "experiment_id", Value: experimentId},
				}}
				singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()

				mockServices.ChaosExperimentService.On("ProcessExperiment", mock.Anything, request2, mock.Anything, mock.Anything).Return(request2, &experimentType, nil).Once()

				mockServices.ChaosExperimentService.On("ProcessExperimentUpdate", request2, mock.Anything, mock.Anything, mock.Anything, false, mock.Anything, mock.Anything).Return(nil).Once()

				mockServices.GitOpsService.On("UpsertExperimentToGit", ctx, mock.Anything, request2).Return(nil).Once()
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			mockServices := NewMockServices()
			tc.given(tc.args.request2, mockServices)
			_, err := mockServices.ChaosExperimentHandler.SaveChaosExperiment(ctx, tc.args.request, tc.args.projectID, store)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentHandler.SaveChaosExperiment() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			assertExpectations(mockServices, t)
		})
	}
}

func TestChaosExperimentHandler_CreateChaosExperiment(t *testing.T) {
	type args struct {
		ctx       context.Context
		request   *model.ChaosExperimentRequest
		projectID string
		r         *store.StateData
	}
	tests := []struct {
		name    string
		args    args
		want    *model.ChaosExperimentResponse
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockServices := NewMockServices()
			got, err := mockServices.ChaosExperimentHandler.CreateChaosExperiment(tt.args.ctx, tt.args.request, tt.args.projectID, tt.args.r)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.CreateChaosExperiment() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ChaosExperimentHandler.CreateChaosExperiment() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestChaosExperimentHandler_DeleteChaosExperiment(t *testing.T) {
	username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
	ctx := context.TODO()
	projectId := uuid.New().String()
	experimentId := uuid.New().String()
	experimentRunID := uuid.New().String()
	store := store.NewStore()

	tests := []struct {
		name    string
		given   func(mockServices *MockServices)
		wantErr bool
	}{
		{
			name: "success: Delete Chaos Experiment",
			given: func(mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := []interface{}{bson.D{
					{Key: "experiment_id", Value: experimentId},
					{Key: "experiment_runs", Value: []*dbChaosExperimentRun.ChaosExperimentRun{
						{ExperimentRunID: experimentRunID},
					}},
				}}
				singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()

				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything).Return(singleResult, nil).Once()

				mockServices.ChaosExperimentRunService.On("ProcessExperimentRunDelete", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
				mockServices.GitOpsService.On("DeleteExperimentFromGit", ctx, mock.Anything, mock.Anything).Return(nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: mongo error while retrieving the experiment details",
			given: func(mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := []interface{}{bson.D{
					{Key: "experiment_id", Value: experimentId},
					{Key: "experiment_runs", Value: []*dbChaosExperimentRun.ChaosExperimentRun{
						{ExperimentRunID: experimentRunID},
					}},
				}}
				singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, errors.New("error retrieving the experiments")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: mongo error while retrieving the experiment run details",
			given: func(mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := []interface{}{bson.D{
					{Key: "experiment_id", Value: experimentId},
					{Key: "experiment_runs", Value: []*dbChaosExperimentRun.ChaosExperimentRun{
						{ExperimentRunID: experimentRunID},
					}},
				}}
				singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()

				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything).Return(singleResult, errors.New("error retrieving the experiment runs")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: unable to delete experiment-runs",
			given: func(mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := []interface{}{bson.D{
					{Key: "experiment_id", Value: experimentId},
					{Key: "experiment_runs", Value: []*dbChaosExperimentRun.ChaosExperimentRun{
						{ExperimentRunID: experimentRunID},
					}},
				}}
				singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()
				mockServices.MongodbOperator.On("Get", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything).Return(singleResult, nil).Once()
				mockServices.ChaosExperimentRunService.On("ProcessExperimentRunDelete", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(errors.New("")).Once()
				mockServices.GitOpsService.On("DeleteExperimentFromGit", ctx, mock.Anything, mock.Anything).Return(nil).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			mockServices := NewMockServices()
			tc.given(mockServices)
			_, err := mockServices.ChaosExperimentHandler.DeleteChaosExperiment(ctx, projectId, experimentId, &experimentRunID, store)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentHandler.DeleteChaosExperiment() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			assertExpectations(mockServices, t)
		})
	}
}

func TestChaosExperimentHandler_UpdateChaosExperiment(t *testing.T) {
	type args struct {
		request   *model.ChaosExperimentRequest
		projectID string
	}
	username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
	ctx := context.Background()
	projectId := uuid.New().String()
	infraId := uuid.New().String()
	experimentId := uuid.New().String()
	experimentType := dbChaosExperiment.NonCronExperiment

	store := store.NewStore()
	tests := []struct {
		name    string
		args    args
		given   func(request *model.ChaosExperimentRequest, mockServices *MockServices)
		wantErr bool
	}{
		{
			name: "Update Chaos Experiment",

			args: args{
				projectID: projectId,
				request: &model.ChaosExperimentRequest{
					ExperimentID:   &experimentId,
					InfraID:        infraId,
					ExperimentType: &model.AllExperimentType[0],
				},
			},
			given: func(request *model.ChaosExperimentRequest, mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				mockServices.MongodbOperator.On("CountDocuments", ctx, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(int64(0), nil).Once()
				mockServices.ChaosExperimentService.On("ProcessExperiment", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(request, &experimentType, nil).Once()
				mockServices.ChaosExperimentService.On("ProcessExperimentUpdate", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
				mockServices.GitOpsService.On("UpsertExperimentToGit", ctx, mock.Anything, request).Return(nil).Once()

			},
			wantErr: false,
		},
		{
			name: "Failed to process experiment",
			args: args{
				projectID: projectId,
				request: &model.ChaosExperimentRequest{
					ExperimentID:   &experimentId,
					InfraID:        infraId,
					ExperimentType: &model.AllExperimentType[0],
				},
			},
			given: func(request *model.ChaosExperimentRequest, mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				mockServices.MongodbOperator.On("CountDocuments", ctx, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(int64(0), nil).Once()
				mockServices.ChaosExperimentService.On("ProcessExperiment", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(request, &experimentType, errors.New("Incorrect request format")).Once()
			},
			wantErr: true,
		},
		{
			name: "Update failed",
			args: args{
				projectID: projectId,
				request: &model.ChaosExperimentRequest{
					ExperimentID:   &experimentId,
					InfraID:        infraId,
					ExperimentType: &model.AllExperimentType[0],
				},
			},
			given: func(request *model.ChaosExperimentRequest, mockServices *MockServices) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)

				mockServices.MongodbOperator.On("CountDocuments", ctx, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(int64(0), nil).Once()

				mockServices.ChaosExperimentService.On("ProcessExperiment", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(request, &experimentType, nil).Once()

				mockServices.ChaosExperimentService.On("ProcessExperimentUpdate", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(errors.New("experiment update failed")).Once()

				mockServices.GitOpsService.On("UpsertExperimentToGit", ctx, mock.Anything, request).Return(nil).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			mockServices := NewMockServices()
			tc.given(tc.args.request, mockServices)
			_, err := mockServices.ChaosExperimentHandler.UpdateChaosExperiment(ctx, *tc.args.request, tc.args.projectID, store)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentHandler.UpdateChaosExperiment() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			assertExpectations(mockServices, t)
		})
	}
}

func TestChaosExperimentHandler_GetExperiment(t *testing.T) {
	projectId := uuid.New().String()
	experimentId := uuid.New().String()
	infraId := uuid.New().String()
	ctx := context.Background()
	tests := []struct {
		name    string
		given   func(mockServices *MockServices)
		wantErr bool
	}{
		{
			name: "success: Get Experiment",
			given: func(mockServices *MockServices) {
				findResult := []interface{}{bson.D{
					{Key: "project_id", Value: projectId},
					{Key: "infra_id", Value: infraId},
					{Key: "kubernetesInfraDetails", Value: []dbChoasInfra.ChaosInfra{
						{
							ProjectID: projectId,
							InfraID:   infraId,
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
			},
			wantErr: false,
		},
		{
			name: "failure: Kubernetes infra details absent",
			given: func(mockServices *MockServices) {
				findResult := []interface{}{bson.D{
					{Key: "project_id", Value: projectId},
					{Key: "infra_id", Value: infraId},
				}}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, errors.New("kubernetes infra details absent")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: Absent experiment run details",
			given: func(mockServices *MockServices) {
				findResult := []interface{}{bson.D{
					{Key: "project_id", Value: projectId},
					{Key: "infra_id", Value: infraId},
					{Key: "kubernetesInfraDetails", Value: []dbChoasInfra.ChaosInfra{
						{
							ProjectID: projectId,
							InfraID:   infraId,
						},
					}},
				}}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, errors.New("experiment run details absent")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: empty mongo cursor returned",
			given: func(mockServices *MockServices) {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, errors.New("experiment run details absent")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			mockServices := NewMockServices()
			tc.given(mockServices)
			_, err := mockServices.ChaosExperimentHandler.GetExperiment(ctx, projectId, experimentId)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentHandler.GetExperiment() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			assertExpectations(mockServices, t)
		})
	}
}

func TestChaosExperimentHandler_ListExperiment(t *testing.T) {
	type args struct {
		projectID string
		request   model.ListExperimentRequest
	}
	projectId := uuid.New().String()
	infraId := uuid.New().String()
	findResult := []interface{}{
		bson.D{
			{Key: "project_id", Value: projectId},
			{Key: "infra_id", Value: infraId},
		},
	}
	tests := []struct {
		name    string
		args    args
		given   func(mockServices *MockServices)
		wantErr bool
	}{
		{
			name: "List Experiment",
			args: args{
				projectID: projectId,
				request: model.ListExperimentRequest{
					ExperimentIDs: []*string{&infraId},
					Pagination:    &model.Pagination{Page: 1},
				},
			},
			given: func(mockServices *MockServices) {
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "success: sorting in descending order of name",
			args: args{
				projectID: projectId,
				request: model.ListExperimentRequest{
					ExperimentIDs: []*string{&infraId},
					Pagination:    &model.Pagination{Page: 1},
					Sort: &model.ExperimentSortInput{
						Field: model.ExperimentSortingFieldName,
					},
				},
			},
			given: func(mockServices *MockServices) {
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "success: sorting in descending order of time",
			args: args{
				projectID: projectId,
				request: model.ListExperimentRequest{
					ExperimentIDs: []*string{&infraId},
					Pagination:    &model.Pagination{Page: 1},
					Sort: &model.ExperimentSortInput{
						Field: model.ExperimentSortingFieldTime,
					},
				},
			},
			given: func(mockServices *MockServices) {
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: listing experiment",
			args: args{
				projectID: projectId,
				request: model.ListExperimentRequest{
					ExperimentIDs: []*string{&infraId},
					Pagination:    &model.Pagination{Page: 1},
				},
			},
			given: func(mockServices *MockServices) {
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, errors.New("failed aggregating experiments")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			mockServices := NewMockServices()
			tc.given(mockServices)
			_, err := mockServices.ChaosExperimentHandler.ListExperiment(tc.args.projectID, tc.args.request)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentHandler.ListExperiment() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			assertExpectations(mockServices, t)
		})
	}
}

func TestChaosExperimentHandler_DisableCronExperiment(t *testing.T) {
	username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
	projectID := uuid.New().String()
	experimentID := uuid.New().String()
	infraID := uuid.New().String()
	experimentRequest := dbChaosExperiment.ChaosExperimentRequest{
		ExperimentID: experimentID,
		InfraID:      infraID,
		Revision: []dbChaosExperiment.ExperimentRevision{
			{
				RevisionID: uuid.New().String(),
			},
		},
	}
	store := store.NewStore()
	tests := []struct {
		name    string
		given   func(mockServices *MockServices)
		wantErr bool
	}{
		{
			name: "Success: Disable Cron Experiment",
			given: func(mockServices *MockServices) {
				mockServices.ChaosExperimentService.On("ProcessExperimentUpdate", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
			},
			wantErr: false,
		},
		{
			name: "Failure: mongo error while updating the experiment details",
			given: func(mockServices *MockServices) {
				mockServices.ChaosExperimentService.On("ProcessExperimentUpdate", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(errors.New("error while updating")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			mockServices := NewMockServices()
			tc.given(mockServices)
			if err := mockServices.ChaosExperimentHandler.DisableCronExperiment(username, experimentRequest, projectID, store); (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentHandler.DisableCronExperiment() error = %v, wantErr %v", err, tc.wantErr)
			}
			assertExpectations(mockServices, t)
		})
	}
}

func TestChaosExperimentHandler_GetExperimentStats(t *testing.T) {
	ctx := context.Background()
	projectID := uuid.New().String()
	tests := []struct {
		name    string
		wantErr bool
		given   func(mockServices *MockServices)
	}{
		{
			name: "success: get experiment stats",
			given: func(mockServices *MockServices) {
				username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := []interface{}{
					bson.D{
						{Key: "project_id", Value: projectID},
					},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: empty cursor returned",
			given: func(mockServices *MockServices) {
				username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, errors.New("empty cursor returned")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: getting experiment stats",
			given: func(mockServices *MockServices) {
				username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := []interface{}{
					bson.D{
						{Key: "project_id", Value: projectID},
					},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mockServices.MongodbOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, errors.New("failed to get experiment stats")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			mockServices := NewMockServices()
			tc.given(mockServices)
			_, err := mockServices.ChaosExperimentHandler.GetExperimentStats(ctx, projectID)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentHandler.GetExperimentStats() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			assertExpectations(mockServices, t)
		})
	}
}
