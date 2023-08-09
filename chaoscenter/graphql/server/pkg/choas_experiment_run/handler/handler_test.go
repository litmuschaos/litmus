package handler

import (
	"context"
	"io"
	"log"
	"os"
	"reflect"
	"strconv"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	chaosInfraMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure/model/mocks"
	choas_experiment_run "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/choas_experiment_run"
	choasExperimentRunMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/choas_experiment_run/model/mocks"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbOperationsChaosExpRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops"
	dbGitOpsMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops/model/mocks"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	mongodbMockOperator        = new(dbMocks.MongoOperator)
	infrastructureService      = new(chaosInfraMocks.InfraService)
	chaosExperimentRunService  = new(choasExperimentRunMocks.ChaosExperimentRunService)
	gitOpsService              = new(dbGitOpsMocks.GitOpsService)
	chaosExperimentOperator    = dbChaosExperiment.NewChaosExperimentOperator(mongodbMockOperator)
	chaosExperimentRunOperator = dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodbMockOperator)
)

var chaosExperimentRunHandler = NewChaosExperimentRunHandler(chaosExperimentRunService, infrastructureService, gitOpsService, chaosExperimentOperator, chaosExperimentRunOperator, mongodbMockOperator)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(io.Discard)
	os.Exit(m.Run())
}

func TestNewChaosExperimentRunHandler(t *testing.T) {
	type args struct {
		chaosExperimentRunService  choas_experiment_run.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	tests := []struct {
		name string
		args args
		want *ChaosExperimentRunHandler
	}{
		{
			name: "success: NewChaosExperimentRunHandler",
			args: args{
				chaosExperimentRunService:  chaosExperimentRunService,
				infrastructureService:      infrastructureService,
				gitOpsService:              gitOpsService,
				chaosExperimentOperator:    chaosExperimentOperator,
				chaosExperimentRunOperator: chaosExperimentRunOperator,
				mongodbOperator:            mongodbMockOperator,
			},
			want: &ChaosExperimentRunHandler{
				chaosExperimentRunService:  chaosExperimentRunService,
				infrastructureService:      infrastructureService,
				gitOpsService:              gitOpsService,
				chaosExperimentOperator:    chaosExperimentOperator,
				chaosExperimentRunOperator: chaosExperimentRunOperator,
				mongodbOperator:            mongodbMockOperator,
			},
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if got := NewChaosExperimentRunHandler(tc.args.chaosExperimentRunService, tc.args.infrastructureService, tc.args.gitOpsService, tc.args.chaosExperimentOperator, tc.args.chaosExperimentRunOperator, tc.args.mongodbOperator); !reflect.DeepEqual(got, tc.want) {
				t.Errorf("NewChaosExperimentRunHandler() = %v, want %v", got, tc.want)
			}
		})
	}
}

func TestChaosExperimentRunHandler_GetExperimentRun(t *testing.T) {
	type args struct {
		ctx             context.Context
		projectID       string
		experimentRunID string
	}
	projectId := uuid.NewString()
	experimentRunId := uuid.NewString()
	infraId := uuid.NewString()
	tests := []struct {
		name    string
		args    args
		given   func()
		wantErr bool
	}{
		{
			name: "success: GetExperimentRun",
			args: args{
				ctx:             context.Background(),
				projectID:       projectId,
				experimentRunID: experimentRunId,
			},
			given: func() {
				findResult := []interface{}{
					bson.D{
						{Key: "experiment_run_id", Value: experimentRunId},
						{Key: "project_id", Value: projectId},
						{Key: "infra_id", Value: infraId},
					},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
			wantErr: false,
		},
	}
	for _, tc := range tests {
		tc.given()
		t.Run(tc.name, func(t *testing.T) {
			_, err := chaosExperimentRunHandler.GetExperimentRun(tc.args.ctx, tc.args.projectID, tc.args.experimentRunID)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentRunHandler.GetExperimentRun() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
		})
	}
}

func TestChaosExperimentRunHandler_ListExperimentRun(t *testing.T) {
	type args struct {
		projectID string
		request   model.ListExperimentRunRequest
	}
	// given
	projectId := uuid.NewString()
	experimentID := uuid.NewString()
	experimentRunID := uuid.NewString()
	experimentName := uuid.NewString()
	infraId := uuid.NewString()
	experimentStatus := model.ExperimentRunStatusRunning
	endDate := strconv.FormatInt(time.Now().Unix(), 10)
	startDate := strconv.FormatInt(time.Now().Unix(), 10)

	tests := []struct {
		name    string
		args    args
		wantErr bool
		given   func()
	}{
		{
			name: "success: ListExperimentRun",
			args: args{
				projectID: projectId,
				request: model.ListExperimentRunRequest{
					ExperimentRunIDs: []*string{&experimentRunID},
					ExperimentIDs:    []*string{&experimentID},
					Pagination: &model.Pagination{
						Page: 1,
					},
					Filter: &model.ExperimentRunFilterInput{
						ExperimentName:   &experimentName,
						InfraID:          &infraId,
						ExperimentStatus: &experimentStatus,
						DateRange: &model.DateRange{
							StartDate: startDate,
							EndDate:   &endDate,
						},
					},
				},
			},
			given: func() {
				findResult := []interface{}{bson.D{
					{Key: "total_filtered_experiment_runs", Value: []dbOperationsChaosExpRun.TotalFilteredData{
						{
							Count: 1,
						},
					}},
					{Key: "flattened_experiment_runs", Value: []dbOperationsChaosExpRun.FlattenedExperimentRun{
						{
							ExperimentDetails: []dbOperationsChaosExpRun.ExperimentDetails{
								{
									ExperimentName: experimentName,
								},
							},
						},
					}}},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
			wantErr: false,
		},
		// {
		// 	name: "success: empty mongo cursor returned",
		// 	args: args{
		// 		projectID: projectId,
		// 		request: model.ListExperimentRunRequest{
		// 			ExperimentRunIDs: []*string{&experimentRunID},
		// 			ExperimentIDs:    []*string{&experimentID},
		// 			Pagination: &model.Pagination{
		// 				Page: 1,
		// 			},
		// 			Filter: &model.ExperimentRunFilterInput{
		// 				ExperimentName:   &experimentName,
		// 				InfraID:          &infraId,
		// 				ExperimentStatus: &experimentStatus,
		// 				DateRange: &model.DateRange{
		// 					StartDate: strconv.FormatInt(time.Now().Unix(), 10),
		// 					EndDate:   &endDate,
		// 				},
		// 			},
		// 		},
		// 	},
		// 	given: func() {
		// 		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		// 		mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
		// 	},
		// 	wantErr: false,
		// },
		{
			name: "success: sort in descending order of time",
			args: args{
				projectID: projectId,
				request: model.ListExperimentRunRequest{
					ExperimentRunIDs: []*string{&experimentRunID},
					ExperimentIDs:    []*string{&experimentID},
					Pagination: &model.Pagination{
						Page: 1,
					},
					Sort: &model.ExperimentRunSortInput{
						Field: model.ExperimentSortingFieldTime,
					},
					Filter: &model.ExperimentRunFilterInput{
						ExperimentName:   &experimentName,
						InfraID:          &infraId,
						ExperimentStatus: &experimentStatus,
						DateRange: &model.DateRange{
							StartDate: startDate,
							EndDate:   &endDate,
						},
					},
				},
			},
			given: func() {
				findResult := []interface{}{bson.D{
					{Key: "total_filtered_experiment_runs", Value: []dbOperationsChaosExpRun.TotalFilteredData{
						{
							Count: 1,
						},
					}},
					{Key: "flattened_experiment_runs", Value: []dbOperationsChaosExpRun.FlattenedExperimentRun{
						{
							ExperimentDetails: []dbOperationsChaosExpRun.ExperimentDetails{
								{
									ExperimentName: experimentName,
								},
							},
						},
					}}},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "success: sort in descending order of name",
			args: args{
				projectID: projectId,
				request: model.ListExperimentRunRequest{
					ExperimentRunIDs: []*string{&experimentRunID},
					ExperimentIDs:    []*string{&experimentID},
					Pagination: &model.Pagination{
						Page: 1,
					},
					Sort: &model.ExperimentRunSortInput{
						Field: model.ExperimentSortingFieldName,
					},
					Filter: &model.ExperimentRunFilterInput{
						ExperimentName:   &experimentName,
						InfraID:          &infraId,
						ExperimentStatus: &experimentStatus,
						DateRange: &model.DateRange{
							StartDate: startDate,
							EndDate:   &endDate,
						},
					},
				},
			},
			given: func() {
				findResult := []interface{}{bson.D{
					{Key: "total_filtered_workflow_runs", Value: []dbOperationsChaosExpRun.TotalFilteredData{
						{
							Count: 1,
						},
					}},
					{Key: "flattened_workflow_runs", Value: []dbOperationsChaosExpRun.FlattenedExperimentRun{
						{
							ExperimentDetails: []dbOperationsChaosExpRun.ExperimentDetails{
								{
									ExperimentName: experimentName,
								},
							},
						},
					}}},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
			wantErr: false,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tc.given()
			_, err := chaosExperimentRunHandler.ListExperimentRun(tc.args.projectID, tc.args.request)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentRunHandler.ListExperimentRun() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
		})
	}
}

func TestChaosExperimentRunHandler_RunChaosWorkFlow(t *testing.T) {
	type args struct {
		ctx       context.Context
		projectID string
		workflow  dbChaosExperiment.ChaosExperimentRequest
		r         *store.StateData
	}
	projectId := uuid.NewString()
	infraID := uuid.NewString()
	experimentId := uuid.NewString()
	infra := dbInfra.ChaosInfra{
		InfraID:  infraID,
		IsActive: true,
	}

	tests := []struct {
		name    string
		args    args
		given   func()
		wantErr bool
	}{
		{
			name: "success: RunChaosWorkFlow",
			args: args{
				ctx:       context.Background(),
				projectID: projectId,
				workflow: dbChaosExperiment.ChaosExperimentRequest{
					ProjectID: projectId,
					InfraID:   infraID,
				},
				r: store.NewStore(),
			},
			given: func() {
				findResult := []interface{}{
					bson.D{
						{Key: "experiment_id", Value: experimentId},
						{Key: "experiment_manifest", Value: "\"kind\": \"job\""},
						{Key: "project_id", Value: projectId},
						{Key: "infra_id", Value: infraID},
						{Key: "isActive", Value: true},
					},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)

				infrastructureService.On("GetInfra", mock.Anything, mock.Anything, mock.Anything).Return(infra, nil).Once()

				singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()

				mongodbMockOperator.On("List", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

				mongodbMockOperator.On("Update", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything, mock.Anything).Return(new(mongo.UpdateResult), nil).Once()

				mongodbMockOperator.On("Create", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything).Return(nil).Once()
			},
		},
	}
	for _, tc := range tests {
		tc.given()
		t.Run(tc.name, func(t *testing.T) {
			_, err := chaosExperimentRunHandler.RunChaosWorkFlow(tc.args.ctx, tc.args.projectID, tc.args.workflow, tc.args.r)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentRunHandler.RunChaosWorkFlow() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
		})
	}
}

func TestChaosExperimentRunHandler_RunCronExperiment(t *testing.T) {
	type fields struct {
		chaosExperimentRunService  choas_experiment_run.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		ctx       context.Context
		projectID string
		workflow  dbChaosExperiment.ChaosExperimentRequest
		r         *store.StateData
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			c := &ChaosExperimentRunHandler{
				chaosExperimentRunService:  tc.fields.chaosExperimentRunService,
				infrastructureService:      tc.fields.infrastructureService,
				gitOpsService:              tc.fields.gitOpsService,
				chaosExperimentOperator:    tc.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tc.fields.chaosExperimentRunOperator,
				mongodbOperator:            tc.fields.mongodbOperator,
			}
			if err := c.RunCronExperiment(tc.args.ctx, tc.args.projectID, tc.args.workflow, tc.args.r); (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentRunHandler.RunCronExperiment() error = %v, wantErr %v", err, tc.wantErr)
			}
		})
	}
}

func TestChaosExperimentRunHandler_GetExperimentRunStats(t *testing.T) {
	type fields struct {
		chaosExperimentRunService  choas_experiment_run.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		ctx       context.Context
		projectID string
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    *model.GetExperimentRunStatsResponse
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			c := &ChaosExperimentRunHandler{
				chaosExperimentRunService:  tc.fields.chaosExperimentRunService,
				infrastructureService:      tc.fields.infrastructureService,
				gitOpsService:              tc.fields.gitOpsService,
				chaosExperimentOperator:    tc.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tc.fields.chaosExperimentRunOperator,
				mongodbOperator:            tc.fields.mongodbOperator,
			}
			got, err := c.GetExperimentRunStats(tc.args.ctx, tc.args.projectID)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentRunHandler.GetExperimentRunStats() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tc.want) {
				t.Errorf("ChaosExperimentRunHandler.GetExperimentRunStats() = %v, want %v", got, tc.want)
			}
		})
	}
}

func TestChaosExperimentRunHandler_ChaosExperimentRunEvent(t *testing.T) {
	type fields struct {
		chaosExperimentRunService  choas_experiment_run.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		event model.ExperimentRunRequest
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    string
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			c := &ChaosExperimentRunHandler{
				chaosExperimentRunService:  tc.fields.chaosExperimentRunService,
				infrastructureService:      tc.fields.infrastructureService,
				gitOpsService:              tc.fields.gitOpsService,
				chaosExperimentOperator:    tc.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tc.fields.chaosExperimentRunOperator,
				mongodbOperator:            tc.fields.mongodbOperator,
			}
			got, err := c.ChaosExperimentRunEvent(tc.args.event)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentRunHandler.ChaosExperimentRunEvent() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			if got != tc.want {
				t.Errorf("ChaosExperimentRunHandler.ChaosExperimentRunEvent() = %v, want %v", got, tc.want)
			}
		})
	}
}
