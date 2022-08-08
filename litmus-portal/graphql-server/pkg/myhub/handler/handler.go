package handler

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"gopkg.in/yaml.v2"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

// default path for storing local clones
const (
	defaultPath = "/tmp/version/"
)

// GetChartsPath is used to construct path for given chart.
func GetChartsPath(chartsInput model.CloningInput) string {
	ProjectID := chartsInput.ProjectID
	HubName := chartsInput.HubName
	ChartsPath := defaultPath + ProjectID + "/" + HubName + "/charts/"
	return ChartsPath
}

// GetCSVData returns the ChartServiceYAML details according to the given filetype
func GetCSVData(request model.ExperimentRequest) string {
	var ExperimentPath string
	ProjectID := request.ProjectID
	HubName := request.HubName
	experimentName := request.ExperimentName
	chartName := request.ChartName
	if strings.ToLower(request.ChartName) == "predefined" {
		ExperimentPath = defaultPath + ProjectID + "/" + HubName + "/workflows/" + experimentName + "/" + experimentName + ".chartserviceversion.yaml"
	} else {
		ExperimentPath = defaultPath + ProjectID + "/" + HubName + "/charts/" + chartName + "/" + experimentName + "/" + experimentName + ".chartserviceversion.yaml"
	}
	return ExperimentPath
}

// GetExperimentYAMLPath is used to construct path for given experiment/engine.
func GetExperimentYAMLPath(request model.ExperimentRequest) string {
	ProjectID := request.ProjectID
	HubName := request.HubName
	experimentName := request.ExperimentName
	chartName := request.ChartName
	fileType := request.FileType
	ExperimentYAMLPath := defaultPath + ProjectID + "/" + HubName + "/charts/" + chartName + "/" + experimentName + "/" + strings.ToLower(*fileType) + ".yaml"
	return ExperimentYAMLPath
}

// GetPredefinedExperimentManifest is used to construct path for given chartsversion.yaml.
func GetPredefinedExperimentManifest(request model.ExperimentRequest) string {
	ProjectID := request.ProjectID
	HubName := request.HubName
	experimentName := request.ExperimentName
	ExperimentPath := defaultPath + ProjectID + "/" + HubName + "/workflows/" + experimentName + "/workflow.yaml"
	return ExperimentPath
}

// GetChartsData is used to get details of charts like experiments.
func GetChartsData(ChartsPath string) ([]*model.Chart, error) {
	var AllChartsDetails []ChaosChart
	Charts, err := ioutil.ReadDir(ChartsPath)
	if err != nil {
		fmt.Println("File reading error", err)
		return nil, err
	}
	for _, Chart := range Charts {

		ChartDetails, _ := ReadExperimentFile(ChartsPath + Chart.Name() + "/" + Chart.Name() + ".chartserviceversion.yaml")
		AllChartsDetails = append(AllChartsDetails, ChartDetails)
	}

	e, err := json.Marshal(AllChartsDetails)
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

	if yaml.Unmarshal(experimentFile, &experiment) != nil {
		return experiment, err
	}
	return experiment, nil
}

// ReadExperimentYAMLFile is used for reading a experiment/engine file from given path
func ReadExperimentYAMLFile(path string) (string, error) {
	var s string
	YAMLData, err := ioutil.ReadFile(path)
	if err != nil {
		return s, fmt.Errorf("file path of the, err: %+v", err)
	}
	s = string(YAMLData)
	return s, nil
}

// GetPredefinedExperimentFileList reads the workflow directory for all the predefined experiments
func GetPredefinedWorkflowFileList(hubname string, projectID string) ([]string, error) {
	ExperimentsPath := defaultPath + projectID + "/" + hubname + "/workflows"
	var expNames []string
	files, err := ioutil.ReadDir(ExperimentsPath)
	if err != nil {
		return nil, err
	}
	for _, file := range files {
		isExist, _ := IsFileExisting(ExperimentsPath + "/" + file.Name() + "/" + file.Name() + ".chartserviceversion.yaml")
		if isExist {
			expNames = append(expNames, file.Name())
		}
	}
	return expNames, nil
}

// ListPredefinedWorkflowDetails reads the workflow directory for all the predefined experiments
// and returns the csv, workflow manifest and workflow name
func ListPredefinedWorkflowDetails(hubName string, projectID string) ([]*model.PredefinedWorkflowList, error) {
	experimentsPath := defaultPath + projectID + "/" + hubName + "/workflows"
	var predefinedWorkflows []*model.PredefinedWorkflowList
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
			preDefinedWorkflow := &model.PredefinedWorkflowList{
				WorkflowName:     file.Name(),
				WorkflowManifest: workflowManifest,
				WorkflowCsv:      csvManifest,
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

//DownloadRemoteHub is used to download a remote hub from the url provided by the user
func DownloadRemoteHub(hubDetails model.CreateRemoteMyHub) error {
	//create the destination directory where the hub will be downloaded
	hubpath := defaultPath + hubDetails.ProjectID + "/" + hubDetails.HubName + ".zip"
	destDir, err := os.Create(hubpath)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer destDir.Close()

	//download the zip file from the provided url
	download, err := http.Get(hubDetails.RepoURL)
	if err != nil {
		fmt.Println(err)
		return err
	}

	defer download.Body.Close()

	if download.StatusCode != http.StatusOK {
		err = fmt.Errorf("err: ", download.Status)
		return err
	}

	//validate the content length (in bytes)
	maxSize, err := strconv.Atoi(os.Getenv("REMOTE_HUB_MAX_SIZE"))
	if err != nil {
		return err
	}
	contentLength := download.Header.Get("content-length")
	length, err := strconv.Atoi(contentLength)
	if length > maxSize {
		_ = os.Remove(hubpath)
		err = fmt.Errorf("err: File size exceeded the threshold %d", length)
		return err
	}

	//validate the content-type
	contentType := download.Header.Get("content-type")
	if contentType != "application/zip" {
		_ = os.Remove(hubpath)
		err = fmt.Errorf("err: Invalid file type %s", contentType)
		return err
	}

	//copy the downloaded content to the created zip file
	_, err = io.Copy(destDir, download.Body)
	if err != nil {
		fmt.Println(err)
		return err
	}

	//unzip the ChaosHub to the default hub directory
	err = UnzipRemoteHub(hubpath, hubDetails)
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

//UnzipRemoteHub is used to unzip the zip file
func UnzipRemoteHub(zipPath string, hubDetails model.CreateRemoteMyHub) error {
	extractPath := defaultPath + hubDetails.ProjectID
	zipReader, err := zip.OpenReader(zipPath)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer zipReader.Close()
	for _, file := range zipReader.File {
		CopyZipItems(file, extractPath, file.Name)
	}
	return nil
}

//CopyZipItems is used to copy the content from the extracted zip file to
//the ChaosHub directory
func CopyZipItems(file *zip.File, extractPath string, chartsPath string) error {
	path := filepath.Join(extractPath, chartsPath)
	if !strings.HasPrefix(path, filepath.Clean(extractPath)+string(os.PathSeparator)) {
		return fmt.Errorf("illegal file path: %s", path)
	}
	err := os.MkdirAll(filepath.Dir(path), os.ModeDir|os.ModePerm)
	if err != nil {
		fmt.Println(err)
	}
	fileReader, err := file.Open()
	if err != nil {
		fmt.Println(err)
	}
	if !file.FileInfo().IsDir() {
		fileCopy, err := os.Create(path)
		if err != nil {
			fmt.Println(err)
		}
		_, err = io.Copy(fileCopy, fileReader)
		if err != nil {
			fmt.Println(err)
		}
		fileCopy.Close()
	}
	fileReader.Close()

	return nil
}

//SyncRemoteRepo is used to sync the remote ChaosHub
func SyncRemoteRepo(hubData model.CloningInput) error {
	hubPath := defaultPath + hubData.ProjectID + "/" + hubData.HubName
	err := os.RemoveAll(hubPath)
	if err != nil {
		return err
	}
	updateHub := model.CreateRemoteMyHub{
		HubName:   hubData.HubName,
		RepoURL:   hubData.RepoURL,
		ProjectID: hubData.ProjectID,
	}
	log.Println("Downloading remote hub")
	err = DownloadRemoteHub(updateHub)
	if err != nil {
		return err
	}
	log.Println("Remote hub ", hubData.HubName, "downloaded ")
	return nil
}
