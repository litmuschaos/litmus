package mocks

import (
	"context"

	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoOperator struct {
	mock.Mock
}

func (m MongoOperator) Create(ctx context.Context, collectionType int, document interface{}) error {
	args := m.Called(ctx, collectionType, document)
	return args.Error(0)
}

func (m MongoOperator) CreateMany(ctx context.Context, collectionType int, documents []interface{}) error {
	args := m.Called(ctx, collectionType, documents)
	return args.Error(0)
}

func (m MongoOperator) Get(ctx context.Context, collectionType int, query bson.D) (*mongo.SingleResult, error) {
	args := m.Called(ctx, collectionType, query)
	return args.Get(0).(*mongo.SingleResult), args.Error(1)
}

func (m MongoOperator) List(ctx context.Context, collectionType int, query bson.D) (*mongo.Cursor, error) {
	args := m.Called(ctx, collectionType, query)
	return args.Get(0).(*mongo.Cursor), args.Error(1)
}

func (m MongoOperator) Update(ctx context.Context, collectionType int, query, update bson.D, opts ...*options.UpdateOptions) (*mongo.UpdateResult, error) {
	args := m.Called(ctx, collectionType, query, update, opts)
	return args.Get(0).(*mongo.UpdateResult), args.Error(1)
}

func (m MongoOperator) UpdateMany(ctx context.Context, collectionType int, query, update bson.D, opts ...*options.UpdateOptions) (*mongo.UpdateResult, error) {
	args := m.Called(ctx, collectionType, query, update, opts)
	return args.Get(0).(*mongo.UpdateResult), args.Error(1)
}

func (m MongoOperator) Replace(ctx context.Context, collectionType int, query bson.D, replacement interface{}) (*mongo.UpdateResult, error) {
	args := m.Called(ctx, collectionType, query, replacement)
	return args.Get(0).(*mongo.UpdateResult), args.Error(1)
}

func (m MongoOperator) Delete(ctx context.Context, collectionType int, query bson.D, opts ...*options.DeleteOptions) (*mongo.DeleteResult, error) {
	args := m.Called(ctx, collectionType, query, opts)
	return args.Get(0).(*mongo.DeleteResult), args.Error(1)
}

func (m MongoOperator) CountDocuments(ctx context.Context, collectionType int, query bson.D, opts ...*options.CountOptions) (int64, error) {
	args := m.Called(ctx, collectionType, query, opts)
	return args.Get(0).(int64), args.Error(1)
}

func (m MongoOperator) Aggregate(ctx context.Context, collectionType int, pipeline interface{}, opts ...*options.AggregateOptions) (*mongo.Cursor, error) {
	args := m.Called(ctx, collectionType, pipeline, opts)
	return args.Get(0).(*mongo.Cursor), args.Error(1)
}

func (m MongoOperator) ListCollection(ctx context.Context, mclient *mongo.Client) ([]string, error) {
	args := m.Called(ctx, mclient)
	return args.Get(0).([]string), args.Error(1)
}

func (m MongoOperator) ListDataBase(ctx context.Context, mclient *mongo.Client) ([]string, error) {
	args := m.Called(ctx, mclient)
	return args.Get(0).([]string), args.Error(1)
}
