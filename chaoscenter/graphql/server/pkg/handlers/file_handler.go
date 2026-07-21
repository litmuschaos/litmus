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
			c.Writer.Write([]byte("invalid infrastructure token"))
			return
		}

		infra, err := dbChaosInfra.NewInfrastructureOperator(mongodbOperator).GetInfra(infraId)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte("unable to get infrastructure"))
			return
		}

		host, err := parseReferer(c.GetHeader("Referer"))
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte("invalid referer header"))
			return
		}

		response, err := chaos_infrastructure.GetK8sInfraYaml(host, infra)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
			c.Writer.Write([]byte("unable to generate infrastructure manifest"))
			return
		}

		c.Header("Content-Type", "application/yaml; charset=utf-8")
		c.Header("Content-Disposition", `attachment; filename="litmus-infrastructure.yaml"`)
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("Access-Control-Allow-Origin", "*")
		c.Writer.WriteHeader(http.StatusOK)
		c.Writer.Write(response)
	}
}

func parseReferer(referrer string) (string, error) {
	if referrer == "" {
		return "", fmt.Errorf("unable to parse referer header")
	}

	referrerURL, err := url.ParseRequestURI(referrer)
	if err != nil {
		return "", fmt.Errorf("invalid referer header: %w", err)
	}

	if referrerURL.Scheme != "http" && referrerURL.Scheme != "https" {
		return "", fmt.Errorf("invalid referer scheme")
	}

	if referrerURL.Host == "" || referrerURL.User != nil {
		return "", fmt.Errorf("invalid referer host")
	}

	// The endpoint is embedded in the generated manifest and returned to the
	// caller. Escape the user-provided authority before it reaches the response.
	return fmt.Sprintf("%s://%s", referrerURL.Scheme, html.EscapeString(referrerURL.Host)), nil
}
