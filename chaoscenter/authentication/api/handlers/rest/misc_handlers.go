package rest

import (
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

func contains(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}

	return false
}

type ReadinessAPIStatus struct {
	DataBase    string `json:"database"`
	Collections string `json:"collections"`
}

// Status will request users list and return, if successful,
// an http code 200
func Status(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, err := service.GetUsers()
		if err != nil {
			log.Error(err)
			c.JSON(500, entities.APIStatus{"down"})
			return
		}
		c.JSON(200, entities.APIStatus{"up"})
	}
}

func Readiness(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var (
			db_flag  = "up"
			col_flag = "up"
		)

		dbs, err := service.ListDataBase()
		if !contains(dbs, "auth") {
			db_flag = "down"
		}

		if err != nil {
			log.Error(err)
			c.JSON(500, ReadinessAPIStatus{"down", "unknown"})
			return
		}

		cols, err := service.ListCollection()
		if !contains(cols, "project") || !contains(cols, "users") {
			col_flag = "down"
		}

		if err != nil {
			log.Error(err)
			c.JSON(500, ReadinessAPIStatus{db_flag, "down"})
			return
		}

		c.JSON(200, ReadinessAPIStatus{db_flag, col_flag})
	}
}
