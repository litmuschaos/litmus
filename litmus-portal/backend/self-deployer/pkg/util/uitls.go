package util

import (
	"bytes"
	"context"
	"encoding/json"
	"io/ioutil"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/backend/self-deployer/pkg/k8s"
)

//WaitForServer makes the self-deployer sleep until the GQL Server is up and running, timeout after 5min
func WaitForServer(server string) {
	timeout := time.After(5 * time.Minute)
	done := make(chan struct{})
	go func(d chan struct{}) {
		for {
			log.Print("Checking if Server Up ", server)
			req, err := http.NewRequest("GET", server, bytes.NewBuffer([]byte("")))
			req.Header.Set("Content-Type", "application/json")
			client := &http.Client{}
			res, err := client.Do(req)
			if err != nil || res.StatusCode != 200 {
				time.Sleep(30 * time.Second)
			} else {
				d <- struct{}{}
				return
			}
		}
	}(done)
	select {
	case <-timeout:
		log.Panic("ERROR[TIMEOUT] : SERVER NOT UP AFTER 5 MIN")
		return
	case <-done:
		log.Print("SERVER UP")
		return
	}
}

//RegSelfCluster registers the Cluster automatically with the Litmus-Portal and get the Manifest Data
func RegSelfCluster(server, pid string) (string, error) {
	query := `{ cluster_name: \"Self-Cluster\", description:\"Self-Cluster\", project_id:\"` + pid + `\", platform_name:\"others\", cluster_type:\"INTERNAL\"}`
	var jsonStr = []byte(`{"query":"mutation { userClusterReg(clusterInput:` + query + ` )}"}`)
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
func Deploy(file string, kubeconfig *string) error {
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
	response, err := k8s.CreateDeployment(body, kubeconfig)
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
func CleanUp(ns, deplotment string) error {
	config, err := rest.InClusterConfig()
	if err != nil {
		log.Print(err.Error())
		return err
	}
	client, err := kubernetes.NewForConfig(config)
	err = client.AppsV1().Deployments(ns).Delete(context.TODO(), deplotment, metav1.DeleteOptions{})
	if err != nil {
		log.Print("ERROR : ", err.Error())
		return err
	}
	return nil
}
