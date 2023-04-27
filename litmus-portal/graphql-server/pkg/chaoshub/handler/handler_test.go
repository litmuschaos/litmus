package handler_test

import (
	"io/ioutil"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub/handler"
	chaosHubOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// TestGetChartsPath is used to test the GetChartsPath function
func TestGetChartsPath(t *testing.T) {
	// given
	chartsInput := model.CloningInput{
		ProjectID: "test",
		HubName:   "test",
	}
	// when
	path := handler.GetChartsPath(chartsInput)
	// then
	assert.Equal(t, "/tmp/version/test/test/charts/", path)
}

// TestGetChartsPath is used to test the GetChartsPath function
func TestGetCSVData(t *testing.T) {
	// given
	testcases := []struct {
		name         string
		request      model.ExperimentRequest
		isPredefined bool
	}{
		{
			name: "success: chart name is predefined",
			request: model.ExperimentRequest{
				ExperimentName: "test1",
				ChartName:      "predefined",
				ProjectID:      "test1",
				HubName:        "test1",
			},
			isPredefined: true,
		},
		{
			name: "success: chart name is not predefined",
			request: model.ExperimentRequest{
				ExperimentName: "test2",
				ChartName:      "not predefined",
				ProjectID:      "test2",
				HubName:        "test2",
			},
			isPredefined: false,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
			path := handler.GetCSVData(tc.request)
			// then
			if tc.isPredefined {
				assert.Equal(t, "/tmp/version/"+tc.request.ProjectID+"/"+tc.request.HubName+"/workflows/"+tc.request.ExperimentName+"/"+tc.request.ExperimentName+".chartserviceversion.yaml", path)
			} else {
				assert.Equal(t, "/tmp/version/"+tc.request.ProjectID+"/"+tc.request.HubName+"/charts/"+tc.request.ChartName+"/"+tc.request.ExperimentName+"/"+tc.request.ExperimentName+".chartserviceversion.yaml", path)
			}
		})
	}
}

// TestGetExperimentYAMLPath is used to test the GetExperimentYAMLPath function
func TestGetExperimentYAMLPath(t *testing.T) {
	// given
	fileType := "csv"
	request := model.ExperimentRequest{
		ProjectID:      "projectID",
		HubName:        "hubName",
		ExperimentName: "experimentName",
		ChartName:      "chartName",
		FileType:       &fileType,
	}
	// when
	path := handler.GetExperimentYAMLPath(request)
	// then
	assert.Equal(t, "/tmp/version/projectID/hubName/charts/chartName/experimentName/csv.yaml", path)
}

// TestGetPredefinedExperimentManifest is used to test the GetPredefinedExperimentManifest function
func TestGetPredefinedExperimentManifest(t *testing.T) {
	// given
	request := model.ExperimentRequest{
		ProjectID:      "projectID",
		HubName:        "hubName",
		ExperimentName: "experimentName",
		ChartName:      "chartName",
	}
	// when
	path := handler.GetPredefinedExperimentManifest(request)
	// then
	assert.Equal(t, "/tmp/version/projectID/hubName/workflows/experimentName/workflow.yaml", path)
}

// TestReadExperimentFile is used to test the ReadExperimentFile function
func TestReadExperimentFile(t *testing.T) {
	// given
	tempFile, _ := os.Create("temp.yaml")
	t.Cleanup(func() {
		tempFile.Close()
		os.Remove("temp.yaml")
	})
	testcases := []struct {
		name     string
		filePath string
		isError  bool
	}{
		{
			name:     "success: file exists",
			filePath: "./temp.yaml",
			isError:  false,
		},
		{
			name:     "failure: file does not exist",
			filePath: "./temp1.yaml",
			isError:  true,
		},
		{
			name:     "failure: file is not a yaml",
			filePath: "./types.go",
			isError:  true,
		},
	}
	for _, tc := range testcases {
		// when
		_, err := handler.ReadExperimentFile(tc.filePath)
		// then
		if tc.isError {
			assert.Error(t, err)
		} else {
			assert.NoError(t, err)
		}
	}
}

// TestReadExperimentYAMLFile is used to test the ReadExperimentYAMLFile function
func TestReadExperimentYAMLFile(t *testing.T) {
	// given
	tempFile, _ := os.Create("temp.yaml")
	t.Cleanup(func() {
		tempFile.Close()
		os.Remove("temp.yaml")
	})
	testcases := []struct {
		name     string
		filePath string
		isError  bool
	}{
		{
			name:     "success: file exists",
			filePath: "./temp.yaml",
			isError:  false,
		},
		{
			name:     "failure: file does not exist",
			filePath: "./temp1.yaml",
			isError:  true,
		},
	}
	for _, tc := range testcases {
		// when
		_, err := handler.ReadExperimentYAMLFile(tc.filePath)
		// then
		if tc.isError {
			assert.Error(t, err)
		} else {
			assert.NoError(t, err)
		}
	}
}

// TestDownloadRemoteHub is used to test the DownloadRemoteHub function
func TestDownloadRemoteHub(t *testing.T) {
	// given
	utils.Config.RemoteHubMaxSize = "1000000000"
	testcases := []struct {
		name     string
		chaosHub model.CreateRemoteChaosHub
		isError  bool
	}{
		{
			name: "success: url is valid",
			chaosHub: model.CreateRemoteChaosHub{
				ProjectID: uuid.New().String(),
				HubName:   uuid.New().String(),
				RepoURL:   "https://github.com/litmuschaos/chaos-charts/archive/refs/heads/master.zip",
			},
		},
		{
			name: "invalid url",
			chaosHub: model.CreateRemoteChaosHub{
				ProjectID: uuid.New().String(),
				HubName:   uuid.New().String(),
				RepoURL:   "invalid url",
			},
			isError: true,
		},
		{
			name: "not a zip format",
			chaosHub: model.CreateRemoteChaosHub{
				ProjectID: uuid.New().String(),
				HubName:   uuid.New().String(),
				RepoURL:   "https://github.com/litmuschaos/chaos-charts",
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
			t.Cleanup(func() { _ = os.RemoveAll("/tmp/version/" + tc.chaosHub.ProjectID) })
			err := handler.DownloadRemoteHub(tc.chaosHub)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestSyncRemoteRepo is used to test the SyncRemoteRepo function
func TestSyncRemoteRepo(t *testing.T) {
	// given
	utils.Config.RemoteHubMaxSize = "1000000000"
	testcases := []struct {
		name     string
		chaosHub model.CloningInput
		isError  bool
	}{
		{
			name: "success: url is valid",
			chaosHub: model.CloningInput{
				ProjectID: uuid.New().String(),
				HubName:   uuid.New().String(),
				RepoURL:   "https://github.com/litmuschaos/chaos-charts/archive/refs/heads/master.zip",
			},
		},
		{
			name: "invalid url",
			chaosHub: model.CloningInput{
				ProjectID: uuid.New().String(),
				HubName:   uuid.New().String(),
				RepoURL:   "invalid url",
			},
			isError: true,
		},
		{
			name: "not a zip format",
			chaosHub: model.CloningInput{
				ProjectID: uuid.New().String(),
				HubName:   uuid.New().String(),
				RepoURL:   "https://github.com/litmuschaos/chaos-charts",
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
			t.Cleanup(func() { _ = os.RemoveAll("/tmp/version/" + tc.chaosHub.ProjectID) })
			err := handler.SyncRemoteRepo(tc.chaosHub)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestIsFileExisting is used to test the IsFileExisting function
func TestIsFileExisting(t *testing.T) {
	// given
	tempFile, _ := os.Create("temp.yaml")
	t.Cleanup(func() {
		tempFile.Close()
		os.Remove("temp.yaml")
	})
	testcases := []struct {
		name     string
		filePath string
		isError  bool
	}{
		{
			name:     "success: file exists",
			filePath: "./temp.yaml",
			isError:  false,
		},
		{
			name:     "failure: file does not exist",
			filePath: "./temp1.yaml",
			isError:  true,
		},
	}
	for _, tc := range testcases {
		// when
		isExist, _ := handler.IsFileExisting(tc.filePath)
		// then
		if tc.isError {
			assert.False(t, isExist)
		} else {
			assert.True(t, isExist)
		}
	}
}

// TestGetChartsData is used to test the GetChartsData function
func TestGetChartsData(t *testing.T) {
	// given
	testcases := []struct {
		name     string
		repoData model.CloningInput
		isError  bool
	}{
		{
			name: "success: url is valid",
			repoData: model.CloningInput{
				ProjectID:  uuid.New().String(),
				HubName:    uuid.New().String(),
				RepoURL:    "https://github.com/litmuschaos/chaos-charts",
				RepoBranch: "master",
				IsPrivate:  false,
			},
		},
		{
			name: "invalid url",
			repoData: model.CloningInput{
				ProjectID:  uuid.New().String(),
				HubName:    uuid.New().String(),
				RepoURL:    "invalid url",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if tc.isError {
				// when
				chartsPath := handler.GetChartsPath(tc.repoData)
				_, err := handler.GetChartsData(chartsPath)
				// then
				assert.Error(t, err)
			} else {
				// given
				t.Cleanup(func() { _ = os.RemoveAll("/tmp/version/" + tc.repoData.ProjectID) })
				err := chaosHubOps.GitClone(tc.repoData)
				assert.NoError(t, err)
				chartsPath := handler.GetChartsPath(tc.repoData)
				// when
				_, err = handler.GetChartsData(chartsPath)
				// then
				assert.NoError(t, err)
			}
		})
	}
}

// TestGetExperimentData is used to test the GetExperimentData function
func TestGetExperimentData(t *testing.T) {
	// given
	tempFile, _ := os.Create("temp.yaml")
	t.Cleanup(func() {
		tempFile.Close()
		os.Remove("temp.yaml")
	})
	testcases := []struct {
		name     string
		filePath string
		isError  bool
	}{
		{
			name:     "success: file exists",
			filePath: "./temp.yaml",
			isError:  false,
		},
		{
			name:     "failure: file does not exist",
			filePath: "./temp1.yaml",
			isError:  true,
		},
		{
			name:     "failure: file is not a yaml",
			filePath: "./types.go",
			isError:  true,
		},
	}
	for _, tc := range testcases {
		// when
		_, err := handler.GetExperimentData(tc.filePath)
		// then
		if tc.isError {
			assert.Error(t, err)
		} else {
			assert.NoError(t, err)
		}
	}
}

// TestListPredefinedWorkflowDetails is used to test the ListPredefinedWorkflowDetails function
func TestListPredefinedWorkflowDetails(t *testing.T) {
	// given
	succeedProjectID := uuid.New().String()
	succeedHubName := uuid.New().String()
	t.Cleanup(func() { _ = os.RemoveAll("/tmp/version/" + succeedProjectID) })
	err := chaosHubOps.GitClone(
		model.CloningInput{
			ProjectID:  succeedProjectID,
			HubName:    succeedHubName,
			RepoURL:    "https://github.com/litmuschaos/chaos-charts",
			RepoBranch: "master",
			IsPrivate:  false,
		})
	assert.NoError(t, err)

	testcases := []struct {
		name      string
		projectID string
		hubName   string
		isError   bool
	}{
		{
			name:      "success: list predefined workflows",
			projectID: succeedProjectID,
			hubName:   succeedHubName,
		},
		{
			name:      "failure: Not defined workflows",
			projectID: uuid.New().String(),
			hubName:   uuid.New().String(),
			isError:   true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if tc.isError {
				// when
				_, err := handler.ListPredefinedWorkflowDetails(tc.hubName, tc.projectID)
				// then
				assert.Error(t, err)
			} else {
				// when
				_, err := handler.ListPredefinedWorkflowDetails(tc.hubName, tc.projectID)
				// then
				assert.NoError(t, err)
			}
		})
	}
}
