package session

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// RevokedTokenRepository holds the mongo database implementation of the Service
type RevokedTokenRepository interface {
	RevokeToken(token *entities.RevokedToken) error
	IsTokenRevoked(encodedToken string) bool
}

// repository is the implementation of the Repository interface
type repository struct {
	Collection *mongo.Collection
}

// RevokeToken revokes the given JWT Token
func (r repository) RevokeToken(token *entities.RevokedToken) error {
	_, err := r.Collection.InsertOne(context.TODO(), token)
	return err
}

// IsTokenRevoked checks if the given JWT Token is revoked
func (r repository) IsTokenRevoked(encodedToken string) bool {
	var result = entities.RevokedToken{}
	err := r.Collection.FindOne(context.TODO(), bson.M{
		"token": encodedToken,
	}).Decode(&result)
	if err != nil {
		return false
	}
	return true
}

// NewRevokedTokenRepo creates a new instance of this repository
func NewRevokedTokenRepo(collection *mongo.Collection) RevokedTokenRepository {
	return &repository{
		Collection: collection,
	}
}
