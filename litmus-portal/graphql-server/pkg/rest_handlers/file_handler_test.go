package rest_handlers_test

import (
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/rest_handlers"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func TestFileHandler(t *testing.T) {
	// given
	var (
		w             *httptest.ResponseRecorder
		ctx           *gin.Context
		mongoOperator = new(mocks.MongoOperator)
		kubeClients   = new(k8s.KubeClients)
	)
	testcases := []struct {
		name       string
		statusCode int
		given      func()
	}{
		{
			name:       "success",
			statusCode: 200,
			given: func() {
				w = httptest.NewRecorder()
				clusterID := uuid.NewString()
				accessKey, _ := cluster.CreateClusterJWT(clusterID)
				ctx, _ = gin.CreateTestContext(w)
				ctx.Params = []gin.Param{
					{
						Key:   "key",
						Value: accessKey,
					},
				}

				findResult := bson.D{{"project_id", uuid.NewString()}, {"cluster_id", clusterID}, {"access_key", accessKey}, {"agent_scope", "cluster"}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ClusterCollection, mock.Anything).Return(singleResult, nil).Once()
				utils.Config.ChaosCenterUiEndpoint = "http://1.2.3.4"
				utils.Config.ChaosCenterScope = "cluster"
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
					_ = os.RemoveAll("manifests")
				})
			},
		},
		{
			name:       "failure: should return 404 when cluster is not found",
			statusCode: 404,
			given: func() {
				w = httptest.NewRecorder()
				accessKey := "invalid-token"
				ctx, _ = gin.CreateTestContext(w)
				ctx.Params = []gin.Param{
					{
						Key:   "key",
						Value: accessKey,
					},
				}
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()

			// when
			rest_handlers.FileHandler(mongoOperator, kubeClients)(ctx)
			// then
			assert.Equal(t, w.Code, tc.statusCode)
		})
	}
}
