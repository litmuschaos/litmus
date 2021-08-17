package mongodb

import (
	"errors"

	"go.mongodb.org/mongo-driver/mongo"
)

type GetCollectionInterface interface {
	getCollection(collectionType int) (*mongo.Collection, error)
}

type GetCollectionStruct struct{}

var (
	GetCollectionClient GetCollectionInterface = &GetCollectionStruct{}
)

// getCollection function returns the appropriate DB collection based on the collection value passed
func (g *GetCollectionStruct) getCollection(collectionType int) (*mongo.Collection, error) {
	mongoClient := Client
	switch collectionType {
	case ClusterCollection:
		return mongoClient.(*MongoClient).ClusterCollection, nil
	case UserCollection:
		return mongoClient.(*MongoClient).UserCollection, nil
	case ProjectCollection:
		return mongoClient.(*MongoClient).ProjectCollection, nil
	case WorkflowCollection:
		return mongoClient.(*MongoClient).WorkflowCollection, nil
	case WorkflowTemplateCollection:
		return mongoClient.(*MongoClient).WorkflowTemplateCollection, nil
	case GitOpsCollection:
		return mongoClient.(*MongoClient).GitOpsCollection, nil
	case MyHubCollection:
		return mongoClient.(*MongoClient).MyHubCollection, nil
	case DataSourceCollection:
		return mongoClient.(*MongoClient).DataSourceCollection, nil
	case PanelCollection:
		return mongoClient.(*MongoClient).PanelCollection, nil
	case DashboardCollection:
		return mongoClient.(*MongoClient).DashboardCollection, nil
	case ImageRegistryCollection:
		return mongoClient.(*MongoClient).ImageRegistryCollection, nil
	case ServerConfigCollection:
		return mongoClient.(*MongoClient).ServerConfigCollection, nil
	default:
		return nil, errors.New("unknown collection name")
	}
}
