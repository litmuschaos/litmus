package file_handlers

import (
	"bufio"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/cluster"
	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/utils"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

//ManifestParser parses manifests yaml and generates dynamic manifest with specified keys
func manifestParser(id, key, server, template string) ([]string, error) {
	file, err := os.Open(template)
	if err != nil {
		return []string{}, err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	var lines []string

	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "#{CID}") {
			line = strings.Replace(line, "#{CID}", id, -1)
		} else if strings.Contains(line, "#{KEY}") {
			line = strings.Replace(line, "#{KEY}", key, -1)
		} else if strings.Contains(line, "#{SERVER}") {
			line = strings.Replace(line, "#{SERVER}", server, -1)
		}
		lines = append(lines, line)
	}

	if err := scanner.Err(); err != nil {
		return []string{}, err
	}

	return lines, nil
}

//FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(w http.ResponseWriter, r *http.Request) {
	serviceAddr := cluster.GetIP()
	fmt.Println("serviceAdd", serviceAddr)
	//os.Getenv("SERVICE_ADDRESS")
	vars := mux.Vars(r)
	token := vars["key"]

	id, err := cluster.ClusterValidateJWT(token)
	if err != nil {
		log.Print("ERROR", err)
		utils.WriteHeaders(&w, 404)
		return
	}

	reqCluster, err := database.GetCluster(id)
	if err != nil {
		log.Print("ERROR", err)
		utils.WriteHeaders(&w, 500)
		return
	}

	if !reqCluster.IsRegistered {
		var respData []string
		respData, err = manifestParser(reqCluster.ClusterID, reqCluster.AccessKey, serviceAddr+"/query", "manifests/subscriber.yml")

		if err != nil {
			log.Print("ERROR", err)
			utils.WriteHeaders(&w, 500)
			return
		}
		utils.WriteHeaders(&w, 200)
		w.Write([]byte(strings.Join(respData, "\n")))
		return
	}

	utils.WriteHeaders(&w, 404)
}

//sdasd
func GetIP() string {
	fmt.Println("GetIP called")
	// Require variables declared
	var kubeconfig *string
	//nodeAddresses := []corev1.NodeAddress{}

	// To get In-CLuster config
	config, err := rest.InClusterConfig()
	fmt.Println("Incluster called")

	// If In-Cluster is nil then it will go for Out-Cluster config
	if config == nil {

		fmt.Println("config==nil")

		//To get Out-Cluster config
		if home := homedir.HomeDir(); home != "" {
			kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "kubeconfig file it is out-of-cluster")
		} else {
			kubeconfig = flag.String("kubeconfig", "", "Path to the kubeconfig file")
		}
		fmt.Println("kubeconfig :", kubeconfig)

		//panic(err.Error())
		flag.Parse()

		// uses the current context in kubeconfig
		config, err = clientcmd.BuildConfigFromFlags("", *kubeconfig)
		if err != nil {
			fmt.Println("congig err")
			panic(err.Error())
		}
	}

	// creates the clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}
	nodeName := os.Getenv("NODE_NAME")

	fmt.Println("nodeName :", nodeName)

	node, err := clientset.CoreV1().Nodes().Get(nodeName, metav1.GetOptions{})
	address := node.Status.Addresses
	fmt.Println("address :", address)

	value1 := ""
	value2 := ""

	for _, addr := range address {
		fmt.Println("--")

		if addr.Type == "ExternalIP" && addr.Address != "" {
			value1 = addr.Address
		} else if addr.Type == "InternalIP" && addr.Address != "" {
			value2 = addr.Address
		}
	}

	if value1 == "" {
		value1 = value2
	}
	fmt.Println(value1)
	return value1
}
