package mocks

import (
	"context"

	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoOperator is an autogenerated mock type for the MongoOperator type
type MongoOperator struct {
	mock.Mock
}

// Create provides a mock function with given fields: ctx, collectionType, document
func (m MongoOperator) Create(ctx context.Context, collectionType int, document interface{}) error {
	args := m.Called(ctx, collectionType, document)
	return args.Error(0)
}

// CreateMany provides a mock function with given fields: ctx, collectionType, documents
func (m MongoOperator) CreateMany(ctx context.Context, collectionType int, documents []interface{}) error {
	args := m.Called(ctx, collectionType, documents)
	return args.Error(0)
}

// Get provides a mock function with given fields: ctx, collectionType, query
func (m MongoOperator) Get(ctx context.Context, collectionType int, query bson.D) (*mongo.SingleResult, error) {
	args := m.Called(ctx, collectionType, query)
	return args.Get(0).(*mongo.SingleResult), args.Error(1)
}

// List provides a mock function with given fields: ctx, collectionType, query
func (m MongoOperator) List(ctx context.Context, collectionType int, query bson.D) (*mongo.Cursor, error) {
	args := m.Called(ctx, collectionType, query)
	return args.Get(0).(*mongo.Cursor), args.Error(1)
}

// Update provides a mock function with given fields: ctx, collectionType, query, update, opts
func (m MongoOperator) Update(ctx context.Context, collectionType int, query, update bson.D, opts ...*options.UpdateOptions) (*mongo.UpdateResult, error) {
	args := m.Called(ctx, collectionType, query, update, opts)
	return args.Get(0).(*mongo.UpdateResult), args.Error(1)
}

// UpdateMany provides a mock function with given fields: ctx, collectionType, query, update, opts
func (m MongoOperator) UpdateMany(ctx context.Context, collectionType int, query, update bson.D, opts ...*options.UpdateOptions) (*mongo.UpdateResult, error) {
	args := m.Called(ctx, collectionType, query, update, opts)
	return args.Get(0).(*mongo.UpdateResult), args.Error(1)
}

// Replace provides a mock function with given fields: ctx, collectionType, query, replacement
func (m MongoOperator) Replace(ctx context.Context, collectionType int, query bson.D, replacement interface{}) (*mongo.UpdateResult, error) {
	args := m.Called(ctx, collectionType, query, replacement)
	return args.Get(0).(*mongo.UpdateResult), args.Error(1)
}

// Delete provides a mock function with given fields: ctx, collectionType, query, opts
func (m MongoOperator) Delete(ctx context.Context, collectionType int, query bson.D, opts ...*options.DeleteOptions) (*mongo.DeleteResult, error) {
	args := m.Called(ctx, collectionType, query, opts)
	return args.Get(0).(*mongo.DeleteResult), args.Error(1)
}

// CountDocuments provides a mock function with given fields: ctx, collectionType, query, opts
func (m MongoOperator) CountDocuments(ctx context.Context, collectionType int, query bson.D, opts ...*options.CountOptions) (int64, error) {
	args := m.Called(ctx, collectionType, query, opts)
	return args.Get(0).(int64), args.Error(1)
}

// Aggregate provides a mock function with given fields: ctx, collectionType, pipeline, opts
func (m MongoOperator) Aggregate(ctx context.Context, collectionType int, pipeline interface{}, opts ...*options.AggregateOptions) (*mongo.Cursor, error) {
	args := m.Called(ctx, collectionType, pipeline, opts)
	return args.Get(0).(*mongo.Cursor), args.Error(1)
}

// ListCollection provides a mock function with given fields: ctx, mclient
func (m MongoOperator) ListCollection(ctx context.Context, mclient *mongo.Client) ([]string, error) {
	args := m.Called(ctx, mclient)
	return args.Get(0).([]string), args.Error(1)
}

// ListDataBase provides a mock function with given fields: ctx, mclient
func (m MongoOperator) ListDataBase(ctx context.Context, mclient *mongo.Client) ([]string, error) {
	args := m.Called(ctx, mclient)
	return args.Get(0).([]string), args.Error(1)
}
