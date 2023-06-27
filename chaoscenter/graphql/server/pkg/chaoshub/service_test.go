package chaoshub_test

import (
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub"
	chaosHubOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchemaChaosHub "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/chaoshub"
	mongodbMocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	mongoOperator = new(mongodbMocks.MongoOperator)
	mockOperator  = dbSchemaChaosHub.NewChaosHubOperator(mongoOperator)
	mockService   = chaoshub.NewService(mockOperator)
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// clearCloneRepository removes the cloned repository
func clearCloneRepository(projectID string) {
	tempPath := chaosHubOps.GetClonePath(chaosHubOps.GitConfigConstruct(model.CloningInput{ProjectID: projectID}))
	err := os.RemoveAll(tempPath)
	if err != nil {
		panic(fmt.Sprintf("failed to remove temp path: %v", err))
	}
}

// TestChaosHubService_AddChaosHub tests the AddChaosHub function
func TestChaosHubService_AddChaosHub(t *testing.T) {
	// given
	newHub := model.CreateChaosHubRequest{
		ProjectID: "4",
		HubName:   "Litmus ChaosHub",
	}

	t.Run("already existed hub name", func(t *testing.T) {
		// given
		findResult := []interface{}{bson.D{{"project_id", "3"}, {"hub_name", "Litmus ChaosHub"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()

		// when
		_, err := mockService.AddChaosHub(context.Background(), newHub)

		// then
		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		// given
		findResult := []interface{}{bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()

		// when
		t.Cleanup(func() { clearCloneRepository(newHub.ProjectID) })
		target, err := mockService.AddChaosHub(context.Background(), newHub)

		// then
		assert.NoError(t, err)
		assert.Equal(t, newHub.HubName, target.HubName)
	})
}

// TestChaosHubService_AddRemoteChaosHub tests the AddRemoteChaosHub function
func TestChaosHubService_AddRemoteChaosHub(t *testing.T) {
	// given
	newHub := model.CreateRemoteChaosHub{
		ProjectID: "4",
		HubName:   "Litmus ChaosHub",
	}

	t.Run("already existed hub name", func(t *testing.T) {
		// given
		findResult := []interface{}{bson.D{{"project_id", "3"}, {"hub_name", "Litmus ChaosHub"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()

		// when
		_, err := mockService.AddRemoteChaosHub(context.Background(), newHub)

		// then
		assert.Error(t, err)
	})

	t.Run("failed to connect the remote repo", func(t *testing.T) {
		// given
		findResult := []interface{}{bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()

		// when
		_, err := mockService.AddRemoteChaosHub(context.Background(), newHub)

		// then
		assert.Error(t, err)
	})

	t.Run("invalid repo url: zip format", func(t *testing.T) {
		// given
		newHub.RepoURL = "https://github.com/litmuschaos/chaos-charts"
		utils.Config.RemoteHubMaxSize = "1000000000"
		findResult := []interface{}{bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()

		// when
		t.Cleanup(func() { clearCloneRepository(newHub.ProjectID) })
		_, err := mockService.AddRemoteChaosHub(context.Background(), newHub)

		// then
		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		// given
		newHub.RepoURL = "https://github.com/litmuschaos/chaos-charts/archive/refs/heads/master.zip"
		utils.Config.RemoteHubMaxSize = "1000000000"
		findResult := []interface{}{bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()

		// when
		t.Cleanup(func() { clearCloneRepository(newHub.ProjectID) })
		target, err := mockService.AddRemoteChaosHub(context.Background(), newHub)

		// then
		assert.NoError(t, err)
		assert.Equal(t, newHub.HubName, target.HubName)
	})
}

// TestChaosHubService_SaveChaosHub tests the SaveChaosHub function
func TestChaosHubService_SaveChaosHub(t *testing.T) {
	// given
	newHub := model.CreateChaosHubRequest{
		ProjectID: "4",
		HubName:   "Litmus ChaosHub",
	}

	t.Run("already existed hub name", func(t *testing.T) {
		// given
		findResult := []interface{}{bson.D{{"project_id", "3"}, {"hub_name", "Litmus ChaosHub"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()

		// when
		_, err := mockService.SaveChaosHub(context.Background(), newHub)

		// then
		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		// given
		findResult := []interface{}{bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()

		// when
		t.Cleanup(func() { clearCloneRepository(newHub.ProjectID) })
		target, err := mockService.SaveChaosHub(context.Background(), newHub)

		// then
		assert.NoError(t, err)
		assert.Equal(t, newHub.HubName, target.HubName)
	})
}

// TestChaosHubService_DeleteChaosHub tests the DeleteChaosHub function
func TestChaosHubService_DeleteChaosHub(t *testing.T) {
	t.Run("cannot find same project_id hub", func(t *testing.T) {
		// given
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(&mongo.SingleResult{}, errors.New("")).Once()

		// when
		_, err := mockService.DeleteChaosHub(context.Background(), "1", "1")

		// then
		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		// given
		findResult := bson.D{{"project_id", "1"}, {"hub_name", "hub1"}, {"hub_id", "1"}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(singleResult, nil).Once()
		mongoOperator.On("Update", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()

		// when
		_, err := mockService.DeleteChaosHub(context.Background(), "1", "1")

		// then
		assert.NoError(t, err)
	})
}

// TestChaosHubService_UpdateChaosHub tests the UpdateChaosHub function
func TestChaosHubService_UpdateChaosHub(t *testing.T) {
	// given
	utils.Config.RemoteHubMaxSize = "1000000000"
	testCases := []struct {
		name    string
		hub     model.UpdateChaosHubRequest
		got     bson.D
		isError bool
	}{
		{
			name: "cannot find same project_id hub",
			hub: model.UpdateChaosHubRequest{
				ProjectID: "1",
				HubName:   "updated_name",
			},
			isError: true,
		},
		{
			name: "success : updated hub type is remote",
			hub: model.UpdateChaosHubRequest{
				ProjectID: "1",
				HubName:   "updated_name",
				RepoURL:   "https://github.com/litmuschaos/chaos-charts/archive/refs/heads/master.zip",
			},
			got:     bson.D{{"project_id", "1"}, {"hub_name", "hub1"}, {"hub_type", "REMOTE"}},
			isError: false,
		},
		{
			name: "success : updated_name type is not remote",
			hub: model.UpdateChaosHubRequest{
				ProjectID:  "1",
				HubName:    "updated_name",
				RepoURL:    "https://github.com/litmuschaos/chaos-charts",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			got:     bson.D{{"project_id", "1"}, {"hub_name", "hub1"}},
			isError: false,
		},
		{
			name: "success : updated hub type is not remote, not changed data",
			hub: model.UpdateChaosHubRequest{
				ProjectID:  "1",
				HubName:    "updated_name",
				RepoURL:    "https://github.com/litmuschaos/chaos-charts",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			got:     bson.D{{"project_id", "1"}, {"hub_name", "updated_name"}, {"repo_url", "https://github.com/litmuschaos/chaos-charts"}, {"repo_branch", "master"}, {"is_private", false}},
			isError: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			if tc.isError {
				// given
				mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(&mongo.SingleResult{}, errors.New("")).Once()

				// when
				_, err := mockService.UpdateChaosHub(context.Background(), tc.hub)

				// then
				assert.Error(t, err)
			} else {
				// given
				singleResult := mongo.NewSingleResultFromDocument(tc.got, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(singleResult, nil).Once()
				mongoOperator.On("Update", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()

				// when
				t.Cleanup(func() { clearCloneRepository(tc.hub.ProjectID) })
				target, err := mockService.UpdateChaosHub(context.Background(), tc.hub)

				// then
				assert.NoError(t, err)
				assert.Equal(t, tc.hub.HubName, target.HubName)
			}
		})
	}
}

// TestChaosHubService_GetAllHubs tests the GetAllHubs function
func TestChaosHubService_GetAllHubs(t *testing.T) {
	t.Run("error in operator", func(t *testing.T) {
		// given
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, errors.New("")).Once()

		// when
		_, err := mockService.GetAllHubs(context.Background())

		// then
		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		// given
		hubs, wants := make([]model.ChaosHub, 10), make([]interface{}, 10)
		for i := 0; i < 10; i++ {
			hubs[i] = model.ChaosHub{ProjectID: fmt.Sprint(i), HubName: fmt.Sprintf("hub%d", i)}
			wants[i] = bson.D{{"project_id", hubs[i].ProjectID}, {"hub_name", hubs[i].HubName}}
		}
		cursor, _ := mongo.NewCursorFromDocuments(wants, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()

		// when
		targets, err := mockService.GetAllHubs(context.Background())

		// then
		assert.NoError(t, err)
		assert.Equal(t, len(hubs), len(targets))
		for i, hub := range hubs {
			assert.Equal(t, targets[i].ProjectID, hub.ProjectID)
			assert.Equal(t, targets[i].HubName, hub.HubName)
		}
	})
}

// TestChaosHubService_GetData tests the ListCharts, GetChaosFault, GetYAMLData
// GetExperimentManifestDetails, GetPredefinedExperimentYAMLData, ListChaosHubs, ListPredefinedWorkflows function
func TestChaosHubService_GetData(t *testing.T) {
	// given
	newHub := model.CreateChaosHubRequest{
		ProjectID:  "1",
		HubName:    "hub1",
		RepoBranch: "master",
		RepoURL:    "https://github.com/litmuschaos/chaos-charts",
	}

	findResult := []interface{}{bson.D{{"project_id", "2"}, {"hub_name", "hub2"}}}
	cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
	mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
	mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()

	// when
	t.Cleanup(func() { clearCloneRepository(newHub.ProjectID) })
	target, err := mockService.AddChaosHub(context.Background(), newHub)

	// then
	assert.NoError(t, err)

	t.Run("success : ListCharts", func(t *testing.T) {
		// given
		findResult := []interface{}{
			bson.D{{"project_id", target.ProjectID}, {"hub_name", target.HubName}, {"repo_branch", target.RepoBranch}, {"repo_url", target.RepoURL}},
		}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()

		// when
		_, err := mockService.ListCharts(context.Background(), "hub1", "1")

		// then
		assert.NoError(t, err)
	})

	t.Run("failure : ListCharts, error in operator", func(t *testing.T) {
		// given
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, errors.New("")).Once()

		// when
		_, err := mockService.ListCharts(context.Background(), "hub1", "1")

		// then
		assert.Error(t, err)
	})

	t.Run("success : GetChaosFault", func(t *testing.T) {
		// given
		fileType := "csv"
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			FileType:       &fileType,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}

		// when
		_, err := mockService.GetHubExperiment(context.Background(), request)

		// then
		assert.NoError(t, err)
	})

	t.Run("failure : GetChaosFault, invalid file type", func(t *testing.T) {
		// given
		fileType := "invalid"
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			FileType:       &fileType,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}

		// when
		_, err := mockService.GetHubExperiment(context.Background(), request)

		// then
		assert.Error(t, err)
	})

	t.Run("success : GetYAMLData", func(t *testing.T) {
		// given
		fileType := string(model.FileTypeEngine)
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			FileType:       &fileType,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}

		// when
		_, err := mockService.GetYAMLData(request)

		// then
		assert.NoError(t, err)
	})

	t.Run("failure : GetYAMLData, invalid file type", func(t *testing.T) {
		// given
		fileType := "csv"
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			FileType:       &fileType,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}

		// when
		_, err := mockService.GetYAMLData(request)

		// then
		assert.Error(t, err)
	})

	t.Run("failure : GetYAMLData, invalid hub name & project id", func(t *testing.T) {
		// given
		fileType := string(model.FileTypeEngine)
		request := model.ExperimentRequest{
			ProjectID:      "invalid project id",
			HubName:        "invalid hub name",
			FileType:       &fileType,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}

		// when
		_, err := mockService.GetYAMLData(request)

		// then
		assert.Error(t, err)
	})

	t.Run("success : GetExperimentManifestDetails", func(t *testing.T) {
		// given
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}

		// when
		_, err := mockService.GetExperimentManifestDetails(context.Background(), request)

		// then
		assert.NoError(t, err)
	})

	t.Run("success : GetPredefinedExperimentYAMLData", func(t *testing.T) {
		// given
		fileType := "workflow"
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			ChartName:      "predefined",
			ExperimentName: "pod-delete",
			FileType:       &fileType,
		}

		// when
		_, err := mockService.GetPredefinedExperimentYAMLData(request)

		// then
		assert.NoError(t, err)
	})

	t.Run("failure : GetPredefinedExperimentYAMLData, nil file type", func(t *testing.T) {
		// given
		var fileType *string
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			ChartName:      "predefined",
			ExperimentName: "pod-delete",
			FileType:       fileType,
		}

		// when
		_, err := mockService.GetPredefinedExperimentYAMLData(request)

		// then
		assert.Error(t, err)
	})

	t.Run("failure : GetPredefinedExperimentYAMLData, invalid file type", func(t *testing.T) {
		// given
		fileType := "invalid"
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			ChartName:      "predefined",
			ExperimentName: "pod-delete",
			FileType:       &fileType,
		}

		// when
		_, err := mockService.GetPredefinedExperimentYAMLData(request)

		// then
		assert.Error(t, err)
	})

	t.Run("success : ListChaosHubs", func(t *testing.T) {
		// given
		findResult := []interface{}{bson.D{{"project_id", target.ProjectID}, {"hub_name", target.HubName}, {"repo_branch", target.RepoBranch}, {"repo_url", target.RepoURL}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()

		// when
		chaosHubStatus, err := mockService.ListHubStatus(context.Background(), "1")

		// then
		assert.NoError(t, err)
		assert.Equal(t, chaosHubStatus[0].HubName, target.HubName)
	})

	t.Run("success : ListPredefinedWorkflows", func(t *testing.T) {
		// when
		workflows, err := mockService.ListPredefinedWorkflows(target.HubName, target.ProjectID)

		// then
		assert.NoError(t, err)
		assert.True(t, len(workflows) > 0)
	})

	t.Run("failure : ListPredefinedWorkflows", func(t *testing.T) {
		// when
		_, err := mockService.ListPredefinedWorkflows("different hub name", "different project id")

		// then
		assert.Error(t, err)
	})
}

// TestChaosHubService_RecurringHubSync tests the RecurringHubSync function
func TestChaosHubService_RecurringHubSync(t *testing.T) {
	// TODO: Add test cases
}

// TestChaosHubService_IsChaosHubAvailable tests the IsChaosHubAvailable function
func TestChaosHubService_IsChaosHubAvailable(t *testing.T) {
	// given
	hub := model.CreateChaosHubRequest{
		ProjectID: "1",
		HubName:   "hub1",
	}
	t.Run("error in operator", func(t *testing.T) {
		// given
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, errors.New("")).Once()

		// when
		_, err := mockService.IsChaosHubAvailable(context.Background(), hub.HubName, hub.ProjectID)

		// then
		assert.Error(t, err)
	})

	t.Run("already existed hub name", func(t *testing.T) {
		// given
		findResult := []interface{}{bson.D{{"project_id", hub.ProjectID}, {"hub_name", hub.HubName}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()

		// when
		isAvailable, err := mockService.IsChaosHubAvailable(context.Background(), hub.HubName, hub.ProjectID)

		// then
		assert.NoError(t, err)
		assert.True(t, isAvailable)
	})

	t.Run("success", func(t *testing.T) {
		// given
		findResult := []interface{}{bson.D{{"project_id", "4"}, {"hub_name", "diff_hub"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()

		// when
		isAvailable, err := mockService.IsChaosHubAvailable(context.Background(), hub.HubName, hub.ProjectID)

		// then
		assert.NoError(t, err)
		assert.False(t, isAvailable)
	})
}

// TestChaosHubService_SyncHub tests the SyncChaosHub function
func TestChaosHubService_SyncHub(t *testing.T) {
	// given
	newHub := model.ChaosHub{
		ProjectID: "1",
		HubName:   "hub1",
		ID:        "1",
		HubType:   "REMOTE",
		RepoURL:   "https://github.com/litmuschaos/chaos-charts/archive/refs/heads/master.zip",
	}
	t.Run("cannot find same project_id hub", func(t *testing.T) {
		// given
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(&mongo.SingleResult{}, errors.New("")).Once()

		// when
		_, err := mockService.SyncHub(context.Background(), "1", "1")

		// then
		assert.Error(t, err)
	})

	t.Run("success : hub type is remote", func(t *testing.T) {
		// given
		utils.Config.RemoteHubMaxSize = "1000000000"
		findResult := bson.D{{"project_id", newHub.ProjectID}, {"hub_name", newHub.HubName}, {"hub_id", newHub.ID}, {"hub_type", newHub.HubType}, {"repo_url", newHub.RepoURL}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(singleResult, nil).Once()
		mongoOperator.On("Update", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()

		// when
		t.Cleanup(func() { clearCloneRepository(newHub.ProjectID) })
		_, err := mockService.SyncHub(context.Background(), newHub.ID, newHub.ProjectID)

		// then
		assert.NoError(t, err)
	})

	t.Run("success : hub type is not remote", func(t *testing.T) {
		// given
		findResult := bson.D{{"project_id", newHub.ProjectID}, {"hub_name", newHub.HubName}, {"hub_id", newHub.ID}, {"repo_url", "https://github.com/litmuschaos/chaos-charts"}, {"repo_branch", "master"}, {"is_private", false}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(singleResult, nil).Once()
		mongoOperator.On("Update", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()

		// when
		t.Cleanup(func() { clearCloneRepository(newHub.ProjectID) })
		_, err := mockService.SyncHub(context.Background(), newHub.ID, newHub.ProjectID)

		// then
		assert.NoError(t, err)
	})
}
