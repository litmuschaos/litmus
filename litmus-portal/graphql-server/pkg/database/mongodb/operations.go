package mongodb

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoOperator interface {
	Create(ctx context.Context, collectionType int, document interface{}) error
	Get(ctx context.Context, collectionType int, query bson.D) (*mongo.SingleResult, error)
	List(ctx context.Context, collectionType int, query bson.D) (*mongo.Cursor, error)
	Update(ctx context.Context, collectionType int, query, update bson.D,
		opts ...*options.UpdateOptions) (*mongo.UpdateResult, error)
	UpdateMany(ctx context.Context, collectionType int, query, update bson.D,
		opts ...*options.UpdateOptions) (*mongo.UpdateResult, error)
	Replace(ctx context.Context, collectionType int, query, replace bson.D) error
	CountDocuments(ctx context.Context, collectionType int, query bson.D, opts ...*options.CountOptions) (int64, error)
	GetCollection(collectionType int) (*mongo.Collection, error)
}

type MongoOperations struct{}

var (
	Operator MongoOperator = &MongoOperations{}
)

func (m *MongoOperations) Create(ctx context.Context, collectionType int, document interface{}) error {
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return err
	}
	_, err = collection.InsertOne(ctx, document)
	if err != nil {
		return err
	}
	return nil
}

func (m *MongoOperations) Get(ctx context.Context, collectionType int, query bson.D) (*mongo.SingleResult, error) {
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return nil, err
	}
	result := collection.FindOne(ctx, query)
	return result, nil
}

func (m *MongoOperations) List(ctx context.Context, collectionType int, query bson.D) (*mongo.Cursor, error) {
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return nil, err
	}
	result, err := collection.Find(ctx, query)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (m *MongoOperations) Update(ctx context.Context, collectionType int, query, update bson.D, opts ...*options.UpdateOptions) (*mongo.UpdateResult, error) {
	var result *mongo.UpdateResult
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return result, err
	}
	result, err = collection.UpdateOne(ctx, query, update, opts...)
	if err != nil {
		return result, err
	}
	return result, nil
}

func (m *MongoOperations) UpdateMany(ctx context.Context, collectionType int, query, update bson.D, opts ...*options.UpdateOptions) (*mongo.UpdateResult, error) {
	var result *mongo.UpdateResult
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return result, err
	}
	result, err = collection.UpdateMany(ctx, query, update, opts...)
	if err != nil {
		return result, err
	}
	return result, nil
}

func (m *MongoOperations) Replace(ctx context.Context, collectionType int, query, replace bson.D) error {
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return err
	}
	// If the given item is not present then insert.
	opts := options.Replace().SetUpsert(true)
	_, err = collection.ReplaceOne(ctx, query, replace, opts)
	if err != nil {
		return err
	}
	return nil
}

func (m *MongoOperations) CountDocuments(ctx context.Context, collectionType int, query bson.D, opts ...*options.CountOptions) (int64, error) {
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return 0, err
	}
	result, err := collection.CountDocuments(ctx, query, opts...)
	if err != nil {
		return 0, err
	}
	return result, nil
}

func (m *MongoOperations) GetCollection(collectionType int) (*mongo.Collection, error) {
	return GetCollectionClient.getCollection(collectionType)
}
