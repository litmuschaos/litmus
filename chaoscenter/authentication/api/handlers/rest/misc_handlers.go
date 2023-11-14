package rest

import (
	"net/http"

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

// Status 		godoc
//
//	@Description	Status will request users list and return, if successful, an http code 200.
//	@Tags			MiscRouter
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.Response{}
//	@Router			/status [get]
//
// Status will request users list and return, if successful,
// an http code 200
func Status(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, err := service.GetUsers()
		if err != nil {
			log.Error(err)
			c.JSON(http.StatusInternalServerError, entities.APIStatus{Status: "down"})
			return
		}
		c.JSON(http.StatusOK, entities.APIStatus{Status: "up"})
	}
}

// Readiness 		godoc
//
//	@Description	Return list of tags.
//	@Tags			MiscRouter
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.Response{}
//	@Router			/readiness [get]
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
			c.JSON(http.StatusInternalServerError, ReadinessAPIStatus{"down", "unknown"})
			return
		}

		cols, err := service.ListCollection()
		if !contains(cols, "project") || !contains(cols, "users") {
			col_flag = "down"
		}

		if err != nil {
			log.Error(err)
			c.JSON(http.StatusInternalServerError, ReadinessAPIStatus{db_flag, "down"})
			return
		}

		c.JSON(http.StatusOK, ReadinessAPIStatus{db_flag, col_flag})
	}
}
