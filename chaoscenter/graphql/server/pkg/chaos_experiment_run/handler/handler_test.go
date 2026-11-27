package handler

import (
	"context"
	"errors"
	"io"
	"log"
	"os"
	"reflect"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	probe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/handler"
	dbProbeMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/model/mocks"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	choas_experiment_run "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run"
	choasExperimentRunMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run/model/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	chaosInfraMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure/model/mocks"
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
	probeService               = new(dbProbeMocks.ProbeService)
)

var chaosExperimentRunHandler = NewChaosExperimentRunHandler(chaosExperimentRunService, infrastructureService, gitOpsService, chaosExperimentOperator, chaosExperimentRunOperator, probeService, mongodbMockOperator)

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
		probeService               probe.Service
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
				probeService:               probeService,
				mongodbOperator:            mongodbMockOperator,
			},
			want: &ChaosExperimentRunHandler{
				chaosExperimentRunService:  chaosExperimentRunService,
				infrastructureService:      infrastructureService,
				gitOpsService:              gitOpsService,
				chaosExperimentOperator:    chaosExperimentOperator,
				chaosExperimentRunOperator: chaosExperimentRunOperator,
				probeService:               probeService,
				mongodbOperator:            mongodbMockOperator,
			},
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if got := NewChaosExperimentRunHandler(tc.args.chaosExperimentRunService, tc.args.infrastructureService, tc.args.gitOpsService, tc.args.chaosExperimentOperator, tc.args.chaosExperimentRunOperator, tc.args.probeService, tc.args.mongodbOperator); !reflect.DeepEqual(got, tc.want) {
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
						{Key: "kubernetesInfraDetails", Value: []dbInfra.ChaosInfra{
							{
								InfraID: infraId,
							},
						}},
						{Key: "experiment", Value: []dbChaosExperiment.ExperimentDetails{
							{
								Revision: []dbOperationsChaosExpRun.ExperimentRevision{
									{
										RevisionID: uuid.NewString(),
									},
								},
							},
						}},
					},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: kubernetes infra details absent",
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
						{Key: "experiment", Value: []dbChaosExperiment.ExperimentDetails{
							{
								Revision: []dbOperationsChaosExpRun.ExperimentRevision{
									{
										RevisionID: uuid.NewString(),
									},
								},
							},
						}},
					},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: experiment details absent",
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
			wantErr: true,
		},
		{
			name: "failure: nil mongo cursor returned",
			args: args{
				ctx:             context.Background(),
				projectID:       projectId,
				experimentRunID: experimentRunId,
			},
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, errors.New("mongo returned nil cursor")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		tc.given()
		t.Run(tc.name, func(t *testing.T) {
			experimentRunID := tc.args.experimentRunID
			experimentRunUUID := uuid.NewString()
			_, err := chaosExperimentRunHandler.GetExperimentRun(tc.args.ctx, tc.args.projectID, &experimentRunID, &experimentRunUUID)
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

func TestChaosExperimentRunHandler_GetExperimentRunStats(t *testing.T) {
	ctx := context.Background()
	projectId := uuid.NewString()
	tests := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success: GetExperimentRunStats",
			given: func() {
				findResult := []interface{}{
					bson.D{
						{Key: "total_filtered_experiment_runs", Value: []dbOperationsChaosExpRun.TotalFilteredData{
							{
								Count: 1,
							},
						}},
						{Key: "flattened_experiment_runs", Value: []dbOperationsChaosExpRun.FlattenedExperimentRun{
							{
								ExperimentDetails: []dbOperationsChaosExpRun.ExperimentDetails{
									{
										ExperimentName: uuid.NewString(),
									},
								},
							},
						}}},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "failure: GetExperimentRunStats",
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, errors.New("failed to aggregate experiment runs")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tc.given()
			_, err := chaosExperimentRunHandler.GetExperimentRunStats(ctx, projectId)
			if (err != nil) != tc.wantErr {
				t.Errorf("ChaosExperimentRunHandler.GetExperimentRunStats() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
		})
	}
}

func newIsolatedExperimentRunHandler() (*ChaosExperimentRunHandler, *dbMocks.MongoOperator, *dbProbeMocks.ProbeService) {
	mockOp := new(dbMocks.MongoOperator)
	expRunSvc := new(choasExperimentRunMocks.ChaosExperimentRunService)
	infraSvc := new(chaosInfraMocks.InfraService)
	gitSvc := new(dbGitOpsMocks.GitOpsService)
	expOp := dbChaosExperiment.NewChaosExperimentOperator(mockOp)
	expRunOp := dbChaosExperimentRun.NewChaosExperimentRunOperator(mockOp)
	pSvc := new(dbProbeMocks.ProbeService)
	h := NewChaosExperimentRunHandler(expRunSvc, infraSvc, gitSvc, expOp, expRunOp, pSvc, mockOp)
	return h, mockOp, pSvc
}

func TestChaosExperimentRunHandler_GetExperimentRun_MissingExperimentDetailsAndNilWeightage(t *testing.T) {
	projectID := uuid.NewString()
	experimentRunID := uuid.NewString()
	infraID := uuid.NewString()

	t.Run("does not panic when ExperimentDetails is empty", func(t *testing.T) {
		h, mockOp, _ := newIsolatedExperimentRunHandler()
		findResult := []interface{}{
			bson.D{
				{Key: "experiment_run_id", Value: experimentRunID},
				{Key: "project_id", Value: projectID},
				{Key: "infra_id", Value: infraID},
				{Key: "kubernetesInfraDetails", Value: []dbInfra.ChaosInfra{{InfraID: infraID}}},
				{Key: "experiment", Value: []dbChaosExperiment.ExperimentDetails{}},
			},
		}
		cursor, err := mongo.NewCursorFromDocuments(findResult, nil, nil)
		if err != nil {
			t.Fatalf("failed to create cursor: %v", err)
		}
		mockOp.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		resp, err := h.GetExperimentRun(context.Background(), projectID, &experimentRunID, nil)
		if err != nil {
			t.Fatalf("GetExperimentRun() unexpected error: %v", err)
		}
		if resp == nil || resp.ExperimentRunID != experimentRunID {
			t.Fatalf("unexpected response: %+v", resp)
		}
		if resp.ExperimentName != "" {
			t.Errorf("ExperimentName = %q, want empty string", resp.ExperimentName)
		}
		mockOp.AssertExpectations(t)
	})

	t.Run("skips nil weightage entries safely", func(t *testing.T) {
		h, mockOp, _ := newIsolatedExperimentRunHandler()
		findResult := []interface{}{
			bson.D{
				{Key: "experiment_run_id", Value: experimentRunID},
				{Key: "project_id", Value: projectID},
				{Key: "infra_id", Value: infraID},
				{Key: "kubernetesInfraDetails", Value: []dbInfra.ChaosInfra{{InfraID: infraID}}},
				{Key: "experiment", Value: []dbChaosExperiment.ExperimentDetails{
					{
						ExperimentName: "exp-1",
						ExperimentType: dbChaosExperiment.NonCronExperiment,
						Revision: []dbOperationsChaosExpRun.ExperimentRevision{
							{
								RevisionID:         "rev-1",
								ExperimentManifest: "manifest-1",
								Weightages: []*dbChaosExperiment.WeightagesInput{
									nil,
									{FaultName: "pod-delete", Weightage: 10},
								},
							},
						},
					},
				}},
			},
		}
		cursor, err := mongo.NewCursorFromDocuments(findResult, nil, nil)
		if err != nil {
			t.Fatalf("failed to create cursor: %v", err)
		}
		mockOp.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		resp, err := h.GetExperimentRun(context.Background(), projectID, &experimentRunID, nil)
		if err != nil {
			t.Fatalf("GetExperimentRun() unexpected error: %v", err)
		}
		want := []*model.Weightages{{FaultName: "pod-delete", Weightage: 10}}
		if !reflect.DeepEqual(resp.Weightages, want) {
			t.Errorf("Weightages = %+v, want %+v", resp.Weightages, want)
		}
		mockOp.AssertExpectations(t)
	})
}

func TestChaosExperimentRunHandler_ListExperimentRun_EmptyCursorAndNilWeightage(t *testing.T) {
	projectID := uuid.NewString()

	t.Run("empty cursor with nil error does not panic", func(t *testing.T) {
		h, mockOp, _ := newIsolatedExperimentRunHandler()
		cursor, err := mongo.NewCursorFromDocuments(nil, nil, nil)
		if err != nil {
			t.Fatalf("failed to create empty cursor: %v", err)
		}
		mockOp.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		resp, err := h.ListExperimentRun(projectID, model.ListExperimentRunRequest{})
		if err != nil {
			t.Fatalf("ListExperimentRun() unexpected error: %v", err)
		}
		if resp == nil || resp.TotalNoOfExperimentRuns != 0 || len(resp.ExperimentRuns) != 0 {
			t.Fatalf("unexpected response: %+v", resp)
		}
		mockOp.AssertExpectations(t)
	})

	t.Run("skips nil weightage entries safely", func(t *testing.T) {
		h, mockOp, _ := newIsolatedExperimentRunHandler()
		findResult := []interface{}{bson.D{
			{Key: "total_filtered_experiment_runs", Value: []dbOperationsChaosExpRun.TotalFilteredData{{Count: 1}}},
			{Key: "flattened_experiment_runs", Value: []dbOperationsChaosExpRun.FlattenedExperimentRun{
				{
					ExperimentRunID: uuid.NewString(),
					ExperimentDetails: []dbOperationsChaosExpRun.ExperimentDetails{
						{
							ExperimentName: "exp-1",
							Revision: []dbOperationsChaosExpRun.ExperimentRevision{
								{
									RevisionID: "rev-1",
									Weightages: []*dbChaosExperiment.WeightagesInput{
										nil,
										{FaultName: "node-cpu-hog", Weightage: 5},
									},
								},
							},
						},
					},
				},
			}},
		}}
		cursor, err := mongo.NewCursorFromDocuments(findResult, nil, nil)
		if err != nil {
			t.Fatalf("failed to create cursor: %v", err)
		}
		mockOp.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		resp, err := h.ListExperimentRun(projectID, model.ListExperimentRunRequest{})
		if err != nil {
			t.Fatalf("ListExperimentRun() unexpected error: %v", err)
		}
		want := []*model.Weightages{{FaultName: "node-cpu-hog", Weightage: 5}}
		if len(resp.ExperimentRuns) != 1 || !reflect.DeepEqual(resp.ExperimentRuns[0].Weightages, want) {
			t.Fatalf("unexpected runs response: %+v", resp.ExperimentRuns)
		}
		mockOp.AssertExpectations(t)
	})
}

func TestChaosExperimentRunHandler_ChaosExperimentRunEvent_Guards(t *testing.T) {
	t.Run("empty Revision slice returns error instead of panicking", func(t *testing.T) {
		h, mockOp, _ := newIsolatedExperimentRunHandler()
		doc := bson.D{
			{Key: "project_id", Value: "proj-1"},
			{Key: "experiment_id", Value: "exp-1"},
			{Key: "infra_id", Value: "infra-1"},
			{Key: "experiment_type", Value: dbChaosExperiment.NonCronExperiment},
			{Key: "revision", Value: []dbChaosExperiment.ExperimentRevision{}},
		}
		singleResult := mongo.NewSingleResultFromDocument(doc, nil, nil)
		mockOp.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()

		_, err := h.ChaosExperimentRunEvent(model.ExperimentRunRequest{
			ExperimentID:    "exp-1",
			ExperimentRunID: "run-1",
		})
		if err == nil || !strings.Contains(err.Error(), "no revisions found") {
			t.Fatalf("expected no revisions error, got: %v", err)
		}
		mockOp.AssertExpectations(t)
	})

	t.Run("invalid base64 UpdatedBy returns error instead of crashing process", func(t *testing.T) {
		h, mockOp, _ := newIsolatedExperimentRunHandler()
		doc := bson.D{
			{Key: "project_id", Value: "proj-1"},
			{Key: "experiment_id", Value: "exp-1"},
			{Key: "infra_id", Value: "infra-1"},
			{Key: "experiment_type", Value: dbChaosExperiment.NonCronExperiment},
			{Key: "revision", Value: []dbChaosExperiment.ExperimentRevision{
				{
					RevisionID:         "rev-1",
					ExperimentManifest: `{"apiVersion":"argoproj.io/v1alpha1","kind":"Workflow","spec":{"templates":[]}}`,
				},
			}},
		}
		singleResult := mongo.NewSingleResultFromDocument(doc, nil, nil)
		mockOp.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()

		_, err := h.ChaosExperimentRunEvent(model.ExperimentRunRequest{
			ExperimentID:    "exp-1",
			ExperimentRunID: "run-1",
			UpdatedBy:       "!!!not-valid-base64!!!",
		})
		if err == nil || !strings.Contains(err.Error(), "failed to parse updated by field") {
			t.Fatalf("expected updatedBy decode error, got: %v", err)
		}
		mockOp.AssertExpectations(t)
	})
}

func TestChaosExperimentRunHandler_RunMissingAuthContext(t *testing.T) {
	t.Run("RunChaosWorkFlow returns error when auth token is absent", func(t *testing.T) {
		h, mockOp, _ := newIsolatedExperimentRunHandler()
		infraDoc := bson.D{
			{Key: "infra_id", Value: "infra-1"},
			{Key: "is_active", Value: true},
		}
		singleResult := mongo.NewSingleResultFromDocument(infraDoc, nil, nil)
		mockOp.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()
		mockOp.On("Update", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()

		_, err := h.RunChaosWorkFlow(context.Background(), "proj-1", dbChaosExperiment.ChaosExperimentRequest{
			ExperimentID: "exp-1",
			InfraID:      "infra-1",
			Revision: []dbChaosExperiment.ExperimentRevision{
				{
					RevisionID:         "rev-1",
					ExperimentManifest: `{"kind":"Workflow","metadata":{"name":"wf-1","labels":{"infra_id":"infra-1"}},"spec":{"templates":[]}}`,
				},
			},
		}, nil)
		if err == nil || !strings.Contains(err.Error(), "authorization token not found") {
			t.Fatalf("expected missing auth token error, got: %v", err)
		}
		mockOp.AssertExpectations(t)
	})

	t.Run("RunCronExperiment returns error when auth token is absent", func(t *testing.T) {
		h, _, pSvc := newIsolatedExperimentRunHandler()
		pSvc.On("GenerateCronExperimentManifestWithProbes", mock.Anything, "proj-1").Return(v1alpha1.CronWorkflow{}, nil).Once()

		err := h.RunCronExperiment(context.Background(), "proj-1", dbChaosExperiment.ChaosExperimentRequest{
			ExperimentID: "exp-1",
			ProjectID:    "proj-1",
			InfraID:      "infra-1",
			Revision: []dbChaosExperiment.ExperimentRevision{
				{
					RevisionID:         "rev-1",
					ExperimentManifest: `{"kind":"CronWorkflow"}`,
				},
			},
		}, nil)
		if err == nil || !strings.Contains(err.Error(), "authorization token not found") {
			t.Fatalf("expected missing auth token error, got: %v", err)
		}
		pSvc.AssertExpectations(t)
	})
}
