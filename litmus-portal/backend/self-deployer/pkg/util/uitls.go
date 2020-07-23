package util

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/backend/self-deployer/pkg/k8s"
)

//WaitForServer makes the self-deployer sleep until the GQL Server is up and running
func WaitForServer(server string) {
	log.Print("Checking if Server Up ", server)
	for true {
		req, err := http.NewRequest("GET", server, bytes.NewBuffer([]byte("")))
		req.Header.Set("Content-Type", "application/json")
		client := &http.Client{}
		res, err := client.Do(req)
		if err != nil || res.StatusCode != 200 {
			time.Sleep(30 * time.Second)
		} else {
			break
		}
	}
}

//RegSelfCluster registers the Cluster automatically with the Litmus-Portal and get the Manifest Data
func RegSelfCluster(server, pid string) (string, error) {
	var jsonStr = []byte(`{"query":"mutation { userClusterReg(clusterInput: { cluster_name: \"Self-Cluster\", description:\"Self-Cluster\", project_id:\"` + pid + `\", platform_name:\"others\", cluster_type:\"INTERNAL\"})}"}`)
	req, err := http.NewRequest("POST", server, bytes.NewBuffer(jsonStr))
	if err != nil {
		log.Print(err.Error())
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Print(err.Error())
		return "", err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Print(err.Error())
		return "", err
	}
	regex := regexp.MustCompile(`"ey.*"`)
	tk := regex.FindString(string(body))
	tk = strings.Trim(tk, `"`)
	return tk, nil
}

//Deploy function deploys the Manifest received by the RegSelfCluster function
func Deploy(file string) error {
	resp, err := http.Get(file)
	if err != nil {
		log.Print(err.Error())
		return err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Print(err.Error())
		return err
	}
	log.Print(string(body))
	response, err := k8s.ClusterOperations(body, "create")
	if err != nil {
		log.Println(err.Error())
		return err
	}
	responseData, err := json.Marshal(response)
	if err != nil {
		log.Println("err:", err)
	}
	log.Print("SUBSCRIBER DEPLOYMENT RESPONSE : ", string(responseData))
	return nil
}

//Cleanup is responsible for deleting the self-deployer deployment after it has finished execution
func CleanUp(path string) error {
	body, err := ioutil.ReadFile(path)
	if err != nil {
		log.Print(err.Error())
		return err
	}
	response, err := k8s.ClusterOperations(body, "delete")
	if err != nil {
		log.Println(err.Error())
		return err
	}
	responseData, err := json.Marshal(response)
	if err != nil {
		log.Println("err:", err)
	}
	log.Print("CLEANUP RESPONSE : ", string(responseData))
	return nil
}
