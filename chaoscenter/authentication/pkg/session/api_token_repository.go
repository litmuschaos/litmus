package session

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// ApiTokenRepository holds the mongo database implementation of the Service
type ApiTokenRepository interface {
	CreateApiToken(apiToken *entities.ApiToken) error
	GetApiTokensByUserID(userID string) ([]entities.ApiToken, error)
	DeleteApiToken(token string) error
}

// CreateApiToken creates a new API token
func (r repository) CreateApiToken(apiToken *entities.ApiToken) error {
	_, err := r.Collection.InsertOne(context.TODO(), apiToken)
	return err
}

// GetApiTokensByUserID returns all the API tokens for a given user
func (r repository) GetApiTokensByUserID(userID string) ([]entities.ApiToken, error) {
	var apiTokens []entities.ApiToken
	query := bson.D{
		{Key: "user_id", Value: userID},
	}
	result, err := r.Collection.Find(context.TODO(), query)
	if err != nil {
		return nil, err
	}
	if err = result.All(context.TODO(), &apiTokens); err != nil {
		return nil, err
	}
	return apiTokens, nil
}

// DeleteApiToken deletes the given API token
func (r repository) DeleteApiToken(token string) error {
	query := bson.D{
		{Key: "token", Value: token},
	}
	_, err := r.Collection.DeleteOne(context.TODO(), query)

	return err
}

// NewApiTokenRepo creates a new instance of this repository
func NewApiTokenRepo(collection *mongo.Collection) ApiTokenRepository {
	return &repository{
		Collection: collection,
	}
}
