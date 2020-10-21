package handler

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

type chartData struct {
	Chartname  string   `json:"chart"`
	Experiment []string `json:"experiment"`
}

//Chart ...
type Chart struct {
	ApiVersion  string             `yaml:"apiVersion"`
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
	Url  string
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
	DisplayName         string   `yaml:"displayName"`
	CategoryDescription string   `yaml:"categoryDescription"`
	Keywords            []string `yaml:"keywords"`

	Maturity       string       `yaml:"maturity"`
	Maintainers    []Maintainer `yaml:"maintainers"`
	MinKubeVersion string       `yaml:"minKubeVersion"`
	Provider       struct {
		Name string `yaml:"name"`
	} `yaml:"provider"`
	Links []Link `yaml:"links"`

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

//GetChartsData is used to get details of charts like experiments.
func GetChartsData(UserName string, RepoName string, Branch string, Owner string, HubName string) ([]byte, error) {
	var chartsd Charts
	data, err := ioutil.ReadDir("/tmp/version/" + UserName + "/" + HubName + "/" + RepoName + "/" + Branch + "/charts")
	if err != nil {
		fmt.Println("File reading error", err)
		fmt.Println("Cloning repository...")
		return nil, err
	}
	for _, file := range data {

		data1, _ := readExperimentFile("/tmp/version/" + UserName + "/" + HubName + "/" + RepoName + "/" + Branch + "/charts/" + file.Name() + "/" + file.Name() + ".chartserviceversion.yaml")
		chartsd = append(chartsd, data1)
	}

	e, _ := json.Marshal(chartsd)
	return e, nil
}

func readExperimentFile(path string) (Chart, error) {
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
