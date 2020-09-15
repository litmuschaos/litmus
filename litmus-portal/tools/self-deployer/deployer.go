package main

import (
	"log"
	"os"
	"os/exec"
)

//Deploy function deploys the Manifest received by the RegSelfCluster function
func Deploy(file string) error {
	cmd := exec.Command("kubectl", "apply", "-f", file)
	if output, err := cmd.Output(); err != nil {
		log.Print("XX FAILED TO DEPLOY SUBSCRIBER COMPONENTS")
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
	token := os.Getenv("TOKEN")
	server := os.Getenv("SERVER")
	log.Print("Starting Self Deployer")
	log.Print(server + "/file/" + token + ".yaml")
	err := Deploy(server + "/file/" + token + ".yaml")
	if err != nil {
		log.Panic(err.Error())
	}
	log.Print("SUBSCRIBER DEPLOYED")
	log.Print("PERFORMING CLEANUP")
	err = CleanUp("litmus", "self-deployer")
	if err != nil {
		log.Panic(err.Error())
	}
}
