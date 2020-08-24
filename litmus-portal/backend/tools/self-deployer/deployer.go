package main

import (
	"bytes"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strings"
	"time"
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
func Deploy(file string) error {
	cmd := exec.Command("kubectl", "apply", "-f", file)
	if output, err := cmd.Output(); err != nil {
		log.Print("XX FAILED TO DEPLOY SUBSCRIBER COMPONENTS")
		log.Print("ERROR : ", err.Error())
		return err
	} else {
		log.Printf("\n%s", output)
		log.Print("SUCCESSFULLY DEPLOYED SUBSCRIBER COMPONENTS")
	}
	return nil
}

//Cleanup is responsible for deleting the self-deployer deployment after it has finished execution
func CleanUp(ns, deployment string) error {
	cmd := exec.Command("kubectl", "delete", "deployment", deployment, "-n", ns)
	if output, err := cmd.Output(); err != nil {
		log.Print("XX FAILED TO CLEANUP SELF-DEPLOYER")
		log.Print("ERROR : ", err.Error())
		return err
	} else {
		log.Printf("\n%s", output)
		log.Print("SUCCESSFUL CLEANUP OF SELF-DEPLOYER")
	}
	return nil
}

func main() {
	active := os.Getenv("SELF_CLUSTER")
	if strings.ToLower(active) == "true" {
		server := os.Getenv("SERVER")
		log.Print("Starting Self Deployer")
		WaitForServer(server + "/query")
		log.Print("Cluster Registration Initiated")
		tk, err := RegSelfCluster(server+"/query", "00000")
		if err != nil {
			log.Panic(err.Error())
		}
		time.Sleep(10 * time.Second)
		log.Print(server + "/file/" + tk + ".yaml")
		err = Deploy(server + "/file/" + tk + ".yaml")
		if err != nil {
			log.Panic(err.Error())
		}
		log.Print("SUBSCRIBER DEPLOYED")
	}
	log.Print("PERFORMING CLEANUP")
	err := CleanUp("litmus", "self-deployer")
	if err != nil {
		log.Panic(err.Error())
	}
}
