package misc

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// Repository holds the mongo database implementation of the Service
type Repository interface {
	ListCollection() ([]string, error)
	ListDataBase() ([]string, error)
}

type repository struct {
	DataBase *mongo.Database
	Client   *mongo.Client
}

func (r repository) ListCollection() ([]string, error) {
	var err error
	cols, err := r.DataBase.ListCollectionNames(context.Background(), bson.D{})
	if err != nil {
		return nil, err
	}

	return cols, nil
}

func (r repository) ListDataBase() ([]string, error) {
	var err error
	dbs, err := r.Client.ListDatabaseNames(context.Background(), bson.D{})
	if err != nil {
		return nil, err
	}

	return dbs, nil
}

func NewRepo(db *mongo.Database, client *mongo.Client) Repository {
	return &repository{
		DataBase: db,
		Client:   client,
	}
}
