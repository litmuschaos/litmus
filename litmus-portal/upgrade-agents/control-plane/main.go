package main

import (
	"log"
	"os"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/upgrader-agents/control-plane/pkg/database"
	"github.com/litmuschaos/litmus/litmus-portal/upgrader-agents/control-plane/versions"
	"go.uber.org/zap"
)

func main() {
	// logging level, dev mode enables debug logs
	dev := os.Getenv("DEV_MODE")
	var logger *zap.Logger
	var err error

	// set log level
	if strings.ToLower(dev) == "true" {
		logger, err = zap.NewDevelopment()
	} else {
		logger, err = zap.NewProduction()
	}
	if err != nil {
		log.Fatal("failed to create logger")
	}

	// create database connection
	dbClient, err := database.Connect()
	if err != nil {
		logger.Fatal("failed to get db client", zap.Error(err))
	}
	// create new upgrade manager
	mg, err := versions.NewUpgradeManager(logger, dbClient)
	if err != nil {
		logger.Fatal("failed to create upgrade manager", zap.Error(err))
	}

	// execute upgrade manager
	if err = mg.Run(); err != nil {
		logger.Fatal("failed to run upgrade manager", zap.Error(err))
	}
}
