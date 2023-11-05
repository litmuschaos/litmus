package chaos_experiment_run

import (
	"context"
	"errors"
	"io"
	"log"
	"os"
	"reflect"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	mongodbMockOperator        = new(dbMocks.MongoOperator)
	infraOperator              = dbChaosInfra.NewInfrastructureOperator(mongodbMockOperator)
	chaosExperimentOperator    = dbChaosExperiment.NewChaosExperimentOperator(mongodbMockOperator)
	chaosExperimentRunOperator = dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodbMockOperator)
)

var chaosExperimentRunTestService = NewChaosExperimentRunService(chaosExperimentOperator, infraOperator, chaosExperimentRunOperator)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(io.Discard)
	os.Exit(m.Run())
}

func TestNewChaosExperimentRunService(t *testing.T) {
	type args struct {
		chaosWorkflowOperator      *dbChaosExperiment.Operator
		clusterOperator            *dbChaosInfra.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
	}
	testcases := []struct {
		name string
		args args
		want Service
	}{
		{
			name: "success: creating new chaos experiment run service",
			args: args{
				chaosWorkflowOperator:      chaosExperimentOperator,
				clusterOperator:            infraOperator,
				chaosExperimentRunOperator: chaosExperimentRunOperator,
			},
			want: &chaosExperimentRunService{
				chaosExperimentOperator:     chaosExperimentOperator,
				chaosInfrastructureOperator: infraOperator,
				chaosExperimentRunOperator:  chaosExperimentRunOperator,
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if got := NewChaosExperimentRunService(tc.args.chaosWorkflowOperator, tc.args.clusterOperator, tc.args.chaosExperimentRunOperator); !reflect.DeepEqual(got, tc.want) {
				t.Errorf("NewChaosExperimentRunService() = %v, want %v", got, tc.want)
			}
		})
	}
}

func Test_chaosExperimentRunService_ProcessExperimentRunDelete(t *testing.T) {
	type args struct {
		ctx           context.Context
		query         bson.D
		workflowRunID *string
		experimentRun dbChaosExperimentRun.ChaosExperimentRun
		workflow      dbChaosExperiment.ChaosExperimentRequest
		username      string
		r             *store.StateData
	}
	experimentRunId := uuid.New().String()
	projectID := uuid.New().String()
	experimentID := uuid.New().String()
	infraId := uuid.New().String()

	testcases := []struct {
		name    string
		args    args
		given   func()
		wantErr bool
	}{
		{
			name: "success: deleting experiment run",
			args: args{
				ctx:   context.Background(),
				query: bson.D{{Key: "experiment_run_id", Value: experimentRunId}},
				experimentRun: dbChaosExperimentRun.ChaosExperimentRun{
					ProjectID:    projectID,
					ExperimentID: experimentID,
					InfraID:      infraId,
				},
				workflow: dbChaosExperiment.ChaosExperimentRequest{
					ProjectID:    projectID,
					InfraID:      infraId,
					ExperimentID: experimentID,
				},
				workflowRunID: &experimentID,
				username:      "test",
				r:             store.NewStore(),
			},
			given: func() {
				// given
				mongodbMockOperator.On("Update", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: deleting experiment run",
			args: args{
				ctx:   context.Background(),
				query: bson.D{{Key: "experiment_run_id", Value: experimentRunId}},
				experimentRun: dbChaosExperimentRun.ChaosExperimentRun{
					ProjectID:    projectID,
					ExperimentID: experimentID,
					InfraID:      infraId,
				},
				workflow: dbChaosExperiment.ChaosExperimentRequest{
					ProjectID:    projectID,
					InfraID:      infraId,
					ExperimentID: experimentID,
				},
				workflowRunID: &experimentID,
				username:      "test",
				r:             store.NewStore(),
			},
			given: func() {
				// given
				mongodbMockOperator.On("Update", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 0}, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		tc.given()
		t.Run(tc.name, func(t *testing.T) {
			if err := chaosExperimentRunTestService.ProcessExperimentRunDelete(tc.args.ctx, tc.args.query, tc.args.workflowRunID, tc.args.experimentRun, tc.args.workflow, tc.args.username, tc.args.r); (err != nil) != tc.wantErr {
				t.Errorf("chaosExperimentRunService.ProcessExperimentRunDelete() error = %v, wantErr %v", err, tc.wantErr)
			}
		})
	}
}

func Test_chaosExperimentRunService_ProcessCompletedExperimentRun(t *testing.T) {
	type args struct {
		execData ExecutionData
		wfID     string
		runID    string
	}
	experimentRunId := uuid.New().String()
	experimentID := uuid.New().String()

	testcases := []struct {
		name    string
		args    args
		given   func()
		wantErr bool
	}{
		{
			name: "success: processing completed experiment run",
			args: args{
				execData: ExecutionData{
					ExperimentID: experimentID,
				},
				wfID:  experimentID,
				runID: experimentRunId,
			},
			given: func() {
				findResult := []interface{}{bson.D{{Key: "experiment_id", Value: experimentID}, {Key: "weightages", Value: []*model.WeightagesInput{{FaultName: uuid.NewString(), Weightage: 10}}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: can't find unique experiment run",
			args: args{
				execData: ExecutionData{
					ExperimentID: experimentID,
				},
				wfID:  experimentID,
				runID: experimentRunId,
			},
			given: func() {
				findResult := []interface{}{bson.D{{Key: "experiment_id", Value: experimentID}}, bson.D{{Key: "experiment_id", Value: uuid.NewString()}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: nil mongo single result",
			args: args{
				execData: ExecutionData{
					ExperimentID: experimentID,
				},
				wfID:  experimentID,
				runID: experimentRunId,
			},
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			tc.given()
			_, err := chaosExperimentRunTestService.ProcessCompletedExperimentRun(tc.args.execData, tc.args.wfID, tc.args.runID)
			if (err != nil) != tc.wantErr {
				t.Errorf("chaosExperimentRunService.ProcessCompletedExperimentRun() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
		})
	}
}
