package chaoshub_test

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchemaChaosHub "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/chaoshub"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	mongoOperator = new(mocks.MongoOperator)
	mockOperator  = dbSchemaChaosHub.NewChaosHubOperator(mongoOperator)
	mockService   = chaoshub.NewService(mockOperator)
)

// init is the entry point for testing
func init() {
	gin.SetMode(gin.TestMode)
}

// TestChaosHubService_AddChaosHub tests the AddChaosHub function
func TestChaosHubService_AddChaosHub(t *testing.T) {
	newHub := model.CreateChaosHubRequest{
		ProjectID: "4",
		HubName:   "Litmus ChaosHub",
	}

	t.Run("already existed hub name", func(t *testing.T) {
		findResult := []interface{}{bson.D{{"project_id", "3"}, {"hub_name", "Litmus ChaosHub"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		_, err := mockService.AddChaosHub(context.Background(), newHub)

		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		findResult := []interface{}{bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()
		target, err := mockService.AddChaosHub(context.Background(), newHub)

		assert.NoError(t, err)
		assert.Equal(t, newHub.HubName, target.HubName)
	})
}

// TestChaosHubService_AddRemoteChaosHub tests the AddRemoteChaosHub function
func TestChaosHubService_AddRemoteChaosHub(t *testing.T) {
	newHub := model.CreateRemoteChaosHub{
		ProjectID: "4",
		HubName:   "Litmus ChaosHub",
	}

	t.Run("already existed hub name", func(t *testing.T) {
		findResult := []interface{}{bson.D{{"project_id", "3"}, {"hub_name", "Litmus ChaosHub"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		_, err := mockService.AddRemoteChaosHub(context.Background(), newHub)

		assert.Error(t, err)
	})

	t.Run("failed to connect the remote repo", func(t *testing.T) {
		findResult := []interface{}{bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()
		_, err := mockService.AddRemoteChaosHub(context.Background(), newHub)

		assert.Error(t, err)
	})

	t.Run("invalid repo url: zip format", func(t *testing.T) {
		newHub.RepoURL = "https://github.com/litmuschaos/chaos-charts"
		utils.Config.RemoteHubMaxSize = "1000000000"
		findResult := []interface{}{bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()
		_, err := mockService.AddRemoteChaosHub(context.Background(), newHub)

		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		newHub.RepoURL = "https://github.com/litmuschaos/chaos-charts/archive/refs/heads/master.zip"
		utils.Config.RemoteHubMaxSize = "1000000000"
		findResult := []interface{}{bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()
		target, err := mockService.AddRemoteChaosHub(context.Background(), newHub)

		assert.NoError(t, err)
		assert.Equal(t, newHub.HubName, target.HubName)
	})
}

// TestChaosHubService_SaveChaosHub tests the SaveChaosHub function
func TestChaosHubService_SaveChaosHub(t *testing.T) {
	newHub := model.CreateChaosHubRequest{
		ProjectID: "4",
		HubName:   "Litmus ChaosHub",
	}

	t.Run("already existed hub name", func(t *testing.T) {
		findResult := []interface{}{bson.D{{"project_id", "3"}, {"hub_name", "Litmus ChaosHub"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		_, err := mockService.SaveChaosHub(context.Background(), newHub)

		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		findResult := []interface{}{bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		mongoOperator.On("Create", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(nil).Once()
		target, err := mockService.SaveChaosHub(context.Background(), newHub)

		assert.NoError(t, err)
		assert.Equal(t, newHub.HubName, target.HubName)
	})
}

// TestChaosHubService_DeleteChaosHub tests the DeleteChaosHub function
func TestChaosHubService_DeleteChaosHub(t *testing.T) {
	t.Run("cannot find same project_id hub", func(t *testing.T) {
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(&mongo.SingleResult{}, errors.New("")).Once()
		_, err := mockService.DeleteChaosHub(context.Background(), "1", "1")

		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		findResult := bson.D{{"project_id", "1"}, {"hub_name", "hub1"}, {"hub_id", "1"}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(singleResult, nil).Once()
		mongoOperator.On("Update", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
		_, err := mockService.DeleteChaosHub(context.Background(), "1", "1")

		assert.NoError(t, err)
	})
}

// TestChaosHubService_UpdateChaosHub tests the UpdateChaosHub function
func TestChaosHubService_UpdateChaosHub(t *testing.T) {
	updatedHub := model.UpdateChaosHubRequest{
		ProjectID: "1",
		HubName:   "updated name",
	}

	t.Run("cannot find same project_id hub", func(t *testing.T) {
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(&mongo.SingleResult{}, errors.New("")).Once()
		_, err := mockService.UpdateChaosHub(context.Background(), updatedHub)

		assert.Error(t, err)
	})

	t.Run("success : updated hub type is remote", func(t *testing.T) {
		utils.Config.RemoteHubMaxSize = "1000000000"
		updatedHub.RepoURL = "https://github.com/litmuschaos/chaos-charts/archive/refs/heads/master.zip"
		findResult := bson.D{{"project_id", "1"}, {"hub_name", "hub1"}, {"hub_type", "REMOTE"}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(singleResult, nil).Once()
		mongoOperator.On("Update", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
		target, err := mockService.UpdateChaosHub(context.Background(), updatedHub)

		assert.NoError(t, err)
		assert.Equal(t, updatedHub.HubName, target.HubName)
	})

	t.Run("success : updated hub type is not remote", func(t *testing.T) {
		updatedHub.RepoURL = "https://github.com/litmuschaos/chaos-charts"
		updatedHub.RepoBranch = "master"
		updatedHub.IsPrivate = false
		findResult := bson.D{{"project_id", "1"}, {"hub_name", "hub1"}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(singleResult, nil).Once()
		mongoOperator.On("Update", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
		target, err := mockService.UpdateChaosHub(context.Background(), updatedHub)

		assert.NoError(t, err)
		assert.Equal(t, updatedHub.HubName, target.HubName)
	})

	t.Run("success : updated hub type is not remote, not changed data", func(t *testing.T) {
		updatedHub.RepoURL = "https://github.com/litmuschaos/chaos-charts"
		updatedHub.RepoBranch = "master"
		updatedHub.IsPrivate = false
		findResult := bson.D{{"project_id", updatedHub.ProjectID}, {"hub_name", updatedHub.HubName}, {"repo_url", updatedHub.RepoURL}, {"repo_branch", updatedHub.RepoBranch}, {"is_private", updatedHub.IsPrivate}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(singleResult, nil).Once()
		mongoOperator.On("Update", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
		target, err := mockService.UpdateChaosHub(context.Background(), updatedHub)

		assert.NoError(t, err)
		assert.Equal(t, updatedHub.HubName, target.HubName)
	})
}

// TestChaosHubService_GetAllHubs tests the GetAllHubs function
func TestChaosHubService_GetAllHubs(t *testing.T) {
	t.Run("error in operator", func(t *testing.T) {
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, errors.New("")).Once()
		_, err := mockService.GetAllHubs(context.Background())
		assert.Error(t, err)
	})
	t.Run("success", func(t *testing.T) {
		var hubs []model.ChaosHub
		for i := 0; i < 10; i++ {
			hubs = append(hubs, model.ChaosHub{ProjectID: fmt.Sprint(i), HubName: fmt.Sprintf("hub%d", i)})
		}
		var findResult []interface{}
		for _, hub := range hubs {
			findResult = append(findResult, bson.D{{"project_id", hub.ProjectID}, {"hub_name", hub.HubName}})
		}

		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		targets, err := mockService.GetAllHubs(context.Background())
		assert.NoError(t, err)
		assert.Equal(t, len(hubs), len(targets))
		for i, hub := range hubs {
			assert.Equal(t, targets[i].ProjectID, hub.ProjectID)
			assert.Equal(t, targets[i].HubName, hub.HubName)
		}
	})
}

// TestChaosHubService_GetData tests the ListCharts, GetHubExperiment, GetYAMLData
// GetExperimentManifestDetails, GetPredefinedExperimentYAMLData, ListHubStatus, ListPredefinedWorkflows function
func TestChaosHubService_GetData(t *testing.T) {
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
	target, err := mockService.AddChaosHub(context.Background(), newHub)

	assert.NoError(t, err)

	t.Run("success : ListCharts", func(t *testing.T) {
		findResult := []interface{}{
			bson.D{{"project_id", target.ProjectID}, {"hub_name", target.HubName}, {"repo_branch", target.RepoBranch}, {"repo_url", target.RepoURL}},
		}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		_, err := mockService.ListCharts(context.Background(), "hub1", "1")

		assert.NoError(t, err)
	})

	t.Run("failure : ListCharts, error in operator", func(t *testing.T) {
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, errors.New("")).Once()
		_, err := mockService.ListCharts(context.Background(), "hub1", "1")

		assert.Error(t, err)
	})

	t.Run("success : GetHubExperiment", func(t *testing.T) {
		fileType := "csv"
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			FileType:       &fileType,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}
		_, err := mockService.GetHubExperiment(context.Background(), request)

		assert.NoError(t, err)
	})

	t.Run("failure : GetHubExperiment, invalid file type", func(t *testing.T) {
		fileType := "invalid"
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			FileType:       &fileType,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}
		_, err := mockService.GetHubExperiment(context.Background(), request)

		assert.Error(t, err)
	})

	t.Run("success : GetYAMLData", func(t *testing.T) {
		fileType := string(model.FileTypeEngine)
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			FileType:       &fileType,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}
		_, err := mockService.GetYAMLData(request)

		assert.NoError(t, err)
	})

	t.Run("failure : GetYAMLData, invalid file type", func(t *testing.T) {
		fileType := string("csv")
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			FileType:       &fileType,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}
		_, err := mockService.GetYAMLData(request)

		assert.Error(t, err)
	})

	t.Run("failure : GetYAMLData, invalid hub name & project id", func(t *testing.T) {
		fileType := string(model.FileTypeEngine)
		request := model.ExperimentRequest{
			ProjectID:      "invalid project id",
			HubName:        "invalid hub name",
			FileType:       &fileType,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}
		_, err := mockService.GetYAMLData(request)

		assert.Error(t, err)
	})

	t.Run("success : GetExperimentManifestDetails", func(t *testing.T) {
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			ChartName:      "generic",
			ExperimentName: "pod-delete",
		}
		_, err := mockService.GetExperimentManifestDetails(context.Background(), request)

		assert.NoError(t, err)
	})

	t.Run("success : GetPredefinedExperimentYAMLData", func(t *testing.T) {
		fileType := "workflow"
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			ChartName:      "predefined",
			ExperimentName: "pod-delete",
			FileType:       &fileType,
		}
		_, err := mockService.GetPredefinedExperimentYAMLData(request)

		assert.NoError(t, err)
	})

	t.Run("failure : GetPredefinedExperimentYAMLData, nil file type", func(t *testing.T) {
		var fileType *string = nil
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			ChartName:      "predefined",
			ExperimentName: "pod-delete",
			FileType:       fileType,
		}
		_, err := mockService.GetPredefinedExperimentYAMLData(request)

		assert.Error(t, err)
	})

	t.Run("failure : GetPredefinedExperimentYAMLData, invalid file type", func(t *testing.T) {
		fileType := "invalid"
		request := model.ExperimentRequest{
			ProjectID:      target.ProjectID,
			HubName:        target.HubName,
			ChartName:      "predefined",
			ExperimentName: "pod-delete",
			FileType:       &fileType,
		}
		_, err := mockService.GetPredefinedExperimentYAMLData(request)

		assert.Error(t, err)
	})

	t.Run("success : ListHubStatus", func(t *testing.T) {
		findResult := []interface{}{
			bson.D{{"project_id", target.ProjectID}, {"hub_name", target.HubName}, {"repo_branch", target.RepoBranch}, {"repo_url", target.RepoURL}},
		}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		chaosHubStatus, err := mockService.ListHubStatus(context.Background(), "1")

		assert.NoError(t, err)
		assert.Equal(t, chaosHubStatus[0].HubName, target.HubName)
	})

	t.Run("success : ListPredefinedWorkflows", func(t *testing.T) {
		workflows, err := mockService.ListPredefinedWorkflows(target.HubName, target.ProjectID)
		assert.NoError(t, err)
		assert.True(t, len(workflows) > 0)
	})

	t.Run("failure : ListPredefinedWorkflows", func(t *testing.T) {
		_, err := mockService.ListPredefinedWorkflows("different hub name", "different project id")
		assert.Error(t, err)
	})
}

// TestChaosHubService_RecurringHubSync tests the RecurringHubSync function
func TestChaosHubService_RecurringHubSync(t *testing.T) {
	// TODO: Add test cases
}

// TestChaosHubService_IsChaosHubAvailable tests the IsChaosHubAvailable function
func TestChaosHubService_IsChaosHubAvailable(t *testing.T) {
	hub := model.CreateChaosHubRequest{
		ProjectID: "1",
		HubName:   "hub1",
	}
	t.Run("error in operator", func(t *testing.T) {
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, errors.New("")).Once()
		_, err := mockService.IsChaosHubAvailable(context.Background(), hub.HubName, hub.ProjectID)

		assert.Error(t, err)
	})

	t.Run("already existed hub name", func(t *testing.T) {
		findResult := []interface{}{bson.D{{"project_id", hub.ProjectID}, {"hub_name", hub.HubName}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		isAvailable, err := mockService.IsChaosHubAvailable(context.Background(), hub.HubName, hub.ProjectID)

		assert.NoError(t, err)
		assert.True(t, isAvailable)
	})

	t.Run("success", func(t *testing.T) {
		findResult := []interface{}{bson.D{{"project_id", "4"}, {"hub_name", "diff_hub"}}}
		cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
		mongoOperator.On("List", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(cursor, nil).Once()
		isAvailable, err := mockService.IsChaosHubAvailable(context.Background(), hub.HubName, hub.ProjectID)

		assert.NoError(t, err)
		assert.False(t, isAvailable)
	})
}

// TestChaosHubService_SyncHub tests the SyncHub function
func TestChaosHubService_SyncHub(t *testing.T) {
	t.Run("cannot find same project_id hub", func(t *testing.T) {
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(&mongo.SingleResult{}, errors.New("")).Once()
		_, err := mockService.SyncHub(context.Background(), "1", "1")

		assert.Error(t, err)
	})

	t.Run("success : hub type is remote", func(t *testing.T) {
		utils.Config.RemoteHubMaxSize = "1000000000"
		findResult := bson.D{{"project_id", "1"}, {"hub_name", "hub1"}, {"hub_id", "1"}, {"hub_type", "REMOTE"}, {"repo_url", "https://github.com/litmuschaos/chaos-charts/archive/refs/heads/master.zip"}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(singleResult, nil).Once()
		mongoOperator.On("Update", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
		_, err := mockService.SyncHub(context.Background(), "1", "1")

		assert.NoError(t, err)
	})

	t.Run("success : hub type is not remote", func(t *testing.T) {
		findResult := bson.D{{"project_id", "1"}, {"hub_name", "hub1"}, {"hub_id", "1"}, {"repo_url", "https://github.com/litmuschaos/chaos-charts"}, {"repo_branch", "master"}, {"is_private", false}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		mongoOperator.On("Get", mock.Anything, mongodb.ChaosHubCollection, mock.Anything).Return(singleResult, nil).Once()
		mongoOperator.On("Update", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
		_, err := mockService.SyncHub(context.Background(), "1", "1")

		assert.NoError(t, err)
	})
}
