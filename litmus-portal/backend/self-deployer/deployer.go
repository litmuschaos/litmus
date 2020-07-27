package main

import (
	"flag"
	"log"
	"os"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/backend/self-deployer/pkg/util"
)

func main() {
	active := os.Getenv("SELF_CLUSTER")
	kubeconfig := flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	if strings.ToLower(active) == "true" {
		server := os.Getenv("SERVER")
		log.Print("Starting Self Deployer")
		util.WaitForServer(server + "/query")
		log.Print("Cluster Registration Initiated")
		tk, err := util.RegSelfCluster(server+"/query", "00000")
		if err != nil {
			log.Panic(err.Error())
		}
		time.Sleep(30 * time.Second)
		err = util.Deploy(server+"/file/"+tk, kubeconfig)
		if err != nil {
			log.Panic(err.Error())
		}
		log.Print("SUBSCRIBER DEPLOYED")
	}
	log.Print("PERFORMING CLEANUP")
	err := util.CleanUp("litmus", "self-deployer")
	if err != nil {
		log.Panic(err.Error())
	}
}
