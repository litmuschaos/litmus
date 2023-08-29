package mongodb

import (
	"errors"

	"go.mongodb.org/mongo-driver/mongo"
)

type GetCollectionInterface interface {
	getCollection(collectionType int) (*mongo.Collection, error)
}

type GetCollectionStruct struct{}

var GetCollectionClient GetCollectionInterface = &GetCollectionStruct{}

// getCollection function returns the appropriate DB collection based on the collection value passed
func (g *GetCollectionStruct) getCollection(collectionType int) (*mongo.Collection, error) {
	mongoClient := Client
	switch collectionType {
	case ChaosInfraCollection:
		return mongoClient.(*MongoClient).ChaosInfraCollection, nil
	case ChaosExperimentCollection:
		return mongoClient.(*MongoClient).ChaosExperimentCollection, nil
	case ChaosExperimentRunsCollection:
		return mongoClient.(*MongoClient).ChaosExperimentRunsCollection, nil
	case ChaosHubCollection:
		return mongoClient.(*MongoClient).ChaosHubCollection, nil
	case ImageRegistryCollection:
		return mongoClient.(*MongoClient).ImageRegistryCollection, nil
	case ServerConfigCollection:
		return mongoClient.(*MongoClient).ServerConfigCollection, nil
	case UserCollection:
		return mongoClient.(*MongoClient).UserCollection, nil
	case ProjectCollection:
		return mongoClient.(*MongoClient).ProjectCollection, nil
	case GitOpsCollection:
		return mongoClient.(*MongoClient).GitOpsCollection, nil
	case EnvironmentCollection:
		return mongoClient.(*MongoClient).EnvironmentCollection, nil
	case ChaosProbeCollection:
		return mongoClient.(*MongoClient).ChaosProbeCollection, nil
	default:
		return nil, errors.New("unknown collection name")
	}
}
