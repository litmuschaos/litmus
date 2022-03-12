package misc

import (
	"context"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

// Function to list database
func ListDataBase(ctx context.Context) ([]string, error) {
	dbs, err := mongodb.Operator.ListDataBase(ctx)
	if err != nil {
		log.Print("Error to list database: ", err)
		return nil, err
	}

	return dbs, err
}

// Function to list collection
func ListCollection(ctx context.Context) ([]string, error) {
	cols, err := mongodb.Operator.ListCollection(ctx)
	if err != nil {
		log.Print("Error to list database: ", err)
		return nil, err
	}

	return cols, nil
}
