package handler

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
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

func IsFileExisting(path string) (bool, error) {
	_, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
	}
	return true, nil
}
