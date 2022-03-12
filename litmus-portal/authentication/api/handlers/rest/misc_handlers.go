package rest

import (
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/services"
	"strconv"
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
		log.Print("here")
		var (
			db_flag  = true
			col_flag = true
		)
		//dbs, err := service.ListDataBase()
		////if !contains(dbs, "auth") {
		////	db_flag = false
		////}
		//
		//log.Print("here1")
		//
		//if err != nil {
		//	log.Error(err)
		//	c.JSON(500, ReadinessAPIStatus{"down", "unknown"})
		//	return
		//}

		cols, err := service.ListCollection()
		if !contains(cols, "project") && !contains(cols, "users") {
			col_flag = false
		}

		if err != nil {
			log.Error(err)
			c.JSON(500, ReadinessAPIStatus{"unknown", "down"})
			return
		}

		//log.Println(cols, dbs)

		c.JSON(200, ReadinessAPIStatus{strconv.FormatBool(db_flag), strconv.FormatBool(col_flag)})
	}
}
