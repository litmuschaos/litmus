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
		chaosInfraOperator := chaos_infrastructure.NewChaosInfrastructureOperator(mongodbOperator)
		infraId, err := chaosInfraOperator.InfraValidateJWT(token)
		if err != nil {
			logrus.Error("Error validating JWT: ", err)
			utils.WriteHeaders(&c.Writer, 500)
			c.Writer.Write([]byte(err.Error()))
		}

		infra, err := dbChaosInfra.NewInfrastructureOperator(mongodbOperator).GetInfra(infraId)
		if err != nil {
			logrus.Error("Error fetching infra details: ", err)
			utils.WriteHeaders(&c.Writer, 500)
			c.Writer.Write([]byte(err.Error()))
		}

		reqHeader, ok := c.Value("request-header").(http.Header)
		if !ok {
			logrus.Error("Unable to parse Referer header")
			utils.WriteHeaders(&c.Writer, 500)
			c.Writer.Write([]byte("Unable to parse Referer header"))
		}

		referrer := reqHeader.Get("Referer")
		if referrer == "" {
			logrus.Error("Referer header is empty")
			utils.WriteHeaders(&c.Writer, 500)
			c.Writer.Write([]byte("Referer header is empty"))
		}

		referrerURL, err := url.Parse(referrer)
		if err != nil {
			logrus.Error("Error parsing Referer URL: ", err)
			utils.WriteHeaders(&c.Writer, 500)
			c.Writer.Write([]byte(err.Error()))
		}

		response, err := chaos_infrastructure.GetK8sInfraYaml(fmt.Sprintf("%s://%s", referrerURL.Scheme, referrerURL.Host), infra)
		if err != nil {
			logrus.Error("Error generating Kubernetes infra YAML: ", err)
			utils.WriteHeaders(&c.Writer, 500)
			c.Writer.Write([]byte(err.Error()))
		}

		utils.WriteHeaders(&c.Writer, 200)
		c.Writer.Write(response)
	}
}
