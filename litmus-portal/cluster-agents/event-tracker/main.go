/*


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
	"flag"
	"log"
	"os"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/pkg/utils"
	"github.com/sirupsen/logrus"
	"k8s.io/client-go/informers"

	rt "runtime"

	"k8s.io/apimachinery/pkg/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/log/zap"

	eventtrackerv1 "github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/api/v1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/controllers"
	// +kubebuilder:scaffold:imports
)

var (
	scheme   = runtime.NewScheme()
	setupLog = ctrl.Log.WithName("setup")
)

func init() {

	logrus.Info("Go Version: ", rt.Version())
	logrus.Info("Go OS/Arch: ", rt.GOOS, "/", rt.GOARCH)

	if os.Getenv("IS_CLUSTER_CONFIRMED") == "" || os.Getenv("ACCESS_KEY") == "" || os.Getenv("CLUSTER_ID") == "" || os.Getenv("SERVER_ADDR") == "" || os.Getenv("AGENT_NAMESPACE") == "" {
		logrus.Fatal("Some environment variable are not setup")
	}

	_ = clientgoscheme.AddToScheme(scheme)

	_ = eventtrackerv1.AddToScheme(scheme)
	// +kubebuilder:scaffold:scheme

	clientset, err := k8s.K8sClient()
	if err != nil {
		log.Print(err)
	}

	var (
		agent_scope = os.Getenv("AGENT_SCOPE")
		factory     informers.SharedInformerFactory
	)

	if agent_scope == "cluster" {
		factory = informers.NewSharedInformerFactory(clientset, 30*time.Second)
	} else if agent_scope == "namespace" {
		factory = informers.NewSharedInformerFactoryWithOptions(clientset, 30*time.Second, informers.WithNamespace(os.Getenv("AGENT_NAMESPACE")))
	}

	go utils.RunDeploymentInformer(factory)
	go utils.RunDSInformer(factory)
	go utils.RunStsInformer(factory)
}

func main() {

	var metricsAddr string
	var enableLeaderElection bool
	flag.StringVar(&metricsAddr, "metrics-addr", ":8080", "The address the metric endpoint binds to.")
	flag.BoolVar(&enableLeaderElection, "enable-leader-election", false,
		"Enable leader election for controller manager. "+
			"Enabling this will ensure there is only one active controller manager.")
	flag.Parse()

	ctrl.SetLogger(zap.New(zap.UseDevMode(true)))

	var (
		agent_scope = os.Getenv("AGENT_SCOPE")
		mgr         manager.Manager
		err         error
	)

	if agent_scope == "namespace" {
		mgr, err = ctrl.NewManager(ctrl.GetConfigOrDie(), ctrl.Options{
			Scheme:             scheme,
			MetricsBindAddress: metricsAddr,
			Port:               9443,
			Namespace:          os.Getenv("AGENT_NAMESPACE"),
			LeaderElection:     enableLeaderElection,
			LeaderElectionID:   "2b79cec3.litmuschaos.io",
		})
	} else if agent_scope == "cluster" {
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
		Log:    ctrl.Log.WithName("controllers").WithName("EventTrackerPolicy"),
		Scheme: mgr.GetScheme(),
	}).SetupWithManager(mgr); err != nil {
		setupLog.Error(err, "unable to create controller", "controller", "EventTrackerPolicy")
		os.Exit(1)
	}
	// +kubebuilder:scaffold:builder

	setupLog.Info("starting manager")
	if err := mgr.Start(ctrl.SetupSignalHandler()); err != nil {
		setupLog.Error(err, "problem running manager")
		os.Exit(1)
	}
}
