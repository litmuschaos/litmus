package handlers

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"github.com/sirupsen/logrus"
)

// FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(mongodbOperator mongodb.MongoOperator) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := strings.TrimSuffix(c.Param("key"), ".yaml")

		infraId, err := chaos_infrastructure.InfraValidateJWT(token)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte(err.Error()))
			return
		}

		infra, err := dbChaosInfra.NewInfrastructureOperator(mongodbOperator).GetInfra(infraId)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte(err.Error()))
			return
		}

		referrer := c.Request.Header.Get("Referer")
		if referrer == "" {
			logrus.Error("unable to parse referer header")
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte("unable to parse referer header"))
			return
		}

		referrerURL, err := url.Parse(referrer)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte(err.Error()))
			return
		}

		response, err := chaos_infrastructure.GetK8sInfraYaml(fmt.Sprintf("%s://%s", referrerURL.Scheme, referrerURL.Host), infra)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte(err.Error()))
			return
		}

		utils.WriteHeaders(&c.Writer, http.StatusOK)
		c.Writer.Write(response)
	}
}
