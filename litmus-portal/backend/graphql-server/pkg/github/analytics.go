package github

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"
)

const (
	timeInterval = 5 * time.Minute
	repoName     = "litmus"
)

type GithubData struct{
	Stars int `json:"stargazers_count"`
}

var Github GithubData

// Handler is responsible for the looping the UpdateGithubData()
func Handler() {
	for true {
		log.Infof("Updating Github Litmus Repo Data ...")
		err := UpdateGithubData()
		if err != nil {
			log.Error(err)
		}
		time.Sleep(timeInterval)
	}
}

//UpdateGithubData updates github data related to litmus repo, makes a get request to the public APIs
//of github to fetch repo and contributor data
func UpdateGithubData() error {
	response, err := http.Get("https://api.github.com/repos/litmuschaos/" + repoName)
	if err != nil {
		return fmt.Errorf("Error while getting github repo data, err :%s", err)
	}
	data, _ := ioutil.ReadAll(response.Body)
	err = json.Unmarshal(data,&Github)
	if err!=nil{
		return fmt.Errorf("Error while getting github repo data, err :%s", err)
	}
	return nil
}
