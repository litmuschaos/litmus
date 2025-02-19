package rest

import (
	"net/http"

	response "github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers"
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

// Status 		godoc
//
//	@Description	Status will request users list and return, if successful, a http code 200.
//	@Tags			MiscRouter
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.APIStatus{}
//	@Router			/status [get]
//
// Status will request users list and return, if successful, a http code 200
func Status(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, err := service.GetUsers()
		if err != nil {
			log.Error(err)
			c.JSON(http.StatusInternalServerError, response.APIStatus{Status: "down"})
			return
		}
		c.JSON(http.StatusOK, response.APIStatus{Status: "up"})
	}
}

// Readiness 		godoc
//
//	@Description	Return list of tags.
//	@Tags			MiscRouter
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.ReadinessAPIStatus{}
//	@Router			/readiness [get]
//
// Readiness will return the status of the database and collections
func Readiness(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var (
			dbFlag  = "up"
			colFlag = "up"
		)

		dbs, err := service.ListDataBase()
		if !contains(dbs, "auth") {
			dbFlag = "down"
		}

		if err != nil {
			log.Error(err)
			c.JSON(http.StatusInternalServerError, response.ReadinessAPIStatus{DataBase: "down", Collections: "unknown"})
			return
		}

		cols, err := service.ListCollection()
		if !contains(cols, "project") || !contains(cols, "users") {
			colFlag = "down"
		}

		if err != nil {
			log.Error(err)
			c.JSON(http.StatusInternalServerError, response.ReadinessAPIStatus{DataBase: dbFlag, Collections: "down"})
			return
		}

		c.JSON(http.StatusOK, response.ReadinessAPIStatus{DataBase: dbFlag, Collections: colFlag})
	}
}
