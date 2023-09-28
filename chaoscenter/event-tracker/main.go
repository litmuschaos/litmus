/*
Copyright 2021.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"flag"
	"net/http"
	"os"
	rt "runtime"
	"time"

	"github.com/kelseyhightower/envconfig"
	"github.com/litmuschaos/litmus/chaoscenter/event-tracker/pkg/k8s"
	"github.com/litmuschaos/litmus/chaoscenter/event-tracker/pkg/utils"
	"github.com/sirupsen/logrus"
	"k8s.io/client-go/informers"

	// Import all Kubernetes client auth plugins (e.g. Azure, GCP, OIDC, etc.)
	// to ensure that exec-entrypoint and run can make use of them.
	_ "k8s.io/client-go/plugin/pkg/client/auth"

	"k8s.io/apimachinery/pkg/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/healthz"
	"sigs.k8s.io/controller-runtime/pkg/log/zap"
	"sigs.k8s.io/controller-runtime/pkg/manager"

	eventtrackerv1 "github.com/litmuschaos/litmus/chaoscenter/event-tracker/api/v1"
	"github.com/litmuschaos/litmus/chaoscenter/event-tracker/controllers"
	//+kubebuilder:scaffold:imports
)

var (
	scheme   = runtime.NewScheme()
	setupLog = ctrl.Log.WithName("setup")
)

func init() {
	logrus.Info("Go Version: ", rt.Version())
	logrus.Info("Go OS/Arch: ", rt.GOOS, "/", rt.GOARCH)

	err := envconfig.Process("", &utils.Config)
	if err != nil {
		logrus.Fatal(err)
	}

	utilruntime.Must(clientgoscheme.AddToScheme(scheme))

	utilruntime.Must(eventtrackerv1.AddToScheme(scheme))
	//+kubebuilder:scaffold:scheme

	clientset, err := k8s.K8sClient()
	if err != nil {
		logrus.Error(err)
	}

	var factory informers.SharedInformerFactory
	if utils.Config.InfraScope == "cluster" {
		factory = informers.NewSharedInformerFactory(clientset, 30*time.Second)
	} else if utils.Config.InfraScope == "namespace" {
		factory = informers.NewSharedInformerFactoryWithOptions(clientset, 30*time.Second, informers.WithNamespace(utils.Config.InfraNamespace))
	}

	go utils.RunDeploymentInformer(factory)
	go utils.RunDSInformer(factory)
	go utils.RunStsInformer(factory)

}

func main() {
	var metricsAddr string
	var enableLeaderElection bool
	var probeAddr string
	flag.StringVar(&metricsAddr, "metrics-bind-address", ":8080", "The address the metric endpoint binds to.")
	flag.StringVar(&probeAddr, "health-probe-bind-address", ":8081", "The address the probe endpoint binds to.")
	flag.BoolVar(&enableLeaderElection, "leader-elect", false,
		"Enable leader election for controller manager. "+
			"Enabling this will ensure there is only one active controller manager.")
	opts := zap.Options{
		Development: true,
	}
	opts.BindFlags(flag.CommandLine)
	flag.Parse()

	ctrl.SetLogger(zap.New(zap.UseFlagOptions(&opts)))

	// disable ssl verification if configured
	if utils.Config.SkipSSLVerify {
		http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	} else if utils.Config.CustomTLSCert != "" {
		cert, err := base64.StdEncoding.DecodeString(utils.Config.CustomTLSCert)
		if err != nil {
			logrus.Fatalf("failed to parse custom tls cert %v", err)
		}
		caCertPool := x509.NewCertPool()
		caCertPool.AppendCertsFromPEM(cert)
		http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{RootCAs: caCertPool}
	}

	var (
		mgr manager.Manager
		err error
	)

	if utils.Config.InfraScope == "namespace" {
		mgr, err = ctrl.NewManager(ctrl.GetConfigOrDie(), ctrl.Options{
			Scheme:             scheme,
			MetricsBindAddress: metricsAddr,
			Port:               9443,
			Namespace:          utils.Config.InfraNamespace,
			LeaderElection:     enableLeaderElection,
			LeaderElectionID:   "2b79cec3.litmuschaos.io",
		})
	} else if utils.Config.InfraScope == "cluster" {
		mgr, err = ctrl.NewManager(ctrl.GetConfigOrDie(), ctrl.Options{
			Scheme:             scheme,
			MetricsBindAddress: metricsAddr,
			Port:               9443,
			LeaderElection:     enableLeaderElection,
			LeaderElectionID:   "2b79cec3.litmuschaos.io",
		})
	}
	if err != nil {
		setupLog.Error(err, "unable to start manager")
		os.Exit(1)
	}

	if err = (&controllers.EventTrackerPolicyReconciler{
		Client: mgr.GetClient(),
		Scheme: mgr.GetScheme(),
	}).SetupWithManager(mgr); err != nil {
		setupLog.Error(err, "unable to create controller", "controller", "EventTrackerPolicy")
		os.Exit(1)
	}
	//+kubebuilder:scaffold:builder

	if err := mgr.AddHealthzCheck("healthz", healthz.Ping); err != nil {
		setupLog.Error(err, "unable to set up health check")
		os.Exit(1)
	}
	if err := mgr.AddReadyzCheck("readyz", healthz.Ping); err != nil {
		setupLog.Error(err, "unable to set up ready check")
		os.Exit(1)
	}

	setupLog.Info("starting manager")
	if err := mgr.Start(ctrl.SetupSignalHandler()); err != nil {
		setupLog.Error(err, "problem running manager")
		os.Exit(1)
	}
}
