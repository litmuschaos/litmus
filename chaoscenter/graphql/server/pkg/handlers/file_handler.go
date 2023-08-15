package handlers

import (
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
			utils.WriteHeaders(&c.Writer, 500)
			c.Writer.Write([]byte(err.Error()))
		}

		infra, err := dbChaosInfra.NewInfrastructureOperator(mongodbOperator).GetInfra(infraId)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, 500)
			c.Writer.Write([]byte(err.Error()))
		}
		response, err := chaos_infrastructure.GetK8sInfraYaml(infra)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, 500)
			c.Writer.Write([]byte(err.Error()))
		}

		utils.WriteHeaders(&c.Writer, 200)
		c.Writer.Write(response)
	}
}
