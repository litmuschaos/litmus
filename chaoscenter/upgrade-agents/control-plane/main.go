package main

import (
	"log"

	"github.com/kelseyhightower/envconfig"
	"github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/pkg/database"
	"github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/versions"
	logger "github.com/sirupsen/logrus"
)

type Config struct {
	Version    string `required:"true"`
	DbServer   string `required:"true" split_words:"true"`
	DbUser     string `required:"true" split_words:"true"`
	DbPassword string `required:"true" split_words:"true"`
}

func init() {
	var c Config

	err := envconfig.Process("", &c)
	if err != nil {
		log.Fatal(err)
	}
}

func main() {

	// create database connection
	var err error
	logger := logger.New()
	dbClient, err := database.Connect()
	if err != nil {
		logger.WithError(err).Fatal("failed to get db client")
	}
	// create new upgrade manager
	mg, err := versions.NewUpgradeManager(logger, dbClient)
	if err != nil {
		logger.WithError(err).Fatal("failed to create upgrade manager")
	}
	if mg != nil {
		// execute upgrade manager
		if err = mg.Run(); err != nil {
			logger.WithError(err).Fatal("failed to run upgrade manager")
		}
	}

}
