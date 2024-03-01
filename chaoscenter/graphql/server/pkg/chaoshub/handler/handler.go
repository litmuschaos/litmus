package handler

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	chaoshubops "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub/ops"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_hub"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	log "github.com/sirupsen/logrus"

	"gopkg.in/yaml.v2"
)

const DefaultPath = "/tmp/"

// GetChartsPath is used to construct path for given chart.
func GetChartsPath(chartsInput model.CloningInput, projectID string, isDefault bool) string {
	var repoPath string
	if isDefault {
		repoPath = DefaultPath + "default/" + chartsInput.Name + "/faults/"
	} else {
		repoPath = DefaultPath + projectID + "/" + chartsInput.Name + "/faults/"
	}
	return repoPath
}

// GetChartsData is used to get details of charts like experiments.
func GetChartsData(ChartsPath string) ([]*model.Chart, error) {
	var allChartsDetails []ChaosChart
	Charts, err := ioutil.ReadDir(ChartsPath)
	if err != nil {
		log.Error("file reading error", err)
		return nil, err
	}
	for _, chart := range Charts {
		if chart.Name() == "icons" {
			continue
		}
		chartDetails, _ := ReadExperimentFile(ChartsPath + chart.Name() + "/" + chart.Name() + ".chartserviceversion.yaml")
		allChartsDetails = append(allChartsDetails, chartDetails)
	}

	e, err := json.Marshal(allChartsDetails)
	if err != nil {
		return nil, err
	}

	var unmarshalledData []*model.Chart
	err = json.Unmarshal(e, &unmarshalledData)
	if err != nil {
		return nil, err
	}

	return unmarshalledData, nil
}

// GetExperimentData is used for getting details of selected Experiment path
func GetExperimentData(experimentFilePath string) (*model.Chart, error) {
	data, err := ReadExperimentFile(experimentFilePath)
	if err != nil {
		return nil, err
	}
	e, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	var chartData *model.Chart
	json.Unmarshal(e, &chartData)
	return chartData, nil
}

// ReadExperimentFile is used for reading experiment file from given path
func ReadExperimentFile(path string) (ChaosChart, error) {
	var experiment ChaosChart
	experimentFile, err := ioutil.ReadFile(path)
	if err != nil {
		return experiment, fmt.Errorf("file path of the, err: %+v", err)
	}
	if err = yaml.Unmarshal(experimentFile, &experiment); err != nil {
		return experiment, err
	}
	return experiment, nil
}

// ReadExperimentYAMLFile is used for reading experiment/engine file from given path
func ReadExperimentYAMLFile(path string) (string, error) {
	var s string
	YAMLData, err := ioutil.ReadFile(path)
	if err != nil {
		return s, fmt.Errorf("file path of the, err: %+v", err)
	}
	s = string(YAMLData)
	return s, nil
}

// ListPredefinedWorkflowDetails reads the workflow directory for all the predefined experiments
// and returns the csv, workflow manifest and workflow name
func ListPredefinedWorkflowDetails(name string, projectID string) ([]*model.PredefinedExperimentList, error) {
	experimentsPath := DefaultPath + projectID + "/" + name + "/workflows"
	var predefinedWorkflows []*model.PredefinedExperimentList
	files, err := ioutil.ReadDir(experimentsPath)
	if err != nil {
		return nil, err
	}

	for _, file := range files {
		csvManifest := ""
		workflowManifest := ""
		isExist, err := IsFileExisting(experimentsPath + "/" + file.Name() + "/" + file.Name() + ".chartserviceversion.yaml")
		if err != nil {
			return nil, err
		}
		if isExist {
			csvManifest, err = ReadExperimentYAMLFile(experimentsPath + "/" + file.Name() + "/" + file.Name() + ".chartserviceversion.yaml")
			if err != nil {
				csvManifest = "na"
			}
			workflowManifest, err = ReadExperimentYAMLFile(experimentsPath + "/" + file.Name() + "/" + "workflow.yaml")
			if err != nil {
				workflowManifest = "na"
			}
			preDefinedWorkflow := &model.PredefinedExperimentList{
				ExperimentName:     file.Name(),
				ExperimentManifest: workflowManifest,
				ExperimentCSV:      csvManifest,
			}
			predefinedWorkflows = append(predefinedWorkflows, preDefinedWorkflow)
		}
	}
	return predefinedWorkflows, nil
}

func IsFileExisting(path string) (bool, error) {
	_, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
	}
	return true, nil
}

// DownloadRemoteHub is used to download a remote hub from the url provided by the user
func DownloadRemoteHub(hubDetails model.CreateRemoteChaosHub, projectID string) error {
	dirPath := DefaultPath + projectID
	err := os.MkdirAll(dirPath, 0755)
	if err != nil {
		return err
	}
	//create the destination directory where the hub will be downloaded
	hubpath := dirPath + "/" + hubDetails.Name + ".zip"
	destDir, err := os.Create(hubpath)
	if err != nil {
		log.Error(err)
		return err
	}
	defer destDir.Close()

	//download the zip file from the provided url
	download, err := http.Get(hubDetails.RepoURL)
	if err != nil {
		log.Error(err)
		return err
	}

	defer download.Body.Close()

	if download.StatusCode != http.StatusOK {
		return fmt.Errorf("err: " + download.Status)
	}

	//validate the content length (in bytes)
	maxSize, err := strconv.Atoi(utils.Config.RemoteHubMaxSize)
	if err != nil {
		return err
	}
	contentLength := download.Header.Get("content-length")
	length, err := strconv.Atoi(contentLength)
	if length > maxSize {
		_ = os.Remove(hubpath)
		return fmt.Errorf("err: File size exceeded the threshold %d", length)
	}

	//validate the content-type
	contentType := download.Header.Get("content-type")
	if contentType != "application/zip" {
		_ = os.Remove(hubpath)
		return fmt.Errorf("err: Invalid file type %s", contentType)
	}

	//copy the downloaded content to the created zip file
	_, err = io.Copy(destDir, download.Body)
	if err != nil {
		log.Error(err)
		return err
	}

	//unzip the ChaosHub to the default hub directory
	err = UnzipRemoteHub(hubpath, hubDetails, projectID)
	if err != nil {
		return err
	}

	//remove the redundant zip file
	err = os.Remove(hubpath)
	if err != nil {
		return err
	}
	return nil
}

// UnzipRemoteHub is used to unzip the zip file
func UnzipRemoteHub(zipPath string, hubDetails model.CreateRemoteChaosHub, projectID string) error {
	extractPath := DefaultPath + projectID
	zipReader, err := zip.OpenReader(zipPath)
	if err != nil {
		log.Error(err)
		return err
	}
	defer zipReader.Close()
	for _, file := range zipReader.File {
		CopyZipItems(file, extractPath, file.Name)
	}
	return nil
}

// CopyZipItems is used to copy the content from the extracted zip file to
// the ChaosHub directory
func CopyZipItems(file *zip.File, extractPath string, chartsPath string) error {
	path := filepath.Join(extractPath, chartsPath)
	if !strings.HasPrefix(path, filepath.Clean(extractPath)+string(os.PathSeparator)) {
		return fmt.Errorf("illegal file path: %s", path)
	}
	err := os.MkdirAll(filepath.Dir(path), os.ModeDir|os.ModePerm)
	if err != nil {
		log.Error(err)
	}
	fileReader, err := file.Open()
	if err != nil {
		log.Error(err)
	}
	if !file.FileInfo().IsDir() {
		fileCopy, err := os.Create(path)
		if err != nil {
			log.Error(err)
		}
		_, err = io.Copy(fileCopy, fileReader)
		if err != nil {
			log.Error(err)
		}
		fileCopy.Close()
	}
	fileReader.Close()

	return nil
}

// SyncRemoteRepo is used to sync the remote ChaosHub
func SyncRemoteRepo(hubData model.CloningInput, projectID string) error {
	hubPath := DefaultPath + projectID + "/" + hubData.Name
	err := os.RemoveAll(hubPath)
	if err != nil {
		return err
	}
	updateHub := model.CreateRemoteChaosHub{
		Name:    hubData.Name,
		RepoURL: hubData.RepoURL,
	}
	log.Info("downloading remote hub")
	err = DownloadRemoteHub(updateHub, projectID)
	if err != nil {
		return err
	}
	log.Info("remote hub ", hubData.Name, "downloaded ")
	return nil
}

// ValidateLocalRepository validates the repository directory and checks it by plain opening it.
func ValidateLocalRepository(hub chaos_hub.ChaosHub) (bool, error) {
	var repoPath string
	if hub.IsDefault {
		repoPath = DefaultPath + "default/" + hub.Name
	} else {
		repoPath = DefaultPath + hub.ProjectID + "/" + hub.Name
	}
	err := chaoshubops.GitPlainOpen(repoPath)
	if err != nil {
		return false, err
	}
	return true, nil
}

// ChaosHubIconHandler is used for fetching ChaosHub icons
func ChaosHubIconHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var (
			img                *os.File
			err                error
			responseStatusCode int
		)

		if strings.ToLower(c.Param("chartName")) == "predefined" {
			img, err = os.Open(utils.Config.CustomChaosHubPath + c.Param("projectId") + "/" + c.Param("hubName") + "/experiments/icons/" + c.Param("iconName"))
			responseStatusCode = http.StatusOK
			if err != nil {
				responseStatusCode = http.StatusInternalServerError
				log.WithError(err).Error("icon cannot be fetched")
				fmt.Fprint(c.Writer, "icon cannot be fetched, err : "+err.Error())
			}
		} else {
			img, err = os.Open(utils.Config.CustomChaosHubPath + c.Param("projectId") + "/" + c.Param("hubName") + "/faults/" + c.Param("chartName") + "/icons/" + c.Param("iconName"))
			responseStatusCode = http.StatusOK
			if err != nil {
				responseStatusCode = http.StatusInternalServerError
				log.WithError(err).Error("icon cannot be fetched")
				fmt.Fprint(c.Writer, "icon cannot be fetched, err : "+err.Error())
			}
		}

		defer img.Close()

		c.Writer.Header().Set("Content-Type", "image/png")
		c.Writer.WriteHeader(responseStatusCode)
		io.Copy(c.Writer, img)
	}
}

func DefaultChaosHubIconHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var (
			img                *os.File
			err                error
			responseStatusCode int
		)

		if strings.ToLower(c.Param("chartName")) == "predefined" {
			img, err = os.Open(utils.Config.DefaultChaosHubPath + c.Param("hubName") + "/experiments/icons/" + c.Param("iconName"))
			responseStatusCode = http.StatusOK
			if err != nil {
				responseStatusCode = http.StatusInternalServerError
				log.WithError(err).Error("icon cannot be fetched")
				fmt.Fprint(c.Writer, "icon cannot be fetched, err : "+err.Error())
			}
		} else {
			img, err = os.Open(utils.Config.DefaultChaosHubPath + c.Param("hubName") + "/faults/" + c.Param("chartName") + "/icons/" + c.Param("iconName"))
			responseStatusCode = http.StatusOK
			if err != nil {
				responseStatusCode = http.StatusInternalServerError
				log.WithError(err).Error("icon cannot be fetched")
				fmt.Fprint(c.Writer, "icon cannot be fetched, err : "+err.Error())
			}
		}

		defer img.Close()

		c.Writer.Header().Set("Content-Type", "image/png")
		c.Writer.WriteHeader(responseStatusCode)
		io.Copy(c.Writer, img)
	}
}
