package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"gopkg.in/yaml.v2"
)

//Chart ...
type Chart struct {
	APIVersion  string             `yaml:"apiVersion"`
	Kind        string             `yaml:"kind"`
	Metadata    Metadata           `yaml:"metadata"`
	Spec        Spec               `yaml:"spec"`
	PackageInfo PackageInformation `yaml:"packageInfo"`
	Experiments []Chart            `yaml:"experiments"`
}

//Maintainer ...
type Maintainer struct {
	Name  string
	Email string
}

//Link ...
type Link struct {
	Name string
	URL  string
}

//Metadata ...
type Metadata struct {
	Name        string     `yaml:"name"`
	Version     string     `yaml:"version"`
	Annotations Annotation `yaml:"annotations"`
}

//Annotation ...
type Annotation struct {
	Categories       string `yaml:"categories"`
	Vendor           string `yaml:"vendor"`
	CreatedAt        string `yaml:"createdAt"`
	Repository       string `yaml:"repository"`
	Support          string `yaml:"support"`
	ChartDescription string `yaml:"chartDescription"`
}

//Spec ...
type Spec struct {
	DisplayName         string       `yaml:"displayName"`
	CategoryDescription string       `yaml:"categoryDescription"`
	Keywords            []string     `yaml:"keywords"`
	Maturity            string       `yaml:"maturity"`
	Maintainers         []Maintainer `yaml:"maintainers"`
	MinKubeVersion      string       `yaml:"minKubeVersion"`
	Provider            struct {
		Name string `yaml:"name"`
	} `yaml:"provider"`
	Links           []Link   `yaml:"links"`
	Experiments     []string `yaml:"experiments"`
	ChaosExpCRDLink string   `yaml:"chaosexpcrdlink"`
	Platforms       []string `yaml:"platforms"`
	ChaosType       string   `yaml:"chaosType"`
}

//PackageInformation ...
type PackageInformation struct {
	PackageName string `yaml:"packageName"`
	Experiments []struct {
		Name string `yaml:"name"`
		CSV  string `yaml:"CSV"`
		Desc string `yaml:"desc"`
	} `yaml:"experiments"`
}

//Charts ...
type Charts []Chart

//default path for storing local clones
const (
	defaultPath = "/tmp/version/"
)

//GetChartsPath is used to construct path for given chart.
func GetChartsPath(ctx context.Context, chartsInput model.CloningInput) string {
	ProjectID := chartsInput.ProjectID
	HubName := chartsInput.HubName
	ChartsPath := defaultPath + ProjectID + "/" + HubName + "/charts/"
	return ChartsPath
}

//GetExperimentChartsVersionYamlPath is used to construct path for given chartsversion.yaml.
func GetExperimentChartsVersionYamlPath(ctx context.Context, experimentInput model.ExperimentInput) string {
	ProjectID := experimentInput.ProjectID
	HubName := experimentInput.HubName
	experimentName := experimentInput.ExperimentName
	chartName := experimentInput.ChartName
	ExperimentPath := defaultPath + ProjectID + "/" + HubName + "/charts/" + chartName + "/" + experimentName + "/" + experimentName + ".chartserviceversion.yaml"
	return ExperimentPath
}

//GetExperimentYAMLPath is used to construct path for given experiment/engine.
func GetExperimentYAMLPath(ctx context.Context, experimentInput model.ExperimentInput) string {
	ProjectID := experimentInput.ProjectID
	HubName := experimentInput.HubName
	experimentName := experimentInput.ExperimentName
	chartName := experimentInput.ChartName
	fileType := *experimentInput.FileType
	ExperimentYAMLPath := defaultPath + ProjectID + "/" + HubName + "/charts/" + chartName + "/" + experimentName + "/" + fileType + ".yaml"
	return ExperimentYAMLPath
}

//GetChartsData is used to get details of charts like experiments.
func GetChartsData(ChartsPath string) ([]*model.Chart, error) {
	var AllChartsDetails Charts
	Charts, err := ioutil.ReadDir(ChartsPath)
	if err != nil {
		fmt.Println("File reading error", err)
		return nil, err
	}
	for _, Chart := range Charts {

		ChartDetails, _ := ReadExperimentFile(ChartsPath + Chart.Name() + "/" + Chart.Name() + ".chartserviceversion.yaml")
		AllChartsDetails = append(AllChartsDetails, ChartDetails)
	}

	e, _ := json.Marshal(AllChartsDetails)
	var data1 []*model.Chart
	json.Unmarshal([]byte(e), &data1)
	return data1, nil
}

//GetExperimentData is used for getting details of selected Experiment path
func GetExperimentData(experimentFilePath string) (*model.Chart, error) {
	data, _ := ReadExperimentFile(experimentFilePath)
	e, _ := json.Marshal(data)
	var data1 *model.Chart
	json.Unmarshal([]byte(e), &data1)
	return data1, nil
}

//ReadExperimentFile is used for reading a experiment file from given path
func ReadExperimentFile(path string) (Chart, error) {
	var experiment Chart
	experimentFile, err := ioutil.ReadFile(path)
	if err != nil {
		return experiment, fmt.Errorf("file path of the, err: %+v", err)
	}

	if yaml.Unmarshal([]byte(experimentFile), &experiment) != nil {
		return experiment, err
	}
	return experiment, nil
}

//ReadExperimentYAMLFile is used for reading a experiment/engine file from given path
func ReadExperimentYAMLFile(path string) (string, error) {
	var s string
	YAMLData, err := ioutil.ReadFile(path)
	if err != nil {
		return s, fmt.Errorf("file path of the, err: %+v", err)
	}
	s = string(YAMLData)
	return s, nil
}
