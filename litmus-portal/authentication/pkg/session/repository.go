// Package session contains the mongo database implementation of the session service
package session

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"litmus/litmus-portal/authentication/pkg/entities"
)

// Repository holds the mongo database implementation of the Service
type Repository interface {
	RevokeToken(token *entities.RevokedToken) error
	IsTokenRevoked(encodedToken string) bool
}

// repository is the implementation of the Repository interface
type repository struct {
	Collection *mongo.Collection
}

// RevokeToken revokes the given JWT Token
func (r repository) RevokeToken(token *entities.RevokedToken) error {
	_, err := r.Collection.InsertOne(context.Background(), token)
	return err
}

// IsTokenRevoked checks if the given JWT Token is revoked
func (r repository) IsTokenRevoked(encodedToken string) bool {
	var result = entities.RevokedToken{}
	err := r.Collection.FindOne(context.Background(), bson.M{
		"token": encodedToken,
	}).Decode(&result)
	if err != nil {
		return false
	}
	return true
}

// NewRepo creates a new instance of this repository
func NewRepo(collection *mongo.Collection) Repository {
	return &repository{
		Collection: collection,
	}
}
