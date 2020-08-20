package main

import (
	"encoding/json"
	"flag"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/gql"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/k8s"
	"log"
	"os"
	"path/filepath"
	"strings"
)

var (
	clusterData = map[string]string{
		"KEY":        os.Getenv("KEY"),
		"CID":        os.Getenv("CID"),
		"GQL_SERVER": os.Getenv("GQL_SERVER"),
	}
	err    error
	newKey string
)

func init() {
	if home := homeDir(); home != "" {
		k8s.KubeConfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		k8s.KubeConfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	}
	flag.Parse()

	var isConfirmed bool
	isConfirmed, newKey, err = cluster.IsClusterConfirmed(clusterData)
	if err != nil {
		log.Fatal(err)
	}

	if isConfirmed == true {
		clusterData["KEY"] = newKey
	} else if isConfirmed == false {

		bodyText, err := gql.ClusterConfirm(clusterData)
		if err != nil {
			log.Fatal(err)
		}

		var responseInterface map[string]map[string]map[string]interface{}
		err = json.Unmarshal(bodyText, &responseInterface)
		if err != nil {
			log.Fatal(err)
		}

		if responseInterface["data"]["clusterConfirm"]["isClusterConfirmed"] == true {
			log.Println("cluster confirmed")
			clusterData["KEY"] = strings.TrimSpace(responseInterface["data"]["clusterConfirm"]["newClusterKey"].(string))
			cluster.ClusterRegister(clusterData)
		} else {
			log.Fatal("Cluster not confirmed")
		}
	}
}

func homeDir() string {
	if h := os.Getenv("HOME"); h != "" {
		return h
	}
	return os.Getenv("USERPROFILE") // windows
}

func main() {
	sigCh := make(chan os.Signal)
	go gql.ClusterConnect(clusterData)
	<-sigCh
}
