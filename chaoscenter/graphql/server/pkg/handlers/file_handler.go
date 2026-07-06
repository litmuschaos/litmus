package handlers

import (
	"fmt"
	"html"
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

func FileHandler(mongodbOperator mongodb.MongoOperator) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := strings.TrimSuffix(c.Param("key"), ".yaml")

		infraId, err := chaos_infrastructure.InfraValidateJWT(token)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte(html.EscapeString(err.Error())))
			return
		}

		infra, err := dbChaosInfra.NewInfrastructureOperator(mongodbOperator).GetInfra(infraId)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte(html.EscapeString(err.Error())))
			return
		}

		referrer := c.GetHeader("Referer")
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
			c.Writer.Write([]byte(html.EscapeString(err.Error())))
			return
		}

		if referrerURL.Scheme != "http" && referrerURL.Scheme != "https" {
			logrus.Error("invalid referer scheme")
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte("invalid referer scheme"))
			return
		}

		if referrerURL.Host == "" {
			logrus.Error("invalid referer host")
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte("invalid referer host"))
			return
		}

		response, err := chaos_infrastructure.GetK8sInfraYaml(fmt.Sprintf("%s://%s", referrerURL.Scheme, referrerURL.Host), infra)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte(html.EscapeString(err.Error())))
			return
		}

		utils.WriteHeaders(&c.Writer, http.StatusOK)
		c.Writer.Write(response)
	}
}
