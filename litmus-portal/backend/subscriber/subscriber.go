/*
	----------------------Subscriber Logic---------------------------------
	Step1: Check if cluster is already registered or not from the configmap.
	Step2: Register the subscriber with the admin cluster.
	Step3: Waiting for request from the graphql server using subscription.
	NOTE: format:
	{
		"requestid": Int!, // Randomly Generated id from the server.
		"requesttype": String!, // request type can be GET, UPDATE, CREATE and DELETE.
		"manifest": Object, // K8s manifest, Not needed when it is a GET or DELETE request.
		"resourcetype": String!, // It can be pre defined or custom k8s resource.
		"namespace": "default" // namespace of the k8s resource.
	}
	! stands for required fields.
	Step4: Call the the clusterOperation function using the above format.
	Step5: Response back to the graphql Server.
*/

package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/cluster"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
)

var GRAPHQL_SERVER_ADDRESS = os.Getenv("SERVER_ADDRESS") // Format: http://IP:PORT
var kubeconfig *string

func IsValidUrl(str string) bool {
	u, err := url.Parse(str)

	if u.Path != "" {
		return false
	}

	return err == nil && u.Scheme != "" && u.Host != ""
}

func init() {
	if IsValidUrl(GRAPHQL_SERVER_ADDRESS) == false {
		log.Fatal("GRAPHQL SERVER ADDRESS NOT FOUND OR NOT CORRECT")
	}
}

func main() {

	kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")

	client := &http.Client{}
	query := `{
			"query": "subscription { clusterSubscription { id data }  }"
		}`

	req, err := http.NewRequest("POST", GRAPHQL_SERVER_ADDRESS+"/query", strings.NewReader(query))
	if err != nil {
		log.Fatal(err)
	}

	// Headers for the calling the server endpoint
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("DNT", "1")

	for {
		resp, err := client.Do(req)
		if err != nil || resp.StatusCode != 200 {
			log.Fatal(err)
		}

		bodyText, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}

		/*
			The format of response is data ---map--> clusterSubsription --map--> data(string)
			- Unmarshal the byte response and store it in a interface
		*/
		var responseInterface map[string]map[string]map[string]interface{}
		err = json.Unmarshal([]byte(bodyText), &responseInterface)
		if err != nil || len(responseInterface) == 0 {
			log.Fatal(err)
		}
		/*
			We need to unmarshal it again because in the last map reponseInterface i.e., data is in string type
		*/
		var dataInterface map[string]interface{}
		err = json.Unmarshal([]byte(fmt.Sprint(responseInterface["data"]["clusterSubscription"]["data"])), &dataInterface)
		if err != nil || len(dataInterface) == 0 {
			log.Fatal(err)
		}

		// Calling clusterOperations Function to apply the manifest in the k8s cluster
		responseFromCluster, err := cluster.ClusterOperations(dataInterface, kubeconfig)
		if err != nil {
			log.Fatal(err)
		}

		log.Println(responseFromCluster)

		/*
			Send response of subscriber to the graphql server as a mutation
		*/

	}

}
