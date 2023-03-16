package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	"github.com/sirupsen/logrus"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

// FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(c *gin.Context) {
	token := strings.TrimSuffix(c.Param("key"), ".yaml")
	response, statusCode, err := cluster.GetManifest(token)
	if err != nil {
		logrus.WithError(err).Error("error while generating manifest file")
		utils.WriteHeaders(&c.Writer, statusCode)
		c.Writer.Write([]byte(err.Error()))
	}

	utils.WriteHeaders(&c.Writer, statusCode)
	c.Writer.Write(response)
}
