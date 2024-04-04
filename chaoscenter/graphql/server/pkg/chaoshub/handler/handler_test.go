package handler_test

import (
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub/handler"
	chaosHubOps "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub/ops"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"io/ioutil"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

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
	projectID := "test"

	chartsInput := model.CloningInput{
		Name: "test",
	}
	// when
	path := handler.GetChartsPath(chartsInput, projectID, true)
	// then
	assert.Equal(t, "/tmp/default/test/faults/", path)
}

func TestGetChartsPathFalse(t *testing.T) {
	// given
	projectID := "test"

	chartsInput := model.CloningInput{
		Name: "test",
	}
	// when
	path := handler.GetChartsPath(chartsInput, projectID, false)
	// then
	assert.Equal(t, "/tmp/test/test/faults/", path)
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
		name      string
		projectID string
		chaosHub  model.CreateRemoteChaosHub
		isError   bool
	}{
		{
			name:      "success: url is valid",
			projectID: uuid.New().String(),
			chaosHub: model.CreateRemoteChaosHub{
				Name:    uuid.New().String(),
				RepoURL: "https://github.com/litmuschaos/chaos-charts/archive/refs/heads/master.zip",
			},
		},
		{
			name:      "invalid url",
			projectID: uuid.New().String(),
			chaosHub: model.CreateRemoteChaosHub{
				Name:    uuid.New().String(),
				RepoURL: "invalid url",
			},
			isError: true,
		},
		{
			name:      "not a zip format",
			projectID: uuid.New().String(),
			chaosHub: model.CreateRemoteChaosHub{
				Name:    uuid.New().String(),
				RepoURL: "https://github.com/litmuschaos/chaos-charts",
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
			t.Cleanup(func() { _ = os.RemoveAll("/tmp/version/" + tc.projectID) })
			err := handler.DownloadRemoteHub(tc.chaosHub, tc.projectID)
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
		name      string
		projectID string
		chaosHub  model.CloningInput
		isError   bool
	}{
		{
			name:      "success: url is valid",
			projectID: uuid.New().String(),
			chaosHub: model.CloningInput{
				Name:    uuid.New().String(),
				RepoURL: "https://github.com/litmuschaos/chaos-charts/archive/refs/heads/master.zip",
			},
		},
		{
			name:      "invalid url",
			projectID: uuid.New().String(),
			chaosHub: model.CloningInput{
				Name:    uuid.New().String(),
				RepoURL: "invalid url",
			},
			isError: true,
		},
		{
			name:      "not a zip format",
			projectID: uuid.New().String(),
			chaosHub: model.CloningInput{
				Name:    uuid.New().String(),
				RepoURL: "https://github.com/litmuschaos/chaos-charts",
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
			t.Cleanup(func() { _ = os.RemoveAll("/tmp/version/" + tc.projectID) })
			err := handler.SyncRemoteRepo(tc.chaosHub, tc.projectID)
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
		name      string
		repoData  model.CloningInput
		isError   bool
		projectID string
	}{
		{
			name:      "success: url is valid",
			projectID: uuid.New().String(),
			repoData: model.CloningInput{
				Name:       uuid.New().String(),
				RepoURL:    "https://github.com/litmuschaos/chaos-charts",
				RepoBranch: "master",
				IsPrivate:  false,
				IsDefault:  false,
			},
			isError: false,
		},
		{
			name:      "invalid url",
			projectID: uuid.New().String(),
			repoData: model.CloningInput{
				Name:       uuid.New().String(),
				RepoURL:    "invalid url",
				RepoBranch: "master",
				IsPrivate:  false,
				IsDefault:  true,
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if tc.isError {
				// when
				chartsPath := handler.GetChartsPath(tc.repoData, tc.projectID, tc.repoData.IsDefault)
				_, err := handler.GetChartsData(chartsPath)
				// then
				assert.Error(t, err)
			} else {
				// given
				t.Cleanup(func() { _ = os.RemoveAll("/tmp/version/" + tc.projectID) })

				err := chaosHubOps.GitClone(tc.repoData, tc.projectID)
				assert.NoError(t, err)
				chartsPath := handler.GetChartsPath(tc.repoData, tc.projectID, tc.repoData.IsDefault)
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
	succeedName := uuid.New().String()
	t.Cleanup(func() { _ = os.RemoveAll("/tmp/version/" + succeedProjectID) })
	err := chaosHubOps.GitClone(
		model.CloningInput{
			Name:       succeedName,
			RepoURL:    "https://github.com/litmuschaos/chaos-charts",
			RepoBranch: "master",
			IsPrivate:  false,
		}, succeedProjectID)
	assert.NoError(t, err)

	testcases := []struct {
		name      string
		projectID string
		hubName   string
		isError   bool
	}{
		// Workflows were removed in v3.0.0
		// TODO: Cleanup ListPredefinedWorkflowDetails if not needed
		// {
		// 	name:      "success: list predefined workflows",
		// 	projectID: succeedProjectID,
		// 	hubName:   succeedName,
		// },
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
