// Package mocks ...
package mocks

import (
	"context"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

// ClusterService is a mock type for model.ClusterService
type ClusterService struct {
	mock.Mock
}

// GetEndpoint mocks the GetEndpoint of ClusterService
func (c *ClusterService) GetEndpoint(agentType utils.AgentType) (string, error) {
	args := c.Called(agentType)
	return args.String(0), args.Error(1)
}

// GetClusterResource mocks the GetClusterResource of ClusterService
func (c *ClusterService) GetClusterResource(manifest string, namespace string) (*unstructured.Unstructured, error) {
	args := c.Called(manifest, namespace)
	return args.Get(0).(*unstructured.Unstructured), args.Error(1)
}

// RegisterCluster mocks the RegisterCluster of ClusterService
func (c *ClusterService) RegisterCluster(request model.RegisterClusterRequest) (*model.RegisterClusterResponse, error) {
	args := c.Called(request)
	return args.Get(0).(*model.RegisterClusterResponse), args.Error(1)
}

// UpdateCluster mocks the UpdateCluster of ClusterService
func (c *ClusterService) UpdateCluster(query bson.D, update bson.D) error {
	args := c.Called(query, update)
	return args.Error(0)
}

// ConfirmClusterRegistration mocks the ConfirmClusterRegistration of ClusterService
func (c *ClusterService) ConfirmClusterRegistration(request model.ClusterIdentity, r store.StateData) (*model.ConfirmClusterRegistrationResponse, error) {
	args := c.Called(request, r)
	return args.Get(0).(*model.ConfirmClusterRegistrationResponse), args.Error(1)
}

// NewClusterEvent mocks the NewClusterEvent of ClusterService
func (c *ClusterService) NewClusterEvent(request model.NewClusterEventRequest, r store.StateData) (string, error) {
	args := c.Called(request, r)
	return args.String(0), args.Error(1)
}

// DeleteClusters mocks the DeleteClusters of ClusterService
func (c *ClusterService) DeleteClusters(ctx context.Context, projectID string, clusterIds []*string, r store.StateData) (string, error) {
	args := c.Called(ctx, projectID, clusterIds, r)
	return args.String(0), args.Error(1)
}

// ListClusters mocks the ListClusters of ClusterService
func (c *ClusterService) ListClusters(projectID string, clusterType *string) ([]*model.Cluster, error) {
	args := c.Called(projectID, clusterType)
	return args.Get(0).([]*model.Cluster), args.Error(1)
}

// GetAgentDetails mocks the GetAgentDetails of ClusterService
func (c *ClusterService) GetAgentDetails(ctx context.Context, clusterID string, projectID string) (*model.Cluster, error) {
	args := c.Called(ctx, clusterID, projectID)
	return args.Get(0).(*model.Cluster), args.Error(1)
}

// GetManifestWithClusterID mocks the GetManifestWithClusterID of ClusterService
func (c *ClusterService) GetManifestWithClusterID(clusterID string, accessKey string) ([]byte, error) {
	args := c.Called(clusterID, accessKey)
	return args.Get(0).([]byte), args.Error(1)
}

// SendClusterEvent mocks the SendClusterEvent of ClusterService
func (c *ClusterService) SendClusterEvent(eventType, eventName, description string, cluster model.Cluster, r store.StateData) {
	c.Called(eventType, eventName, description, cluster, r)
}

// VerifyCluster mocks the VerifyCluster of ClusterService
func (c *ClusterService) VerifyCluster(identity model.ClusterIdentity) (*dbSchemaCluster.Cluster, error) {
	args := c.Called(identity)
	return args.Get(0).(*dbSchemaCluster.Cluster), args.Error(1)
}

// GetManifest mocks the GetManifest of ClusterService
func (c *ClusterService) GetManifest(token string) ([]byte, int, error) {
	args := c.Called(token)
	return args.Get(0).([]byte), args.Int(1), args.Error(2)
}

// GetCluster mocks the GetCluster of ClusterService
func (c *ClusterService) GetCluster(clusterID string) (dbSchemaCluster.Cluster, error) {
	args := c.Called(clusterID)
	return args.Get(0).(dbSchemaCluster.Cluster), args.Error(1)
}
