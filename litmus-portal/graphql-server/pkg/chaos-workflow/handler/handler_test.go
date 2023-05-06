package handler_test

import (
	"context"
	"errors"
	"io/ioutil"
	"os"
	"strconv"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	chaosWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/handler"
	chaosWorkflowMocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/model/mocks"
	clusterMocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster/model/mocks"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	mongodbMocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model/mocks"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbOperationsWorkflowTemplate "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflowtemplate"
	gitOpsMocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	mongoOperator                 = new(mongodbMocks.MongoOperator)
	clusterService                = new(clusterMocks.ClusterService)
	chaosWorkflowService          = new(chaosWorkflowMocks.ChaosWorkflowService)
	gitOpsService                 = new(gitOpsMocks.GitOpsService)
	chaosWorkflowOperator         = dbOperationsWorkflow.NewChaosWorkflowOperator(mongoOperator)
	chaosWorkflowTemplateOperator = dbOperationsWorkflowTemplate.NewWorkflowTemplateOperator(mongoOperator)
	chaosWorkflowHandler          = handler.NewChaosWorkflowHandler(
		chaosWorkflowService,
		clusterService,
		gitOpsService,
		chaosWorkflowOperator,
		chaosWorkflowTemplateOperator,
		mongoOperator,
	)
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// TestChaosWorkflowHandler_CreateChaosWorkflow is used to test the CreateChaosWorkflow method
func TestChaosWorkflowHandler_CreateChaosWorkflow(t *testing.T) {
	// given
	state := store.NewStore()
	username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
	ctx := context.Background()
	workflowID := uuid.NewString()
	workflowType := dbOperationsWorkflow.Workflow
	testcases := []struct {
		name    string
		request *model.ChaosWorkFlowRequest
		given   func(request *model.ChaosWorkFlowRequest)
		isError bool
	}{
		{
			name: "workflow creation successful",
			request: &model.ChaosWorkFlowRequest{
				ProjectID:  uuid.NewString(),
				WorkflowID: &workflowID,
			},
			given: func(request *model.ChaosWorkFlowRequest) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				chaosWorkflowService.On("ProcessWorkflow", request).Return(request, &workflowType, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowCreation", request, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
				gitOpsService.On("UpsertWorkflowToGit", ctx, request).Return(nil).Once()
			},
		},
		{
			name: "workflow creation failed: process workflow failed",
			given: func(request *model.ChaosWorkFlowRequest) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				chaosWorkflowService.On("ProcessWorkflow", request).Return(request, &workflowType, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "workflow creation failed: gitOps upsert workflow to git failed",
			given: func(request *model.ChaosWorkFlowRequest) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				chaosWorkflowService.On("ProcessWorkflow", request).Return(request, &workflowType, nil).Once()
				gitOpsService.On("UpsertWorkflowToGit", ctx, request).Return(errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "workflow creation failed: process workflow creation failed",
			given: func(request *model.ChaosWorkFlowRequest) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				chaosWorkflowService.On("ProcessWorkflow", request).Return(request, &workflowType, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowCreation", request, mock.Anything, mock.Anything, mock.Anything).Return(errors.New("")).Once()
				gitOpsService.On("UpsertWorkflowToGit", ctx, request).Return(nil).Once()
			},
			isError: true,
		},
		{
			name: "workflow creation failed: invalid jwt",
			request: &model.ChaosWorkFlowRequest{
				ProjectID:  uuid.NewString(),
				WorkflowID: &workflowID,
			},
			given: func(request *model.ChaosWorkFlowRequest) {
				ctx = context.WithValue(ctx, authorization.AuthKey, "invalid jwt")
				chaosWorkflowService.On("ProcessWorkflow", request).Return(request, &workflowType, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowCreation", request, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
				gitOpsService.On("UpsertWorkflowToGit", ctx, request).Return(nil).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given(tc.request)
			// when
			_, err := chaosWorkflowHandler.CreateChaosWorkflow(ctx, tc.request, state)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowHandler_DeleteChaosWorkflow is used to test the DeleteChaosWorkflow method
func TestChaosWorkflowHandler_DeleteChaosWorkflow(t *testing.T) {
	// given
	state := store.NewStore()
	username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
	ctx := context.Background()
	workflowID := uuid.NewString()
	emptyWorkflowID := ""
	workflowRunID := uuid.NewString()
	emptyWorkflowRunID := ""
	testcases := []struct {
		name          string
		workflowID    *string
		workflowRunID *string
		given         func()
		isError       bool
	}{
		{
			name: "workflow deletion successful: workflowID and workflowRunID both provided",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowRunDelete", mock.Anything, mock.Anything, mock.Anything, mock.Anything, state).Return(nil).Once()
			},
			workflowRunID: &workflowRunID,
			workflowID:    &workflowID,
		},
		{
			name: "workflow deletion successful: workflowID and workflowRunID both empty",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			workflowID:    &emptyWorkflowID,
			workflowRunID: &emptyWorkflowRunID,
		},
		{
			name: "workflow deletion successful: workflowID provided",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
				gitOpsService.On("DeleteWorkflowFromGit", mock.Anything, mock.Anything).Return(nil).Once()
				chaosWorkflowService.On("ProcessWorkflowDelete", mock.Anything, mock.Anything, mock.Anything, state).Return(nil).Once()
			},
			workflowRunID: &emptyWorkflowRunID,
			workflowID:    &workflowID,
		},
		{
			name: "workflow deletion failed: GetWorkflow failed",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "workflow deletion failed: invalid jwt",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, "invalid jwt")
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			workflowRunID: &workflowRunID,
			workflowID:    &workflowID,
			isError:       true,
		},
		{
			name: "workflow deletion failed: workflowID and workflowRunID both provided but ProcessWorkflowRunDelete failed",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowRunDelete", mock.Anything, mock.Anything, mock.Anything, mock.Anything, state).Return(errors.New("")).Once()
			},
			workflowRunID: &workflowRunID,
			workflowID:    &workflowID,
			isError:       true,
		},
		{
			name: "workflow deletion failed: workflowID provided but gitOps DeleteWorkflowFromGit failed",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
				gitOpsService.On("DeleteWorkflowFromGit", mock.Anything, mock.Anything).Return(errors.New("")).Once()
			},
			workflowRunID: &emptyWorkflowRunID,
			workflowID:    &workflowID,
			isError:       true,
		},
		{
			name: "workflow deletion failed: workflowID provided but ProcessWorkflowDelete failed",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
				gitOpsService.On("DeleteWorkflowFromGit", mock.Anything, mock.Anything).Return(nil).Once()
				chaosWorkflowService.On("ProcessWorkflowDelete", mock.Anything, mock.Anything, mock.Anything, state).Return(errors.New("")).Once()
			},
			workflowRunID: &emptyWorkflowRunID,
			workflowID:    &workflowID,
			isError:       true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := chaosWorkflowHandler.DeleteChaosWorkflow(ctx, uuid.NewString(), tc.workflowID, tc.workflowRunID, state)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowHandler_TerminateChaosWorkflow is used to test the TerminateChaosWorkflow method
func TestChaosWorkflowHandler_TerminateChaosWorkflow(t *testing.T) {
	// given
	state := store.NewStore()
	username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
	ctx := context.Background()
	workflowID := uuid.NewString()
	emptyWorkflowID := ""
	workflowRunID := uuid.NewString()
	emptyWorkflowRunID := ""
	testcases := []struct {
		name          string
		workflowID    *string
		workflowRunID *string
		given         func()
		isError       bool
	}{
		{
			name: "workflow deletion successful: workflowID and workflowRunID both provided",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowRunDelete", mock.Anything, mock.Anything, mock.Anything, mock.Anything, state).Return(nil).Once()
			},
			workflowRunID: &workflowRunID,
			workflowID:    &workflowID,
		},
		{
			name: "workflow deletion failed: GetWorkflow failed",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "workflow deletion failed: invalid jwt",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, "invalid jwt")
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			workflowRunID: &workflowRunID,
			workflowID:    &workflowID,
			isError:       true,
		},
		{
			name: "workflow deletion failed: workflowRunID empty",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			workflowRunID: &emptyWorkflowRunID,
			workflowID:    &workflowID,
			isError:       true,
		},
		{
			name: "workflow deletion failed: workflowID empty",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			workflowRunID: &workflowID,
			workflowID:    &emptyWorkflowID,
			isError:       true,
		},
		{
			name: "workflow deletion failed: ProcessWorkflowRunDelete failed",
			given: func() {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				findResult := bson.D{{"workflow_id", workflowID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowRunDelete", mock.Anything, mock.Anything, mock.Anything, mock.Anything, state).Return(errors.New("")).Once()
			},
			workflowRunID: &workflowRunID,
			workflowID:    &workflowID,
			isError:       true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := chaosWorkflowHandler.TerminateChaosWorkflow(ctx, uuid.NewString(), tc.workflowID, tc.workflowRunID, state)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowHandler_UpdateChaosWorkflow is used to test the UpdateChaosWorkflow method
func TestChaosWorkflowHandler_UpdateChaosWorkflow(t *testing.T) {
	// given
	state := store.NewStore()
	username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
	ctx := context.Background()
	workflowID := uuid.NewString()
	workflowType := dbOperationsWorkflow.Workflow
	testcases := []struct {
		name    string
		request *model.ChaosWorkFlowRequest
		given   func(request *model.ChaosWorkFlowRequest)
		isError bool
	}{
		{
			name: "workflow update successful",
			request: &model.ChaosWorkFlowRequest{
				ProjectID:  uuid.NewString(),
				WorkflowID: &workflowID,
			},
			given: func(request *model.ChaosWorkFlowRequest) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				chaosWorkflowService.On("ProcessWorkflow", request).Return(request, &workflowType, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowUpdate", request, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
				gitOpsService.On("UpsertWorkflowToGit", ctx, request).Return(nil).Once()
			},
		},
		{
			name: "workflow update failed: process workflow failed",
			given: func(request *model.ChaosWorkFlowRequest) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				chaosWorkflowService.On("ProcessWorkflow", request).Return(request, &workflowType, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "workflow update failed: gitOps upsert workflow to git failed",
			given: func(request *model.ChaosWorkFlowRequest) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				chaosWorkflowService.On("ProcessWorkflow", request).Return(request, &workflowType, nil).Once()
				gitOpsService.On("UpsertWorkflowToGit", ctx, request).Return(errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "workflow update failed: ProcessWorkflowUpdate failed",
			given: func(request *model.ChaosWorkFlowRequest) {
				ctx = context.WithValue(ctx, authorization.AuthKey, username)
				chaosWorkflowService.On("ProcessWorkflow", request).Return(request, &workflowType, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowUpdate", request, mock.Anything, mock.Anything, mock.Anything).Return(errors.New("")).Once()
				gitOpsService.On("UpsertWorkflowToGit", ctx, request).Return(nil).Once()
			},
			isError: true,
		},
		{
			name: "workflow update failed: invalid jwt",
			request: &model.ChaosWorkFlowRequest{
				ProjectID:  uuid.NewString(),
				WorkflowID: &workflowID,
			},
			given: func(request *model.ChaosWorkFlowRequest) {
				ctx = context.WithValue(ctx, authorization.AuthKey, "invalid jwt")
				chaosWorkflowService.On("ProcessWorkflow", request).Return(request, &workflowType, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowCreation", request, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given(tc.request)
			// when
			_, err := chaosWorkflowHandler.UpdateChaosWorkflow(ctx, tc.request, state)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowHandler_ListWorkflowRuns is used to test the ListWorkflowRuns method
func TestChaosWorkflowHandler_ListWorkflowRuns(t *testing.T) {
	// given
	workflowID := uuid.NewString()
	workflowName := uuid.NewString()
	workflowRunID := uuid.NewString()
	clusterName := uuid.NewString()
	workflowStatus := model.WorkflowRunStatusRunning
	endDate := strconv.FormatInt(time.Now().Unix(), 10)
	testcases := []struct {
		name    string
		request model.ListWorkflowRunsRequest
		given   func()
		isError bool
	}{
		{
			name: "success",
			request: model.ListWorkflowRunsRequest{
				ProjectID:      uuid.NewString(),
				WorkflowRunIDs: []*string{&workflowRunID},
				WorkflowIDs:    []*string{&workflowID},
				Filter: &model.WorkflowRunFilterInput{
					WorkflowName:   &workflowName,
					ClusterName:    &clusterName,
					WorkflowStatus: &workflowStatus,
					DateRange: &model.DateRange{
						StartDate: strconv.FormatInt(time.Now().Unix(), 10),
						EndDate:   &endDate,
					},
				},
				Pagination: &model.Pagination{
					Page: 1,
				},
			},
			given: func() {
				findResult := []interface{}{bson.D{
					{"total_filtered_workflow_runs", []dbOperationsWorkflow.TotalFilteredData{
						{
							Count: 1,
						},
					}},
					{"flattened_workflow_runs", []dbOperationsWorkflow.FlattenedWorkflowRun{
						{
							WorkflowRuns: dbOperationsWorkflow.ChaosWorkflowRun{
								WorkflowRunID: workflowRunID,
							},
						},
					}}},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("Aggregate", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "success: mongo return empty cursor",
			request: model.ListWorkflowRunsRequest{
				ProjectID:      uuid.NewString(),
				WorkflowRunIDs: []*string{&workflowRunID},
				WorkflowIDs:    []*string{&workflowID},
				Filter: &model.WorkflowRunFilterInput{
					WorkflowName:   &workflowName,
					ClusterName:    &clusterName,
					WorkflowStatus: &workflowStatus,
					DateRange: &model.DateRange{
						StartDate: strconv.FormatInt(time.Now().Unix(), 10),
						EndDate:   &endDate,
					},
				},
				Pagination: &model.Pagination{
					Page: 1,
				},
			},
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("Aggregate", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "failure: GetAggregateWorkflows failed",
			request: model.ListWorkflowRunsRequest{
				ProjectID:      uuid.NewString(),
				WorkflowRunIDs: []*string{&workflowRunID},
				WorkflowIDs:    []*string{&workflowID},
				Filter: &model.WorkflowRunFilterInput{
					WorkflowName:   &workflowName,
					ClusterName:    &clusterName,
					WorkflowStatus: &workflowStatus,
					DateRange: &model.DateRange{
						StartDate: strconv.FormatInt(time.Now().Unix(), 10),
						EndDate:   &endDate,
					},
				},
				Pagination: &model.Pagination{
					Page: 1,
				},
			},
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("Aggregate", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(cursor, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "success: with sort by descending order of time",
			request: model.ListWorkflowRunsRequest{
				ProjectID:      uuid.NewString(),
				WorkflowRunIDs: []*string{&workflowRunID},
				WorkflowIDs:    []*string{&workflowID},
				Filter: &model.WorkflowRunFilterInput{
					WorkflowName:   &workflowName,
					ClusterName:    &clusterName,
					WorkflowStatus: &workflowStatus,
					DateRange: &model.DateRange{
						StartDate: strconv.FormatInt(time.Now().Unix(), 10),
						EndDate:   &endDate,
					},
				},
				Sort: &model.WorkflowRunSortInput{
					Field: model.WorkflowSortingFieldTime,
				},
			},
			given: func() {
				findResult := []interface{}{bson.D{
					{"total_filtered_workflow_runs", []dbOperationsWorkflow.TotalFilteredData{
						{
							Count: 1,
						},
					}},
					{"flattened_workflow_runs", []dbOperationsWorkflow.FlattenedWorkflowRun{
						{
							WorkflowRuns: dbOperationsWorkflow.ChaosWorkflowRun{
								WorkflowRunID: workflowRunID,
							},
						},
					}}},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("Aggregate", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "success: with sort by descending order of name",
			request: model.ListWorkflowRunsRequest{
				ProjectID:      uuid.NewString(),
				WorkflowRunIDs: []*string{&workflowRunID},
				WorkflowIDs:    []*string{&workflowID},
				Filter: &model.WorkflowRunFilterInput{
					WorkflowName:   &workflowName,
					ClusterName:    &clusterName,
					WorkflowStatus: &workflowStatus,
					DateRange: &model.DateRange{
						StartDate: strconv.FormatInt(time.Now().Unix(), 10),
						EndDate:   &endDate,
					},
				},
				Sort: &model.WorkflowRunSortInput{
					Field: model.WorkflowSortingFieldName,
				},
			},
			given: func() {
				findResult := []interface{}{bson.D{
					{"total_filtered_workflow_runs", []dbOperationsWorkflow.TotalFilteredData{
						{
							Count: 1,
						},
					}},
					{"flattened_workflow_runs", []dbOperationsWorkflow.FlattenedWorkflowRun{
						{
							WorkflowRuns: dbOperationsWorkflow.ChaosWorkflowRun{
								WorkflowRunID: workflowRunID,
							},
						},
					}}},
				}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("Aggregate", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := chaosWorkflowHandler.ListWorkflowRuns(tc.request)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowHandler_ListWorkflows is used to test the ListWorkflows method
func TestChaosWorkflowHandler_ListWorkflows(t *testing.T) {
	// given
	workflowName := uuid.NewString()
	workflowID := uuid.NewString()
	clusterName := uuid.NewString()
	cluster := dbSchemaCluster.Cluster{ClusterName: clusterName, ClusterID: uuid.NewString(), ClusterType: uuid.NewString()}
	findResult := []interface{}{bson.D{
		{"total_filtered_workflows", []dbOperationsWorkflow.TotalFilteredData{
			{
				Count: 1,
			},
		}},
		{"scheduled_workflows", []dbOperationsWorkflow.ChaosWorkFlowRequest{
			{
				WorkflowRuns: []*dbOperationsWorkflow.ChaosWorkflowRun{
					{
						WorkflowRunID: workflowID,
					},
				},
			},
		}}},
	}
	testcases := []struct {
		name    string
		request model.ListWorkflowsRequest
		given   func()
		isError bool
	}{
		{
			name: "success",
			request: model.ListWorkflowsRequest{
				ProjectID:   uuid.NewString(),
				WorkflowIDs: []*string{&workflowID},
				Pagination:  &model.Pagination{Page: 1},
				Filter: &model.WorkflowFilterInput{
					WorkflowName: &workflowName,
					ClusterName:  &clusterName,
				},
			},
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("Aggregate", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
				clusterService.On("GetCluster", mock.Anything).Return(cluster, nil).Once()
			},
		},
		{
			name: "success: MongoOperator Aggregate returns empty cursor",
			request: model.ListWorkflowsRequest{
				ProjectID:   uuid.NewString(),
				WorkflowIDs: []*string{&workflowID},
				Pagination:  &model.Pagination{Page: 1},
				Filter: &model.WorkflowFilterInput{
					WorkflowName: &workflowName,
					ClusterName:  &clusterName,
				},
			},
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("Aggregate", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "success: with sort by descending order of name",
			request: model.ListWorkflowsRequest{
				ProjectID:   uuid.NewString(),
				WorkflowIDs: []*string{&workflowID},
				Pagination:  &model.Pagination{Page: 1},
				Filter: &model.WorkflowFilterInput{
					WorkflowName: &workflowName,
					ClusterName:  &clusterName,
				},
				Sort: &model.WorkflowSortInput{
					Field: model.WorkflowSortingFieldName,
				},
			},
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("Aggregate", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
				clusterService.On("GetCluster", mock.Anything).Return(cluster, nil).Once()
			},
		},
		{
			name: "success: with sort by descending order of time",
			request: model.ListWorkflowsRequest{
				ProjectID:   uuid.NewString(),
				WorkflowIDs: []*string{&workflowID},
				Pagination:  &model.Pagination{Page: 1},
				Filter: &model.WorkflowFilterInput{
					WorkflowName: &workflowName,
					ClusterName:  &clusterName,
				},
				Sort: &model.WorkflowSortInput{
					Field: model.WorkflowSortingFieldTime,
				},
			},
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("Aggregate", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()
				clusterService.On("GetCluster", mock.Anything).Return(cluster, nil).Once()
			},
		},
		{
			name: "failure: GetAggregateWorkflows failed",
			request: model.ListWorkflowsRequest{
				ProjectID:   uuid.NewString(),
				WorkflowIDs: []*string{&workflowID},
				Pagination:  &model.Pagination{Page: 1},
				Filter: &model.WorkflowFilterInput{
					WorkflowName: &workflowName,
					ClusterName:  &clusterName,
				},
			},
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("Aggregate", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(cursor, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := chaosWorkflowHandler.ListWorkflows(tc.request)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowHandler_PodLog is used to test the PodLog method
func TestChaosWorkflowHandler_PodLog(t *testing.T) {
	// given
	state := store.NewStore()
	cluster := dbSchemaCluster.Cluster{ProjectID: uuid.NewString(), ClusterID: uuid.NewString()}
	testcases := []struct {
		name    string
		request model.PodLog
		given   func()
		isError bool
	}{
		{
			name: "success",
			request: model.PodLog{
				RequestID:     uuid.NewString(),
				WorkflowRunID: uuid.NewString(),
				ClusterID:     &model.ClusterIdentity{ClusterID: cluster.ClusterID},
			},
			given: func() {
				clusterService.On("VerifyCluster", mock.Anything).Return(&cluster, nil).Once()
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			action := make(chan *model.PodLogResponse, 1)
			t.Cleanup(func() { delete(state.WorkflowLog, tc.request.RequestID) })
			state.WorkflowLog[tc.request.RequestID] = action
			// when
			_, err := chaosWorkflowHandler.PodLog(tc.request, *state)
			// then
			select {
			case result := <-action:
				assert.Equal(t, tc.request.WorkflowRunID, result.WorkflowRunID)
			case <-time.After(5 * time.Second):
				t.Errorf("timeout")
			}
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowHandler_GetLogs is used to test the GetLogs method
func TestChaosWorkflowHandler_GetLogs(t *testing.T) {
	// given
	state := store.NewStore()
	requestID := uuid.NewString()
	testcases := []struct {
		name    string
		pod     model.PodLogRequest
		isError bool
	}{
		{
			name: "success",
			pod: model.PodLogRequest{
				WorkflowRunID: uuid.NewString(),
				ClusterID:     uuid.NewString(),
				PodName:       uuid.NewString(),
				PodType:       uuid.NewString(),
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			action := make(chan *model.PodLogResponse, 1)
			t.Cleanup(func() { delete(state.WorkflowLog, requestID) })
			state.WorkflowLog[requestID] = action
			// when
			chaosWorkflowHandler.GetLogs(requestID, tc.pod, *state)
			// then
			select {
			case result := <-action:
				assert.Equal(t, tc.pod.WorkflowRunID, result.WorkflowRunID)
			case <-time.After(5 * time.Second):
				t.Errorf("timeout")
			}
		})
	}
}

// TestChaosWorkflowHandler_ChaosWorkflowRun is used to test the ChaosWorkflowRun method
func TestChaosWorkflowHandler_ChaosWorkflowRun(t *testing.T) {
	// given
	clusterID := uuid.NewString()
	cluster := &dbSchemaCluster.Cluster{
		ProjectID: uuid.NewString(),
		ClusterID: clusterID,
	}
	state := store.NewStore()
	testcases := []struct {
		name    string
		request model.WorkflowRunRequest
		given   func()
		isError bool
	}{
		{
			name: "success",
			request: model.WorkflowRunRequest{
				ClusterID:     &model.ClusterIdentity{ClusterID: clusterID},
				WorkflowID:    uuid.NewString(),
				WorkflowRunID: uuid.NewString(),
			},
			given: func() {
				clusterService.On("VerifyCluster", mock.Anything).Return(cluster, nil).Once()
				mongoOperator.On("CountDocuments", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(int64(1), nil).Once()
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
				chaosWorkflowService.On("SendWorkflowEvent", mock.Anything, state).Return().Once()
			},
		},
		{
			name: "success: workflow execution completed",
			request: model.WorkflowRunRequest{
				ClusterID:     &model.ClusterIdentity{ClusterID: clusterID},
				WorkflowID:    uuid.NewString(),
				WorkflowRunID: uuid.NewString(),
				Completed:     true,
			},
			given: func() {
				clusterService.On("VerifyCluster", mock.Anything).Return(cluster, nil).Once()
				mongoOperator.On("CountDocuments", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(int64(1), nil).Once()
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
				chaosWorkflowService.On("SendWorkflowEvent", mock.Anything, state).Return().Once()
				chaosWorkflowService.On("ProcessCompletedWorkflowRun", mock.Anything, mock.Anything).Return(chaosWorkflow.WorkflowRunMetrics{}, nil).Once()
			},
		},
		{
			name: "failure: cannot verify cluster",
			request: model.WorkflowRunRequest{
				ClusterID:     &model.ClusterIdentity{ClusterID: clusterID},
				WorkflowID:    uuid.NewString(),
				WorkflowRunID: uuid.NewString(),
			},
			given: func() {
				clusterService.On("VerifyCluster", mock.Anything).Return(cluster, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "failure: cannot Update workflowRun",
			request: model.WorkflowRunRequest{
				ClusterID:     &model.ClusterIdentity{ClusterID: clusterID},
				WorkflowID:    uuid.NewString(),
				WorkflowRunID: uuid.NewString(),
			},
			given: func() {
				clusterService.On("VerifyCluster", mock.Anything).Return(cluster, nil).Once()
				mongoOperator.On("CountDocuments", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(int64(1), errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "success: discard duplicated event",
			request: model.WorkflowRunRequest{
				ClusterID:     &model.ClusterIdentity{ClusterID: clusterID},
				WorkflowID:    uuid.NewString(),
				WorkflowRunID: uuid.NewString(),
			},
			given: func() {
				clusterService.On("VerifyCluster", mock.Anything).Return(cluster, nil).Once()
				mongoOperator.On("CountDocuments", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything).Return(int64(1), nil).Once()
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 0}, nil).Once()
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := chaosWorkflowHandler.ChaosWorkflowRun(tc.request, *state)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowHandler_ReRunChaosWorkFlow is used to test the ReRunChaosWorkFlow method
func TestChaosWorkflowHandler_ReRunChaosWorkFlow(t *testing.T) {
	// given
	projectID := uuid.NewString()
	workflowID := uuid.NewString()
	clusterID := uuid.NewString()
	cluster := dbSchemaCluster.Cluster{
		ClusterID: clusterID,
		IsActive:  true,
	}
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success",
			given: func() {
				findResult := []interface{}{bson.D{{"workflow_id", workflowID}, {"workflow_manifest", "{\"kind\":\"job\""}, {"project_id", projectID}, {"cluster_id", clusterID}}}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, nil).Once()
				clusterService.On("GetCluster", mock.Anything).Return(cluster, nil).Once()
			},
		},
		{
			name: "failure: cannot get workflow",
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "failure: workflow count 0",
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, nil).Once()
			},
			isError: true,
		},
		{
			name: "failure: cron job cannot be re-run",
			given: func() {
				findResult := []interface{}{bson.D{{"workflow_id", workflowID}, {"workflow_manifest", "{\"kind\":\"cronworkflow\""}, {"project_id", projectID}, {"cluster_id", clusterID}}}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, nil).Once()
			},
			isError: true,
		},
		{
			name: "failure: mongo operator cannot GetCluster",
			given: func() {
				findResult := []interface{}{bson.D{{"workflow_id", workflowID}, {"workflow_manifest", "{\"kind\":\"job\""}, {"project_id", projectID}, {"cluster_id", clusterID}}}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, nil).Once()
				clusterService.On("GetCluster", mock.Anything).Return(cluster, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "failure: mongo operator cannot GetCluster",
			given: func() {
				findResult := []interface{}{bson.D{{"workflow_id", workflowID}, {"workflow_manifest", "{\"kind\":\"job\""}, {"project_id", projectID}, {"cluster_id", clusterID}}}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				notActivatedCluster := dbSchemaCluster.Cluster{IsActive: false}
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, nil).Once()
				clusterService.On("GetCluster", mock.Anything).Return(notActivatedCluster, nil).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := chaosWorkflowHandler.ReRunChaosWorkFlow(projectID, workflowID, uuid.NewString())
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowHandler_KubeObj is used to test the KubeObj method
func TestChaosWorkflowHandler_KubeObj(t *testing.T) {
	// given
	state := store.NewStore()
	cluster := dbSchemaCluster.Cluster{ProjectID: uuid.NewString(), ClusterID: uuid.NewString()}
	testcases := []struct {
		name    string
		request model.KubeObjectData
		given   func()
		isError bool
	}{
		{
			name: "success",
			request: model.KubeObjectData{
				RequestID: uuid.NewString(),
				ClusterID: &model.ClusterIdentity{ClusterID: cluster.ClusterID},
				KubeObj:   uuid.NewString(),
			},
			given: func() {
				clusterService.On("VerifyCluster", mock.Anything).Return(&cluster, nil).Once()
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			action := make(chan *model.KubeObjectResponse, 1)
			t.Cleanup(func() { delete(state.KubeObjectData, tc.request.RequestID) })
			state.KubeObjectData[tc.request.RequestID] = action
			// when
			_, err := chaosWorkflowHandler.KubeObj(tc.request, *state)
			// then
			select {
			case result := <-action:
				assert.Equal(t, tc.request.KubeObj, result.KubeObj)
			case <-time.After(5 * time.Second):
				t.Errorf("timeout")
			}
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowHandler_GetKubeObjData is used to test the GetKubeObjData method
func TestChaosWorkflowHandler_GetKubeObjData(t *testing.T) {
	// given
	state := store.NewStore()
	requestID := uuid.NewString()
	testcases := []struct {
		name    string
		pod     model.KubeObjectRequest
		isError bool
	}{
		{
			name: "success",
			pod: model.KubeObjectRequest{
				ClusterID: uuid.NewString(),
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			action := make(chan *model.KubeObjectResponse, 1)
			t.Cleanup(func() { delete(state.KubeObjectData, requestID) })
			state.KubeObjectData[requestID] = action
			// when
			chaosWorkflowHandler.GetKubeObjData(requestID, tc.pod, *state)
			// then
			select {
			case result := <-action:
				assert.Equal(t, tc.pod.ClusterID, result.ClusterID)
			case <-time.After(5 * time.Second):
				t.Errorf("timeout")
			}
		})
	}
}

// TestChaosWorkflowHandler_CreateWorkflowTemplate is used to test the CreateWorkflowTemplate method
func TestChaosWorkflowHandler_CreateWorkflowTemplate(t *testing.T) {
	// TODO: add test after refactoring grpc code
}

// TestChaosWorkflowHandler_ListWorkflowManifests is used to test the ListWorkflowManifests method
func TestChaosWorkflowHandler_ListWorkflowManifests(t *testing.T) {
	// given
	ctx := context.Background()
	projectID := uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success",
			given: func() {
				findResult := []interface{}{bson.D{{"project_id", projectID}}}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowTemplateCollection, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "failure: mongo operator cannot list workflow templates",
			given: func() {
				findResult := []interface{}{bson.D{{"project_id", projectID}}}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowTemplateCollection, mock.Anything).Return(cursor, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			manifests, err := chaosWorkflowHandler.ListWorkflowManifests(ctx, projectID)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, 1, len(manifests))
				assert.Equal(t, projectID, manifests[0].ProjectID)
			}
		})
	}
}

// TestChaosWorkflowHandler_GetWorkflowManifestByID is used to test the GetWorkflowManifestByID method
func TestChaosWorkflowHandler_GetWorkflowManifestByID(t *testing.T) {
	// given
	ctx := context.Background()
	templateID := uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success",
			given: func() {
				findResult := bson.D{{"template_id", templateID}, {"project_id", uuid.NewString()}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowTemplateCollection, mock.Anything).Return(singleResult, nil).Once()
			},
		},
		{
			name: "failure: mongo operator cannot get workflow template",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowTemplateCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			manifest, err := chaosWorkflowHandler.GetWorkflowManifestByID(ctx, templateID)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, templateID, manifest.TemplateID)
			}
		})
	}
}

// TestChaosWorkflowHandler_DeleteWorkflowTemplate is used to test the DeleteWorkflowTemplate method
func TestChaosWorkflowHandler_DeleteWorkflowTemplate(t *testing.T) {
	// given
	ctx := context.Background()
	templateID := uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success",
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowTemplateCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
			},
		},
		{
			name: "failure: mongo operator cannot update workflow template",
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowTemplateCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			success, err := chaosWorkflowHandler.DeleteWorkflowTemplate(ctx, uuid.NewString(), templateID)
			// then
			if tc.isError {
				assert.Error(t, err)
				assert.False(t, success)
			} else {
				assert.NoError(t, err)
				assert.True(t, success)
			}
		})
	}
}

// TestChaosWorkflowHandler_SyncWorkflowRuns is used to test the SyncWorkflowRuns method
func TestChaosWorkflowHandler_SyncWorkflowRuns(t *testing.T) {
	// given
	ctx := context.Background()
	state := store.NewStore()
	projectID := uuid.NewString()
	workflowID := uuid.NewString()
	workflowRunID := uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success",
			given: func() {
				findResult := bson.D{{"workflow_id", workflowID}, {"project_id", projectID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowRunSync", workflowID, &workflowRunID, mock.Anything, state).Return(nil).Once()
			},
		},
		{
			name: "failure: mongo operator cannot get workflow",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "failure: workflow has been removed",
			given: func() {
				findResult := bson.D{{"workflow_id", workflowID}, {"isRemoved", true}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			isError: true,
		},
		{
			name: "failure: ProcessWorkflowRunSync failed",
			given: func() {
				findResult := bson.D{{"workflow_id", workflowID}, {"project_id", projectID}, {"workflow_runs", []*dbOperationsWorkflow.ChaosWorkflowRun{{WorkflowRunID: workflowRunID}}}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
				chaosWorkflowService.On("ProcessWorkflowRunSync", workflowID, &workflowRunID, mock.Anything, state).Return(errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			success, err := chaosWorkflowHandler.SyncWorkflowRun(ctx, projectID, workflowID, workflowRunID, state)
			// then
			if tc.isError {
				assert.Error(t, err)
				assert.False(t, success)
			} else {
				assert.NoError(t, err)
				assert.True(t, success)
			}
		})
	}
}

// TestChaosWorkflowHandler_QueryServerVersion is used to test the QueryServerVersion method
func TestChaosWorkflowHandler_QueryServerVersion(t *testing.T) {
	// given
	ctx := context.Background()
	key, value := uuid.NewString(), uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success",
			given: func() {
				findResult := bson.D{{"key", key}, {"value", value}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ServerConfigCollection, mock.Anything).Return(singleResult, nil).Once()
			},
		},
		{
			name: "failure: mongo operator cannot get workflow template",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ServerConfigCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			response, err := chaosWorkflowHandler.QueryServerVersion(ctx)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, key, response.Key)
				assert.Equal(t, value, response.Value)
			}
		})
	}
}
