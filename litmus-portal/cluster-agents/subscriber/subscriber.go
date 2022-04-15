package main

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"flag"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strings"

	"github.com/gorilla/websocket"

	"github.com/kelseyhightower/envconfig"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/events"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/requests"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/sirupsen/logrus"
)

var (
	clusterData = map[string]string{
		"ACCESS_KEY":           os.Getenv("ACCESS_KEY"),
		"CLUSTER_ID":           os.Getenv("CLUSTER_ID"),
		"SERVER_ADDR":          os.Getenv("SERVER_ADDR"),
		"IS_CLUSTER_CONFIRMED": os.Getenv("IS_CLUSTER_CONFIRMED"),
		"AGENT_SCOPE":          os.Getenv("AGENT_SCOPE"),
		"COMPONENTS":           os.Getenv("COMPONENTS"),
		"AGENT_NAMESPACE":      os.Getenv("AGENT_NAMESPACE"),
		"VERSION":              os.Getenv("VERSION"),
		"START_TIME":           os.Getenv("START_TIME"),
		"SKIP_SSL_VERIFY":      os.Getenv("SKIP_SSL_VERIFY"),
		"CUSTOM_TLS_CERT":      os.Getenv("CUSTOM_TLS_CERT"),
	}

	err error
)

type Config struct {
	AccessKey          string `required:"true" split_words:"true"`
	ClusterId          string `required:"true" split_words:"true"`
	ServerAddr         string `required:"true" split_words:"true"`
	IsClusterConfirmed string `required:"true" split_words:"true"`
	AgentScope         string `required:"true" split_words:"true"`
	Components         string `required:"true"`
	AgentNamespace     string `required:"true" split_words:"true"`
	Version            string `required:"true"`
	StartTime          string `required:"true" split_words:"true"`
	SkipSSLVerify      bool   `default:"false" split_words:"true"`
}

func init() {
	logrus.Info("Go Version: ", runtime.Version())
	logrus.Info("Go OS/Arch: ", runtime.GOOS, "/", runtime.GOARCH)

	var c Config

	err := envconfig.Process("", &c)
	if err != nil {
		logrus.Fatal(err)
	}

	// disable ssl verification if configured
	if strings.ToLower(clusterData["SKIP_SSL_VERIFY"]) == "true" {
		http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
		websocket.DefaultDialer.TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	} else if clusterData["CUSTOM_TLS_CERT"] != "" {
		cert, err := base64.StdEncoding.DecodeString(clusterData["CUSTOM_TLS_CERT"])
		if err != nil {
			logrus.Fatalf("failed to parse custom tls cert %v", err)
		}
		caCertPool := x509.NewCertPool()
		caCertPool.AppendCertsFromPEM(cert)
		http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{RootCAs: caCertPool}
		websocket.DefaultDialer.TLSClientConfig = &tls.Config{RootCAs: caCertPool}
	}

	k8s.KubeConfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	flag.Parse()

	// check agent component status
	err = k8s.CheckComponentStatus(clusterData["COMPONENTS"])
	if err != nil {
		logrus.Fatal(err)
	}

	logrus.Info("all components live...starting up subscriber")

	isConfirmed, newKey, err := k8s.IsClusterConfirmed()
	if err != nil {
		logrus.WithError(err).Fatal("failed to check cluster confirmed status")
	}

	if isConfirmed {
		clusterData["ACCESS_KEY"] = newKey
	} else if !isConfirmed {
		clusterConfirmByte, err := k8s.ClusterConfirm(clusterData)
		if err != nil {
			logrus.WithError(err).WithField("data", string(clusterConfirmByte)).Fatal("failed to confirm cluster")
		}

		var clusterConfirmInterface types.Payload
		err = json.Unmarshal(clusterConfirmByte, &clusterConfirmInterface)
		if err != nil {
			logrus.WithError(err).WithField("data", string(clusterConfirmByte)).Fatal("failed to parse cluster confirm data")
		}

		if clusterConfirmInterface.Data.ClusterConfirm.IsClusterConfirmed {
			clusterData["ACCESS_KEY"] = clusterConfirmInterface.Data.ClusterConfirm.NewAccessKey
			clusterData["IS_CLUSTER_CONFIRMED"] = "true"

			logrus.Print("here1", clusterData)
			_, err = k8s.ClusterRegister(clusterData)
			if err != nil {
				logrus.Fatal(err)
			}
			logrus.Info(clusterData["CLUSTER_ID"] + " has been confirmed")
		} else {
			logrus.Info(clusterData["CLUSTER_ID"] + " hasn't been confirmed")
		}
	}

}

func main() {
	stopCh := make(chan struct{})
	sigCh := make(chan os.Signal)
	stream := make(chan types.WorkflowEvent, 10)

	//start events event watcher
	events.WorkflowEventWatcher(stopCh, stream, clusterData)

	//start events event watcher
	events.ChaosEventWatcher(stopCh, stream, clusterData)
	//streams the event data to graphql server
	go events.WorkflowUpdates(clusterData, stream)

	logrus.Info("here-2", clusterData)
	// listen for cluster actions
	go requests.ClusterConnect(clusterData)

	signal.Notify(sigCh, os.Kill, os.Interrupt)
	<-sigCh
	close(stopCh)
	close(stream)
}
