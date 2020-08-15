package main

import (
	"flag"
	"fmt"
	"runtime"

	log "github.com/golang/glog"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/router"
)

// Constant to define the port number
const (
	Port = ":3000"
)

func printVersion() {
	log.Info(fmt.Sprintf("Go Version: %s", runtime.Version()))
	log.Info(fmt.Sprintf("Go OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH))
}

func main() {
	// send logs to stderr so we can use 'kubectl logs'
	_ = flag.Set("logtostderr", "true")
	_ = flag.Set("v", "3")

	flag.Parse()
	// Version Info
	printVersion()

	route := router.New()
	log.Fatal(route.Run(Port))
}
