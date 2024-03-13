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

	"subscriber/pkg/events"
	"subscriber/pkg/graphql"
	"subscriber/pkg/requests"
	"subscriber/pkg/utils"

	"github.com/kelseyhightower/envconfig"

	"subscriber/pkg/k8s"
	"subscriber/pkg/types"

	"github.com/sirupsen/logrus"
)

var (
	infraData = map[string]string{
		"ACCESS_KEY":         os.Getenv("ACCESS_KEY"),
		"INFRA_ID":           os.Getenv("INFRA_ID"),
		"SERVER_ADDR":        os.Getenv("SERVER_ADDR"),
		"IS_INFRA_CONFIRMED": os.Getenv("IS_INFRA_CONFIRMED"),
		"INFRA_SCOPE":        os.Getenv("INFRA_SCOPE"),
		"COMPONENTS":         os.Getenv("COMPONENTS"),
		"INFRA_NAMESPACE":    os.Getenv("INFRA_NAMESPACE"),
		"VERSION":            os.Getenv("VERSION"),
		"START_TIME":         os.Getenv("START_TIME"),
		"SKIP_SSL_VERIFY":    os.Getenv("SKIP_SSL_VERIFY"),
		"CUSTOM_TLS_CERT":    os.Getenv("CUSTOM_TLS_CERT"),
	}

	err error
)

type Config struct {
	AccessKey        string `required:"true" split_words:"true"`
	InfraId          string `required:"true" split_words:"true"`
	ServerAddr       string `required:"true" split_words:"true"`
	IsInfraConfirmed string `required:"true" split_words:"true"`
	InfraScope       string `required:"true" split_words:"true"`
	Components       string `required:"true"`
	InfraNamespace   string `required:"true" split_words:"true"`
	Version          string `required:"true"`
	StartTime        string `required:"true" split_words:"true"`
	SkipSSLVerify    bool   `default:"false" split_words:"true"`
}

func init() {
	logrus.Info("Go Version: ", runtime.Version())
	logrus.Info("Go OS/Arch: ", runtime.GOOS, "/", runtime.GOARCH)

	var c Config

	subscriberGraphql := graphql.NewSubscriberGql()
	subscriberK8s := k8s.NewK8sSubscriber(subscriberGraphql)

	err := envconfig.Process("", &c)
	if err != nil {
		logrus.Fatal(err)
	}

	// disable ssl verification if configured
	if strings.ToLower(infraData["SKIP_SSL_VERIFY"]) == "true" {
		http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
		websocket.DefaultDialer.TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	} else if infraData["CUSTOM_TLS_CERT"] != "" {
		cert, err := base64.StdEncoding.DecodeString(infraData["CUSTOM_TLS_CERT"])
		if err != nil {
			logrus.Fatalf("Failed to parse custom tls cert %v", err)
		}
		caCertPool := x509.NewCertPool()
		caCertPool.AppendCertsFromPEM(cert)
		http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{RootCAs: caCertPool}
		websocket.DefaultDialer.TLSClientConfig = &tls.Config{RootCAs: caCertPool}
	}

	k8s.KubeConfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	flag.Parse()

	// check agent component status
	err = subscriberK8s.CheckComponentStatus(infraData["COMPONENTS"])
	if err != nil {
		logrus.Fatal(err)
	}

	logrus.Info("Starting the subscriber")

	isConfirmed, newKey, err := subscriberK8s.IsAgentConfirmed()
	if err != nil {
		logrus.WithError(err).Fatal("Failed to check agent confirmed status")
	}

	if isConfirmed {
		infraData["ACCESS_KEY"] = newKey
	} else if !isConfirmed {
		infraConfirmByte, err := subscriberK8s.AgentConfirm(infraData)
		if err != nil {
			logrus.WithError(err).WithField("data", string(infraConfirmByte)).Fatal("Failed to confirm agent")
		}

		var infraConfirmInterface types.Payload
		err = json.Unmarshal(infraConfirmByte, &infraConfirmInterface)
		if err != nil {
			logrus.WithError(err).WithField("data", string(infraConfirmByte)).Fatal("Failed to parse agent confirm data")
		}

		if infraConfirmInterface.Data.InfraConfirm.IsInfraConfirmed {
			infraData["ACCESS_KEY"] = infraConfirmInterface.Data.InfraConfirm.NewAccessKey
			infraData["IS_INFRA_CONFIRMED"] = "true"

			_, err = subscriberK8s.AgentRegister(infraData["ACCESS_KEY"])
			if err != nil {
				logrus.Fatal(err)
			}
			logrus.Info("AgentID: ", infraData["INFRA_ID"]+" has been confirmed")
		} else {
			logrus.Info("AgentID: ", infraData["INFRA_ID"]+" hasn't been confirmed")
		}
	}
}

func main() {
	stopCh := make(chan struct{})
	sigCh := make(chan os.Signal)
	stream := make(chan types.WorkflowEvent, 10)

	subscriberGraphql := graphql.NewSubscriberGql()
	subscriberK8s := k8s.NewK8sSubscriber(subscriberGraphql)
	subscriberEvents := events.NewSubscriberEventsOperator(subscriberGraphql, subscriberK8s)
	subscriberUtils := utils.NewSubscriberUtils(subscriberEvents, subscriberK8s)
	subscriberEventOperations := events.NewSubscriberEventsOperator(subscriberGraphql, subscriberK8s)
	subscriberRequests := requests.NewSubscriberRequests(subscriberK8s, subscriberUtils)
	//start events event watcher

	subscriberEventOperations.WorkflowEventWatcher(stopCh, stream, infraData)

	//start events event watcher
	subscriberEventOperations.ChaosEventWatcher(stopCh, stream, infraData)
	//streams the event data to graphql server
	go subscriberEventOperations.WorkflowUpdates(infraData, stream)

	// listen for agent actions
	go subscriberRequests.AgentConnect(infraData)

	signal.Notify(sigCh, os.Kill, os.Interrupt)
	<-sigCh
	close(stopCh)
	close(stream)
}
