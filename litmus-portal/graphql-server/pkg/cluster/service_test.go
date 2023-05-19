// Package cluster_test implements the unit test cases of cluster service functions
package cluster_test

import (
	"context"
	"errors"
	"io/ioutil"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	mongodbMocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"k8s.io/client-go/kubernetes/fake"
)

var (
	mongoOperator         = new(mongodbMocks.MongoOperator)
	clusterOperator       = dbSchemaCluster.NewClusterOperator(mongoOperator)
	chaosWorkflowOperator = workflow.NewChaosWorkflowOperator(mongoOperator)
	kubeClients           = new(k8s.KubeClients)
	clusterService        = cluster.NewService(clusterOperator, chaosWorkflowOperator, kubeClients)
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// TestClusterService_RegisterCluster tests the RegisterCluster function of cluster service
func TestClusterService_RegisterCluster(t *testing.T) {
	// given
	nodeSelector := "key1=value2,key2=value2"
	testcases := []struct {
		name    string
		wantErr bool
		request model.RegisterClusterRequest
		given   func()
	}{
		{
			name:    "success",
			wantErr: false,
			request: model.RegisterClusterRequest{
				NodeSelector: &nodeSelector,
			},
			given: func() {
				utils.Config.ChaosCenterUiEndpoint = "1.2.3.4"
				t.Cleanup(func() { utils.Config.ChaosCenterUiEndpoint = "" })
				mongoOperator.On("Create", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(nil).Once()
			},
		},
		{
			name:    "failure: mongo create error",
			wantErr: true,
			given: func() {
				utils.Config.ChaosCenterUiEndpoint = "1.2.3.4"
				t.Cleanup(func() { utils.Config.ChaosCenterUiEndpoint = "" })
				mongoOperator.On("Create", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(errors.New("")).Once()
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := clusterService.RegisterCluster(tc.request)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterService_UpdateCluster tests the UpdateCluster function of cluster service
func TestClusterService_UpdateCluster(t *testing.T) {
	// given
	testcases := []struct {
		name    string
		wantErr bool
		given   func()
	}{
		{
			name: "success",
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.ClusterCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, nil).Once()
			},
		},
		{
			name:    "failure: mongo update error",
			wantErr: true,
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.ClusterCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, errors.New("")).Once()
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			err := clusterService.UpdateCluster(bson.D{}, bson.D{})
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterService_ConfirmClusterRegistration tests the ConfirmClusterRegistration function of cluster service
func TestClusterService_ConfirmClusterRegistration(t *testing.T) {
	// given
	testcases := []struct {
		name    string
		wantErr bool
		request model.ClusterIdentity
		given   func(request model.ClusterIdentity)
	}{
		{
			name: "success: access key mismatch",
			request: model.ClusterIdentity{
				Version: uuid.NewString(),
			},
			given: func(request model.ClusterIdentity) {
				utils.Config.Version = request.Version
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", uuid.NewString()}, {"access_key", uuid.NewString()}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()

			},
		},
		{
			name: "success: access key match",
			request: model.ClusterIdentity{
				Version:   uuid.NewString(),
				AccessKey: uuid.NewString(),
			},
			given: func(request model.ClusterIdentity) {
				utils.Config.Version = request.Version
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", uuid.NewString()}, {"access_key", request.AccessKey}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				mongoOperator.On("Update", mock.Anything, mongodb.ClusterCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, nil).Once()
			},
		},
		{
			name: "failure: version mismatch",
			request: model.ClusterIdentity{
				Version: uuid.NewString(),
			},
			given: func(request model.ClusterIdentity) {
				utils.Config.Version = uuid.NewString()
			},
			wantErr: true,
		},
		{
			name: "failure: mongo get error",
			request: model.ClusterIdentity{
				Version: uuid.NewString(),
			},
			given: func(request model.ClusterIdentity) {
				utils.Config.Version = request.Version
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: mongo update error",
			request: model.ClusterIdentity{
				Version:   uuid.NewString(),
				AccessKey: uuid.NewString(),
			},
			given: func(request model.ClusterIdentity) {
				utils.Config.Version = request.Version
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", uuid.NewString()}, {"access_key", request.AccessKey}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				mongoOperator.On("Update", mock.Anything, mongodb.ClusterCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given(tc.request)
			// when
			_, err := clusterService.ConfirmClusterRegistration(tc.request, *store.NewStore())
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterService_NewClusterEvent tests the NewClusterEvent function of cluster service
func TestClusterService_NewClusterEvent(t *testing.T) {
	// given
	testcases := []struct {
		name    string
		wantErr bool
		request model.NewClusterEventRequest
		given   func(request model.NewClusterEventRequest)
	}{
		{
			name: "success",
			request: model.NewClusterEventRequest{
				AccessKey: uuid.NewString(),
			},
			given: func(request model.NewClusterEventRequest) {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"is_registered", true}, {"access_key", request.AccessKey}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
			},
		},
		{
			name:    "failure: mongo get error",
			request: model.NewClusterEventRequest{},
			given: func(request model.NewClusterEventRequest) {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
		{
			name:    "failure: cluster not registered",
			request: model.NewClusterEventRequest{},
			given: func(request model.NewClusterEventRequest) {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"access_key", request.AccessKey}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given(tc.request)
			// when
			_, err := clusterService.NewClusterEvent(tc.request, *store.NewStore())
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterService_DeleteClusters tests the DeleteClusters function of cluster service
func TestClusterService_DeleteClusters(t *testing.T) {
	// given
	ctx := context.WithValue(context.Background(), authorization.AuthKey, uuid.NewString())
	clusterID := uuid.NewString()
	type args struct {
		clusterIDs []*string
		projectID  string
	}
	testcases := []struct {
		name    string
		wantErr bool
		args    args
		given   func()
	}{
		{
			name: "success",
			args: args{
				clusterIDs: []*string{&clusterID},
				projectID:  uuid.NewString(),
			},
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.ClusterCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, nil).Once()
				wants := make([]interface{}, 1)
				wants[0] = bson.D{{"project_id", uuid.NewString()}, {"cluster_id", uuid.NewString()}, {"agent_namespace", uuid.NewString()}}
				cursor, _ := mongo.NewCursorFromDocuments(wants, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "failure: mongo update error",
			args: args{
				clusterIDs: []*string{&clusterID},
				projectID:  uuid.NewString(),
			},
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.ClusterCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, errors.New("")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: mongo list error",
			args: args{
				clusterIDs: []*string{&clusterID},
				projectID:  uuid.NewString(),
			},
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.ClusterCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, nil).Once()
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(cursor, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := clusterService.DeleteClusters(ctx, tc.args.projectID, tc.args.clusterIDs, *store.NewStore())
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterService_ListClusters tests the ListClusters function of cluster service
func TestClusterService_ListClusters(t *testing.T) {
	testcases := []struct {
		name    string
		wantErr bool
		given   func(projectID string)
	}{
		{
			name: "success",
			given: func(projectID string) {
				clusters, workflows, clusterID := make([]interface{}, 1), make([]interface{}, 1), uuid.NewString()
				clusters[0] = bson.D{{"project_id", projectID}, {"cluster_id", clusterID}}
				cursor, _ := mongo.NewCursorFromDocuments(clusters, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(cursor, nil).Once()
				workflows[0] = bson.D{{"project_id", projectID}, {"cluster_id", clusterID}}
				workflowsCursor, _ := mongo.NewCursorFromDocuments(workflows, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(workflowsCursor, nil).Once()
			},
		},
		{
			name: "failure: mongo cluster list error",
			given: func(projectID string) {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(cursor, errors.New("")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: mongo workflow list error",
			given: func(projectID string) {
				clusters, clusterID := make([]interface{}, 1), uuid.NewString()
				clusters[0] = bson.D{{"project_id", projectID}, {"cluster_id", clusterID}}
				cursor, _ := mongo.NewCursorFromDocuments(clusters, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(cursor, nil).Once()
				workflowsCursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.WorkflowCollection, mock.Anything).Return(workflowsCursor, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			projectID := uuid.NewString()
			tc.given(projectID)
			// when
			clusterType := uuid.NewString()
			_, err := clusterService.ListClusters(projectID, &clusterType)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterService_GetAgentDetails tests the GetAgentDetails function of cluster service
func TestClusterService_GetAgentDetails(t *testing.T) {
	// given
	projectID := uuid.NewString()
	testcases := []struct {
		name    string
		wantErr bool
		given   func()
	}{
		{
			name: "success",
			given: func() {
				findResult := bson.D{{"project_id", projectID}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
			},
		},
		{
			name: "failure: mongo get error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := clusterService.GetAgentDetails(context.Background(), uuid.NewString(), projectID)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterService_GetManifestWithClusterID tests the GetManifestWithClusterID function of cluster service
func TestClusterService_GetManifestWithClusterID(t *testing.T) {
	// given
	clusterID, accessKey := uuid.NewString(), uuid.NewString()
	testcases := []struct {
		name    string
		wantErr bool
		given   func()
	}{
		{
			name: "success",
			given: func() {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", clusterID}, {"access_key", accessKey}, {"agent_scope", string(utils.AgentScopeCluster)}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				utils.Config.ChaosCenterUiEndpoint = "http://1.2.3.4"
				utils.Config.ChaosCenterScope = string(utils.AgentScopeCluster)
				t.Cleanup(func() {
					utils.Config.ChaosCenterUiEndpoint = ""
					utils.Config.ChaosCenterScope = ""
				})

				manifest := `
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argo
  namespace: #{AGENT_NAMESPACE}
`
				// not using filepath. see Dockerfile
				err := os.MkdirAll("manifests/cluster", 0755)
				if err != nil {
					t.FailNow()
				}
				temp, err := os.Create("manifests/cluster/1b_argo_rbac.yaml")
				if err != nil {
					t.FailNow()
				}
				defer func(temp *os.File) {
					err := temp.Close()
					if err != nil {
						t.FailNow()
					}
				}(temp)
				_, err = temp.WriteString(manifest)
				if err != nil {
					t.FailNow()
				}
				t.Cleanup(func() {
					_ = os.Remove("manifests/cluster/1b_argo_rbac.yaml")
					_ = os.Remove("manifests/cluster/")
					_ = os.Remove("manifests/")
				})
			},
		},
		{
			name: "failure: mongo get error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: access key mismatch",
			given: func() {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", clusterID}, {"access_key", uuid.NewString()}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: endpoint not set",
			given: func() {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", clusterID}, {"access_key", accessKey}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				utils.Config.ChaosCenterUiEndpoint = ""
				kubeClients.GenericClient = fake.NewSimpleClientset()
				t.Cleanup(func() { kubeClients.GenericClient = nil })
			},
			wantErr: true,
		},
		{
			name: "failure: agent scope not set",
			given: func() {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", clusterID}, {"access_key", accessKey}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				utils.Config.ChaosCenterUiEndpoint = "http://1.2.3.4"
				utils.Config.ChaosCenterScope = string(utils.AgentScopeNamespace)
				t.Cleanup(func() {
					utils.Config.ChaosCenterUiEndpoint = ""
					utils.Config.ChaosCenterScope = ""
				})
			},
			wantErr: true,
		},
		{
			name: "failure: failed to get tls.cert",
			given: func() {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", clusterID}, {"access_key", accessKey}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				utils.Config.ChaosCenterUiEndpoint = "http://1.2.3.4"
				utils.Config.ChaosCenterScope = string(utils.AgentScopeCluster)
				utils.Config.TlsSecretName = uuid.NewString()
				t.Cleanup(func() {
					utils.Config.ChaosCenterUiEndpoint = ""
					utils.Config.ChaosCenterScope = ""
					utils.Config.TlsSecretName = ""
				})
				kubeClients.GenericClient = fake.NewSimpleClientset()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := clusterService.GetManifestWithClusterID(clusterID, accessKey)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterService_VerifyCluster tests the VerifyCluster function of cluster service
func TestClusterService_VerifyCluster(t *testing.T) {
	// given
	testcases := []struct {
		name     string
		wantErr  bool
		identity model.ClusterIdentity
		given    func(identity model.ClusterIdentity)
	}{
		{
			name: "success",
			given: func(identity model.ClusterIdentity) {
				utils.Config.Version = identity.Version
				t.Cleanup(func() { utils.Config.Version = "" })
				findResult := bson.D{{"cluster_id", identity.ClusterID}, {"access_key", identity.AccessKey}, {"is_registered", true}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			identity: model.ClusterIdentity{
				ClusterID: uuid.NewString(),
				AccessKey: uuid.NewString(),
				Version:   "1.0.0",
			},
		},
		{
			name: "failure: ci version mismatch",
			given: func(identity model.ClusterIdentity) {
				utils.Config.Version = cluster.CIVersion
				t.Cleanup(func() { utils.Config.Version = "" })
			},
			identity: model.ClusterIdentity{
				ClusterID: uuid.NewString(),
				AccessKey: uuid.NewString(),
				Version:   "1.0.0",
			},
			wantErr: true,
		},
		{
			name: "failure: version mismatch",
			given: func(identity model.ClusterIdentity) {
				utils.Config.Version = "1.1.1"
				t.Cleanup(func() { utils.Config.Version = "" })
			},
			identity: model.ClusterIdentity{
				ClusterID: uuid.NewString(),
				AccessKey: uuid.NewString(),
				Version:   "1.0.0",
			},
			wantErr: true,
		},
		{
			name: "failure: mongo get error",
			given: func(identity model.ClusterIdentity) {
				utils.Config.Version = identity.Version
				t.Cleanup(func() { utils.Config.Version = "" })
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			identity: model.ClusterIdentity{
				ClusterID: uuid.NewString(),
				AccessKey: uuid.NewString(),
				Version:   "1.0.0",
			},
			wantErr: true,
		},
		{
			name: "failure: cluster not registered",
			given: func(identity model.ClusterIdentity) {
				utils.Config.Version = identity.Version
				t.Cleanup(func() { utils.Config.Version = "" })
				findResult := bson.D{{"cluster_id", identity.ClusterID}, {"access_key", identity.AccessKey}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			identity: model.ClusterIdentity{
				ClusterID: uuid.NewString(),
				AccessKey: uuid.NewString(),
				Version:   "1.0.0",
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given(tc.identity)
			// when
			_, err := clusterService.VerifyCluster(tc.identity)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterService_GetManifest tests the GetManifest function of cluster service
func TestClusterService_GetManifest(t *testing.T) {
	// given
	clusterID := uuid.NewString()
	accessKey, _ := cluster.CreateClusterJWT(uuid.NewString())
	testcases := []struct {
		name    string
		wantErr bool
		given   func()
	}{
		{
			name: "success",
			given: func() {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", clusterID}, {"access_key", accessKey}, {"agent_scope", string(utils.AgentScopeCluster)}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				utils.Config.ChaosCenterUiEndpoint = "http://1.2.3.4"
				utils.Config.ChaosCenterScope = string(utils.AgentScopeCluster)
				t.Cleanup(func() {
					utils.Config.ChaosCenterUiEndpoint = ""
					utils.Config.ChaosCenterScope = ""
				})

				manifest := `
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argo
  namespace: #{AGENT_NAMESPACE}
`
				// not using filepath. see Dockerfile
				err := os.MkdirAll("manifests/cluster", 0755)
				if err != nil {
					t.FailNow()
				}
				temp, err := os.Create("manifests/cluster/1b_argo_rbac.yaml")
				if err != nil {
					t.FailNow()
				}
				defer func(temp *os.File) {
					err := temp.Close()
					if err != nil {
						t.FailNow()
					}
				}(temp)
				_, err = temp.WriteString(manifest)
				if err != nil {
					t.FailNow()
				}
				t.Cleanup(func() {
					_ = os.Remove("manifests/cluster/1b_argo_rbac.yaml")
					_ = os.Remove("manifests/cluster/")
					_ = os.Remove("manifests/")
				})
			},
		},
		{
			name: "success",
			given: func() {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", clusterID}, {"access_key", accessKey}, {"agent_scope", string(utils.AgentScopeNamespace)}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				utils.Config.ChaosCenterUiEndpoint = "http://1.2.3.4"
				utils.Config.ChaosCenterScope = string(utils.AgentScopeNamespace)
				t.Cleanup(func() {
					utils.Config.ChaosCenterUiEndpoint = ""
					utils.Config.ChaosCenterScope = ""
				})

				manifest := `
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argo
  namespace: #{AGENT_NAMESPACE}
`
				// not using filepath. see Dockerfile
				err := os.MkdirAll("manifests/namespace", 0755)
				if err != nil {
					t.FailNow()
				}
				temp, err := os.Create("manifests/namespace/1b_argo_rbac.yaml")
				if err != nil {
					t.FailNow()
				}
				defer func(temp *os.File) {
					err := temp.Close()
					if err != nil {
						t.FailNow()
					}
				}(temp)
				_, err = temp.WriteString(manifest)
				if err != nil {
					t.FailNow()
				}
				t.Cleanup(func() {
					_ = os.Remove("manifests/namespace/1b_argo_rbac.yaml")
					_ = os.Remove("manifests/namespace/")
					_ = os.Remove("namespace/")
				})
			},
		},
		{
			name: "failure: mongo get error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: endpoint not set",
			given: func() {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", clusterID}, {"access_key", accessKey}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				utils.Config.ChaosCenterUiEndpoint = ""
				kubeClients.GenericClient = fake.NewSimpleClientset()
				t.Cleanup(func() { kubeClients.GenericClient = nil })
			},
			wantErr: true,
		},
		{
			name: "failure: failed to get tls.cert",
			given: func() {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", clusterID}, {"access_key", accessKey}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				utils.Config.ChaosCenterUiEndpoint = "http://1.2.3.4"
				utils.Config.ChaosCenterScope = string(utils.AgentScopeCluster)
				utils.Config.TlsSecretName = uuid.NewString()
				t.Cleanup(func() {
					utils.Config.ChaosCenterUiEndpoint = ""
					utils.Config.ChaosCenterScope = ""
					utils.Config.TlsSecretName = ""
				})
				kubeClients.GenericClient = fake.NewSimpleClientset()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, _, err := clusterService.GetManifest(accessKey)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterService_GetCluster tests the GetCluster function of cluster service
func TestClusterService_GetCluster(t *testing.T) {
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", uuid.NewString()}, {"access_key", uuid.NewString()}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
			},
		},
		{
			name: "failure: mongo get error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := clusterService.GetCluster(uuid.NewString())
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
