package handlers

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/sirupsen/logrus"
)

// FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(mongodbOperator mongodb.MongoOperator) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var (
			vars  = mux.Vars(r)
			token = vars["key"]
		)

		response, statusCode, err := cluster.NewService(mongodbOperator).GetManifest(token)
		if err != nil {
			logrus.WithError(err).Error("error while generating manifest file")
			utils.WriteHeaders(&w, statusCode)
			w.Write([]byte(err.Error()))
		}

		utils.WriteHeaders(&w, statusCode)
		w.Write(response)
	})
}
