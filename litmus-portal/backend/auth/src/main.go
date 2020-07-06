package main

import (
	"flag"
	"fmt"
	"net/http"
	"runtime"

	"github.com/dgrijalva/jwt-go"
	log "github.com/golang/glog"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/generates"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/manage"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/providers/github"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/server"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/types"
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

	manager := manage.NewManager()

	userStoreCfg := store.NewConfig(types.DefaultDBServerURL, types.DefaultAuthDB)

	manager.MustUserStorage(store.NewUserStore(userStoreCfg, store.NewDefaultUserConfig()))

	manager.MapAccessGenerate(generates.NewJWTAccessGenerate([]byte(types.DefaultAPISecret), jwt.SigningMethodHS512))

	srv := server.NewServer(server.NewConfig(), manager)

	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			if r.Form == nil {
				if err := r.ParseForm(); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}

			err := srv.HandleAuthenticateRequest(w, r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
			}
			return
		}
	})

	http.HandleFunc("/login/github", github.Middleware)
	http.HandleFunc("/oauth/github", github.GitHub)

	http.HandleFunc("/update", func(w http.ResponseWriter, r *http.Request) {

		if r.Method == "POST" {
			if r.Form == nil {
				if err := r.ParseForm(); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}
			err := srv.UpdateRequest(w, r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
			}
			return
		}
	})

	http.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) {

		if r.Method == "POST" {
			if r.Form == nil {
				if err := r.ParseForm(); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}
			err := srv.SignupRequest(w, r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
			}
			return
		}
	})

	log.Fatal(http.ListenAndServe(Port, nil))
}
