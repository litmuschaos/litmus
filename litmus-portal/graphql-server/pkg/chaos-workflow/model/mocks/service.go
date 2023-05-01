// Package mocks ...
package mocks

import (
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	chaosWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbSchemaWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	workflowDBOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
)

type ChaosWorkflowService struct {
	mock.Mock
}

// ProcessWorkflow mocks the ProcessWorkflow of chaos-workflow service
func (c *ChaosWorkflowService) ProcessWorkflow(workflow *model.ChaosWorkFlowRequest) (*model.ChaosWorkFlowRequest, *dbSchemaWorkflow.ChaosWorkflowType, error) {
	args := c.Called(workflow)
	return args.Get(0).(*model.ChaosWorkFlowRequest), args.Get(1).(*dbSchemaWorkflow.ChaosWorkflowType), args.Error(2)
}

// ProcessWorkflowCreation mocks the ProcessWorkflowCreation of chaos-workflow service
func (c *ChaosWorkflowService) ProcessWorkflowCreation(input *model.ChaosWorkFlowRequest, username string, wfType *dbSchemaWorkflow.ChaosWorkflowType, r *store.StateData) error {
	args := c.Called(input, username, wfType, r)
	return args.Error(0)
}

// ProcessWorkflowUpdate mocks the ProcessWorkflowUpdate of chaos-workflow service
func (c *ChaosWorkflowService) ProcessWorkflowUpdate(workflow *model.ChaosWorkFlowRequest, username string, wfType *dbSchemaWorkflow.ChaosWorkflowType, r *store.StateData) error {
	args := c.Called(workflow, username, wfType, r)
	return args.Error(0)
}

// ProcessWorkflowDelete mocks the ProcessWorkflowDelete of chaos-workflow service
func (c *ChaosWorkflowService) ProcessWorkflowDelete(query bson.D, workflow workflowDBOps.ChaosWorkFlowRequest, username string, r *store.StateData) error {
	args := c.Called(query, workflow, username, r)
	return args.Error(0)
}

// ProcessWorkflowRunDelete mocks the ProcessWorkflowRunDelete of chaos-workflow service
func (c *ChaosWorkflowService) ProcessWorkflowRunDelete(query bson.D, workflowRunID *string, workflow workflowDBOps.ChaosWorkFlowRequest, username string, r *store.StateData) error {
	args := c.Called(query, workflowRunID, workflow, username, r)
	return args.Error(0)
}

// ProcessWorkflowRunSync mocks the ProcessWorkflowRunSync of chaos-workflow service
func (c *ChaosWorkflowService) ProcessWorkflowRunSync(workflowID string, workflowRunID *string, workflow workflowDBOps.ChaosWorkFlowRequest, r *store.StateData) error {
	args := c.Called(workflowID, workflowRunID, workflow, r)
	return args.Error(0)
}

// SendWorkflowEvent mocks the SendWorkflowEvent of chaos-workflow service
func (c *ChaosWorkflowService) SendWorkflowEvent(wfRun model.WorkflowRun, r *store.StateData) {
	c.Called(wfRun, r)
}

// ProcessCompletedWorkflowRun mocks the ProcessCompletedWorkflowRun of chaos-workflow service
func (c *ChaosWorkflowService) ProcessCompletedWorkflowRun(execData chaosWorkflow.ExecutionData, wfID string) (chaosWorkflow.WorkflowRunMetrics, error) {
	args := c.Called(execData, wfID)
	return args.Get(0).(chaosWorkflow.WorkflowRunMetrics), args.Error(1)
}

// GetWorkflow mocks the GetWorkflow of chaos-workflow service
func (c *ChaosWorkflowService) GetWorkflow(query bson.D) (dbOperationsWorkflow.ChaosWorkFlowRequest, error) {
	args := c.Called(query)
	return args.Get(0).(dbOperationsWorkflow.ChaosWorkFlowRequest), args.Error(1)
}

// GetWorkflows mocks the GetWorkflows of chaos-workflow service
func (c *ChaosWorkflowService) GetWorkflows(query bson.D) ([]dbOperationsWorkflow.ChaosWorkFlowRequest, error) {
	args := c.Called(query)
	return args.Get(0).([]dbOperationsWorkflow.ChaosWorkFlowRequest), args.Error(1)
}
