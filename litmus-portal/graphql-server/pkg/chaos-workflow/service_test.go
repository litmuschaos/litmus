package chaos_workflow_test

import (
	"io/ioutil"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	chaosWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	mocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
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

// TestChaosWorkflowService_ProcessWorkflow is used to test the ProcessWorkflow method
func TestChaosWorkflowService_ProcessWorkflow(t *testing.T) {

}

// TestChaosWorkflowService_ProcessWorkflowCreation is used to test the ProcessWorkflowCreation method
func TestChaosWorkflowService_ProcessWorkflowCreation(t *testing.T) {

}

// TestChaosWorkflowService_ProcessWorkflowUpdate is used to test the ProcessWorkflowUpdate method
func TestChaosWorkflowService_ProcessWorkflowUpdate(t *testing.T) {

}

// TestChaosWorkflowService_ProcessWorkflowDelete is used to test the ProcessWorkflowDelete method
func TestChaosWorkflowService_ProcessWorkflowDelete(t *testing.T) {

}

// TestChaosWorkflowService_ProcessWorkflowRunDelete is used to test the ProcessWorkflowRunDelete method
func TestChaosWorkflowService_ProcessWorkflowRunDelete(t *testing.T) {

}

// TestChaosWorkflowService_ProcessWorkflowRunSync is used to test the ProcessWorkflowRunSync method
func TestChaosWorkflowService_ProcessWorkflowRunSync(t *testing.T) {

}

// TestChaosWorkflowService_SendWorkflowEvent is used to test the SendWorkflowEvent method
func TestChaosWorkflowService_SendWorkflowEvent(t *testing.T) {

}

// TestChaosWorkflowService_ProcessCompletedWorkflowRun is used to test the ProcessCompletedWorkflowRun method
func TestChaosWorkflowService_ProcessCompletedWorkflowRun(t *testing.T) {

}

// TestChaosWorkflowService_GetWorkflow is used to test the GetWorkflow method
func TestChaosWorkflowService_GetWorkflow(t *testing.T) {

}

// TestChaosWorkflowService_GetWorkflows is used to test the GetWorkflows method
func TestChaosWorkflowService_GetWorkflows(t *testing.T) {

}
