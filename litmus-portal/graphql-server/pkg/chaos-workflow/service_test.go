package chaos_workflow_test

import (
	"errors"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/ghodss/yaml"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	chaosWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model/mocks"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	workflowDBOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	workflowName              = "test-podtato-head-1682669740"
	wrongTypeName             = "wrong"
	chaosEngineName           = "nginx-chaos"
	chaosScheduleName         = "schedule-nginx"
	workflowManifestPath      = "./model/mocks/workflow.yaml"
	cronWorkflowManifestPath  = "./model/mocks/workflow_cron.yaml"
	wrongTypeManifestPath     = "./model/mocks/wrong_type.yaml"
	chaosEngineManifestPath   = "./model/mocks/engine.yaml"
	chaosScheduleManifestPath = "./model/mocks/schedule.yaml"
)

var (
	mongoOperator             = new(mocks.MongoOperator)
	mockChaosWorkflowOperator = dbOperationsWorkflow.NewChaosWorkflowOperator(mongoOperator)
	mockClusterOperator       = dbSchemaCluster.NewClusterOperator(mongoOperator)
	mockService               = chaosWorkflow.NewService(mockChaosWorkflowOperator, mockClusterOperator)
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// TestNewService tests the NewService function
func TestNewService(t *testing.T) {
	// then
	t.Run("success", func(t *testing.T) {
		assert.Equal(t, mockService, chaosWorkflow.NewService(mockChaosWorkflowOperator, mockClusterOperator))
		assert.Equal(t, mockService, chaosWorkflow.NewService(mockChaosWorkflowOperator, mockClusterOperator))
	})
}

func loadYAMLData(path string) (string, error) {
	YAMLData, err := ioutil.ReadFile(path)
	if err != nil {
		return "", err
	}
	jsonData, err := yaml.YAMLToJSON(YAMLData)
	if err != nil {
		return "", err
	}
	return string(jsonData), nil
}

// TestChaosWorkflowService_ProcessWorkflow is used to test the ProcessWorkflow method
func TestChaosWorkflowService_ProcessWorkflow(t *testing.T) {
	// given
	projectID := uuid.NewString()
	singleResult := mongo.NewSingleResultFromDocument(bson.D{{"project_id", projectID}}, nil, nil)
	testcases := []struct {
		name     string
		workflow *model.ChaosWorkFlowRequest
		isError  bool
		given    func(workflow *model.ChaosWorkFlowRequest)
	}{
		{
			name: "success: object kind is workflow",
			workflow: &model.ChaosWorkFlowRequest{
				WorkflowName: workflowName,
				ProjectID:    projectID,
			},
			given: func(workflow *model.ChaosWorkFlowRequest) {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				manifest, err := loadYAMLData(workflowManifestPath)
				if err != nil {
					t.FailNow()
				}
				workflow.WorkflowManifest = manifest
			},
		},
		{
			name: "success: object kind is cron workflow",
			workflow: &model.ChaosWorkFlowRequest{
				WorkflowName: workflowName,
				ProjectID:    projectID,
			},
			given: func(workflow *model.ChaosWorkFlowRequest) {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				manifest, err := loadYAMLData(cronWorkflowManifestPath)
				if err != nil {
					t.FailNow()
				}
				workflow.WorkflowManifest = manifest
			},
		},
		{
			name: "success: object kind is chaos engine",
			workflow: &model.ChaosWorkFlowRequest{
				WorkflowName: chaosEngineName,
				ProjectID:    projectID,
			},
			given: func(workflow *model.ChaosWorkFlowRequest) {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				manifest, err := loadYAMLData(chaosEngineManifestPath)
				if err != nil {
					t.FailNow()
				}
				workflow.WorkflowManifest = manifest
			},
		},
		{
			name: "success: object kind is chaos schedule",
			workflow: &model.ChaosWorkFlowRequest{
				WorkflowName: chaosScheduleName,
				ProjectID:    projectID,
			},
			given: func(workflow *model.ChaosWorkFlowRequest) {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				manifest, err := loadYAMLData(chaosScheduleManifestPath)
				if err != nil {
					t.FailNow()
				}
				workflow.WorkflowManifest = manifest
			},
		},
		{
			name: "failure: object kind is unknown",
			workflow: &model.ChaosWorkFlowRequest{
				WorkflowName: wrongTypeName,
				ProjectID:    projectID,
			},
			given: func(workflow *model.ChaosWorkFlowRequest) {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				manifest, err := loadYAMLData(wrongTypeManifestPath)
				if err != nil {
					t.FailNow()
				}
				workflow.WorkflowManifest = manifest
			},
			isError: true,
		},
		{
			name:     "failure: cannot get cluster",
			workflow: &model.ChaosWorkFlowRequest{},
			given: func(workflow *model.ChaosWorkFlowRequest) {
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "failure: cluster's projectID is not equal to workflow's projectID",
			workflow: &model.ChaosWorkFlowRequest{
				ProjectID: projectID,
			},
			given: func(workflow *model.ChaosWorkFlowRequest) {
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(
					mongo.NewSingleResultFromDocument(bson.D{{"project_id", uuid.NewString()}}, nil, nil), nil,
				).Once()
			},
			isError: true,
		},
		{
			name: "failure: cannot unmarshal object metadata",
			workflow: &model.ChaosWorkFlowRequest{
				ProjectID: projectID,
			},
			given: func(workflow *model.ChaosWorkFlowRequest) {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				workflow.WorkflowManifest = "invalid json"
			},
			isError: true,
		},
		{
			name: "failure: workflow name not matched with object metadata name",
			workflow: &model.ChaosWorkFlowRequest{
				ProjectID:    projectID,
				WorkflowName: uuid.NewString(),
			},
			given: func(workflow *model.ChaosWorkFlowRequest) {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				manifest, err := loadYAMLData(workflowManifestPath)
				if err != nil {
					t.FailNow()
				}
				workflow.WorkflowManifest = manifest
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given(tc.workflow)
			// when
			_, _, err := mockService.ProcessWorkflow(tc.workflow)
			if tc.isError {
				// then
				assert.Error(t, err)
			} else {
				// then
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowService_ProcessWorkflowCreation is used to test the ProcessWorkflowCreation method
func TestChaosWorkflowService_ProcessWorkflowCreation(t *testing.T) {
	// given
	state := store.NewStore()
	workflowID, username := uuid.NewString(), uuid.NewString()
	workflow := &model.ChaosWorkFlowRequest{
		WorkflowID:       &workflowID,
		ProjectID:        uuid.NewString(),
		ClusterID:        uuid.NewString(),
		WorkflowManifest: uuid.NewString(),
	}
	findResult := bson.D{{"project_id", workflow.ProjectID}}
	singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
	wfType := dbOperationsWorkflow.Workflow
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success: workflow created successfully",
			given: func() {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				mongoOperator.On("Create", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(nil).Once()
			},
		},
		{
			name: "failure: cannot get cluster",
			given: func() {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "failure: cannot insert workflow",
			given: func() {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				mongoOperator.On("Create", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			if tc.isError {
				// when
				err := mockService.ProcessWorkflowCreation(workflow, username, &wfType, state)
				// then
				assert.Error(t, err)
			} else {
				// given
				action := make(chan *model.ClusterActionResponse, 1)
				t.Cleanup(func() { delete(state.ConnectedCluster, workflow.ClusterID) })
				state.ConnectedCluster[workflow.ClusterID] = action
				// when
				err := mockService.ProcessWorkflowCreation(workflow, username, &wfType, state)
				// then
				assert.NoError(t, err)
				select {
				case result := <-action:
					assert.Equal(t, workflow.ProjectID, result.ProjectID)
					assert.Equal(t, username, *result.Action.Username)
				case <-time.After(5 * time.Second):
					t.Errorf("timeout")
				}
			}
		})
	}
}

// TestChaosWorkflowService_ProcessWorkflowUpdate is used to test the ProcessWorkflowUpdate method
func TestChaosWorkflowService_ProcessWorkflowUpdate(t *testing.T) {
	// given
	state := store.NewStore()
	workflowID, username := uuid.NewString(), uuid.NewString()
	wfType := dbOperationsWorkflow.Workflow
	workflow := &model.ChaosWorkFlowRequest{
		WorkflowID:       &workflowID,
		ProjectID:        uuid.NewString(),
		ClusterID:        uuid.NewString(),
		WorkflowManifest: uuid.NewString(),
	}
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success: workflow updated successfully",
			given: func() {
				// given
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
			},
		},
		{
			name: "failure: cannot update workflow",
			given: func() {
				// given
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			if tc.isError {
				// when
				err := mockService.ProcessWorkflowUpdate(workflow, username, &wfType, state)
				// then
				assert.Error(t, err)
			} else {
				// given
				action := make(chan *model.ClusterActionResponse, 1)
				t.Cleanup(func() { delete(state.ConnectedCluster, workflow.ClusterID) })
				state.ConnectedCluster[workflow.ClusterID] = action
				// when
				err := mockService.ProcessWorkflowUpdate(workflow, username, &wfType, state)
				// then
				assert.NoError(t, err)
				select {
				case result := <-action:
					assert.Equal(t, workflow.ProjectID, result.ProjectID)
					assert.Equal(t, username, *result.Action.Username)
				case <-time.After(5 * time.Second):
					t.Errorf("timeout")
				}
			}
		})
	}
}

// TestChaosWorkflowService_ProcessWorkflowDelete is used to test the ProcessWorkflowDelete method
func TestChaosWorkflowService_ProcessWorkflowDelete(t *testing.T) {
	// given
	state := store.NewStore()
	username := uuid.NewString()
	workflow := workflowDBOps.ChaosWorkFlowRequest{
		ProjectID:        uuid.NewString(),
		ClusterID:        uuid.NewString(),
		WorkflowManifest: uuid.NewString(),
	}
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success: workflow deleted successfully",
			given: func() {
				// given
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
			},
		},
		{
			name: "failure: cannot delete workflow",
			given: func() {
				// given
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			if tc.isError {
				// when
				err := mockService.ProcessWorkflowDelete(bson.D{}, workflow, username, state)
				// then
				assert.Error(t, err)
			} else {
				// given
				action := make(chan *model.ClusterActionResponse, 1)
				t.Cleanup(func() { delete(state.ConnectedCluster, workflow.ClusterID) })
				state.ConnectedCluster[workflow.ClusterID] = action
				// when
				err := mockService.ProcessWorkflowDelete(bson.D{}, workflow, username, state)
				// then
				assert.NoError(t, err)
				select {
				case result := <-action:
					assert.Equal(t, workflow.ProjectID, result.ProjectID)
					assert.Equal(t, username, *result.Action.Username)
				case <-time.After(5 * time.Second):
					t.Errorf("timeout")
				}
			}
		})
	}
}

// TestChaosWorkflowService_ProcessWorkflowRunDelete is used to test the ProcessWorkflowRunDelete method
func TestChaosWorkflowService_ProcessWorkflowRunDelete(t *testing.T) {
	// given
	state := store.NewStore()
	username, workflowRunID := uuid.NewString(), uuid.NewString()
	workflow := workflowDBOps.ChaosWorkFlowRequest{
		ProjectID:        uuid.NewString(),
		ClusterID:        uuid.NewString(),
		WorkflowManifest: uuid.NewString(),
	}
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success: workflowRun deleted successfully",
			given: func() {
				// given
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
			},
		},
		{
			name: "failure: cannot delete workflowRun",
			given: func() {
				// given
				mongoOperator.On("Update", mock.Anything, mongodb.WorkflowCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			if tc.isError {
				// when
				err := mockService.ProcessWorkflowRunDelete(bson.D{}, &workflowRunID, workflow, username, state)
				// then
				assert.Error(t, err)
			} else {
				// given
				action := make(chan *model.ClusterActionResponse, 1)
				t.Cleanup(func() { delete(state.ConnectedCluster, workflow.ClusterID) })
				state.ConnectedCluster[workflow.ClusterID] = action
				// when
				err := mockService.ProcessWorkflowRunDelete(bson.D{}, &workflowRunID, workflow, username, state)
				// then
				assert.NoError(t, err)
				select {
				case result := <-action:
					assert.Equal(t, workflow.ProjectID, result.ProjectID)
					assert.Equal(t, username, *result.Action.Username)
				case <-time.After(5 * time.Second):
					t.Errorf("timeout")
				}
			}
		})
	}
}

// TestChaosWorkflowService_ProcessWorkflowRunSync is used to test the ProcessWorkflowRunSync method
func TestChaosWorkflowService_ProcessWorkflowRunSync(t *testing.T) {
	// given
	state := store.NewStore()
	workflowID, workflowRunID := uuid.NewString(), uuid.NewString()
	workflow := workflowDBOps.ChaosWorkFlowRequest{
		ProjectID:        uuid.NewString(),
		ClusterID:        uuid.NewString(),
		WorkflowManifest: uuid.NewString(),
	}
	t.Run("success: workflowRun deleted successfully", func(t *testing.T) {
		// given
		action := make(chan *model.ClusterActionResponse, 1)
		t.Cleanup(func() { delete(state.ConnectedCluster, workflow.ClusterID) })
		state.ConnectedCluster[workflow.ClusterID] = action
		// when
		err := mockService.ProcessWorkflowRunSync(workflowID, &workflowRunID, workflow, state)
		// then
		assert.NoError(t, err)
		select {
		case result := <-action:
			assert.Equal(t, workflow.ProjectID, result.ProjectID)
		case <-time.After(5 * time.Second):
			t.Errorf("timeout")
		}
	})
}

// TestChaosWorkflowService_SendWorkflowEvent is used to test the SendWorkflowEvent method
func TestChaosWorkflowService_SendWorkflowEvent(t *testing.T) {
	// given
	state := store.NewStore()
	workflowRun := model.WorkflowRun{
		WorkflowID: uuid.NewString(),
		ProjectID:  uuid.NewString(),
		ClusterID:  uuid.NewString(),
	}
	t.Run("success: SendWorkflowEvent executed successfully", func(t *testing.T) {
		// given
		action := make(chan *model.WorkflowRun, 1)
		t.Cleanup(func() { close(state.WorkflowEventPublish[workflowRun.ProjectID][0]) })
		state.WorkflowEventPublish[workflowRun.ProjectID] = append(state.WorkflowEventPublish[workflowRun.ProjectID], action)
		// when
		mockService.SendWorkflowEvent(workflowRun, state)
		// then
		select {
		case result := <-action:
			assert.Equal(t, workflowRun.ProjectID, result.ProjectID)
		case <-time.After(5 * time.Second):
			t.Errorf("timeout")
		}
	})
}

// TestChaosWorkflowService_ProcessCompletedWorkflowRun is used to test the ProcessCompletedWorkflowRun method
func TestChaosWorkflowService_ProcessCompletedWorkflowRun(t *testing.T) {
	// given
	executionData := chaosWorkflow.ExecutionData{
		Nodes: map[string]chaosWorkflow.Node{
			"node1": {
				ChaosExp: &chaosWorkflow.ChaosData{
					EngineName:        uuid.NewString(),
					ExperimentVerdict: "Pass",
				},
				Type: "ChaosEngine",
			},
		},
	}
	workflowID := uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success",
			given: func() {
				findResult := []interface{}{bson.D{{"workflow_id", workflowID}, {"weightages", []*model.WeightagesInput{{ExperimentName: uuid.NewString(), Weightage: 10}}}}}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "failure: cannot find workflowRun",
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, errors.New("")).Once()
			},
			isError: true,
		},
		{
			name: "failure: couldn't find the unique workflow",
			given: func() {
				findResult := []interface{}{bson.D{{"workflow_id", workflowID}}, bson.D{{"workflow_id", uuid.NewString()}}}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, nil).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			if tc.isError {
				// when
				_, err := mockService.ProcessCompletedWorkflowRun(executionData, workflowID)
				// then
				assert.Error(t, err)
			} else {
				// when
				_, err := mockService.ProcessCompletedWorkflowRun(executionData, workflowID)
				// then
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowService_GetWorkflow is used to test the GetWorkflow method
func TestChaosWorkflowService_GetWorkflow(t *testing.T) {
	// given
	findResult := bson.D{{"workflow_id", uuid.NewString()}}
	singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
	testcases := []struct {
		name    string
		isError bool
		given   func()
	}{
		{
			name: "success",
			given: func() {
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, nil).Once()
			},
		},
		{
			name: "failure: mongo error",
			given: func() {
				mongoOperator.On("Get", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := mockService.GetWorkflow(bson.D{})
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestChaosWorkflowService_GetWorkflows is used to test the GetWorkflows method
func TestChaosWorkflowService_GetWorkflows(t *testing.T) {
	// given
	findResult := []interface{}{bson.D{{"workflow_id", uuid.NewString()}}}
	cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
	testcases := []struct {
		name    string
		isError bool
		given   func()
	}{
		{
			name: "success",
			given: func() {
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "failure: mongo error",
			given: func() {
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(cursor, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := mockService.GetWorkflows(bson.D{})
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
