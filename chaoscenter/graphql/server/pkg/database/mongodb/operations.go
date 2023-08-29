package mongodb

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoOperator interface {
	Create(ctx context.Context, collectionType int, document interface{}) error
	CreateMany(ctx context.Context, collectionType int, documents []interface{}) error
	Get(ctx context.Context, collectionType int, query bson.D) (*mongo.SingleResult, error)
	List(ctx context.Context, collectionType int, query bson.D, opts ...*options.FindOptions) (*mongo.Cursor, error)
	Update(ctx context.Context, collectionType int, query, update bson.D,
		opts ...*options.UpdateOptions) (*mongo.UpdateResult, error)
	UpdateMany(ctx context.Context, collectionType int, query, update bson.D,
		opts ...*options.UpdateOptions) (*mongo.UpdateResult, error)
	Replace(ctx context.Context, collectionType int, query bson.D, replacement interface{}) (*mongo.UpdateResult, error)
	Delete(ctx context.Context, collectionType int, query bson.D, opts ...*options.DeleteOptions) (*mongo.DeleteResult, error)
	CountDocuments(ctx context.Context, collectionType int, query bson.D, opts ...*options.CountOptions) (int64, error)
	Aggregate(ctx context.Context, collectionType int, pipeline interface{}, opts ...*options.AggregateOptions) (*mongo.Cursor, error)
	GetCollection(collectionType int) (*mongo.Collection, error)
	ListCollection(ctx context.Context, mclient *mongo.Client) ([]string, error)
	ListDataBase(ctx context.Context, mclient *mongo.Client) ([]string, error)
	WatchEvents(ctx context.Context, client *mongo.Client, collectionType int, pipeline mongo.Pipeline, opts ...*options.ChangeStreamOptions) (*mongo.ChangeStream, error)
}

type MongoOperations struct {
	MongoClient *MongoClient
}

var (
	// Operator contains all the CRUD operations of the mongo database
	Operator MongoOperator = &MongoOperations{}
)

func NewMongoOperations(mongoClient *MongoClient) *MongoOperations {
	return &MongoOperations{
		MongoClient: mongoClient,
	}
}

// Create puts a document in the database
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

// CreateMany puts an array of documents in the database
func (m *MongoOperations) CreateMany(ctx context.Context, collectionType int, documents []interface{}) error {
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return err
	}
	_, err = collection.InsertMany(ctx, documents)
	if err != nil {
		return err
	}
	return nil
}

// Get fetches a document from the database based on a query
func (m *MongoOperations) Get(ctx context.Context, collectionType int, query bson.D) (*mongo.SingleResult, error) {
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return nil, err
	}
	result := collection.FindOne(ctx, query)
	return result, nil
}

// List fetches a list of documents from the database based on a query
func (m *MongoOperations) List(ctx context.Context, collectionType int, query bson.D, opts ...*options.FindOptions) (*mongo.Cursor, error) {
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return nil, err
	}

	result, err := collection.Find(ctx, query, opts...)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// Update updates a document in the database based on a query
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

// UpdateMany updates multiple documents in the database based on a query
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

// Replace changes a document with a new one in the database based on a query
func (m *MongoOperations) Replace(ctx context.Context, collectionType int, query bson.D, replacement interface{}) (*mongo.UpdateResult, error) {
	var result *mongo.UpdateResult
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return result, err
	}
	// If the given item is not present then insert.
	opts := options.Replace().SetUpsert(true)
	result, err = collection.ReplaceOne(ctx, query, replacement, opts)
	if err != nil {
		return result, err
	}
	return result, nil
}

// Delete removes a document from the database based on a query
func (m *MongoOperations) Delete(ctx context.Context, collectionType int, query bson.D, opts ...*options.DeleteOptions) (*mongo.DeleteResult, error) {
	var result *mongo.DeleteResult
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return result, err
	}
	result, err = collection.DeleteOne(ctx, query, opts...)
	if err != nil {
		return result, err
	}
	return result, nil
}

// CountDocuments returns the number of documents in the collection that matches a query
func (m *MongoOperations) CountDocuments(ctx context.Context, collectionType int, query bson.D, opts ...*options.CountOptions) (int64, error) {
	var result int64 = 0
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return result, err
	}

	result, err = collection.CountDocuments(ctx, query, opts...)
	if err != nil {
		return result, err
	}
	return result, nil
}

func (m *MongoOperations) Aggregate(ctx context.Context, collectionType int, pipeline interface{}, opts ...*options.AggregateOptions) (*mongo.Cursor, error) {
	collection, err := m.GetCollection(collectionType)
	if err != nil {
		return nil, err
	}

	result, err := collection.Aggregate(ctx, pipeline, opts...)
	if err != nil {
		return nil, err
	}
	return result, nil
}

// GetCollection fetches the correct collection based on the collection type
func (m *MongoOperations) GetCollection(collectionType int) (*mongo.Collection, error) {
	return GetCollectionClient.getCollection(collectionType)
}

func (m *MongoOperations) ListDataBase(ctx context.Context, mclient *mongo.Client) ([]string, error) {
	dbs, err := mclient.ListDatabaseNames(ctx, bson.D{})
	if err != nil {
		return nil, err
	}

	return dbs, nil
}

func (m *MongoOperations) ListCollection(ctx context.Context, mclient *mongo.Client) ([]string, error) {
	cols, err := mclient.Database("litmus").ListCollectionNames(ctx, bson.D{})
	if err != nil {
		return nil, err
	}

	return cols, nil
}

func (m *MongoOperations) WatchEvents(ctx context.Context, client *mongo.Client, collectionType int, pipeline mongo.Pipeline, opts ...*options.ChangeStreamOptions) (*mongo.ChangeStream, error) {

	authDb := client.Database("auth")

	events, err := authDb.Collection("project").Watch(ctx, pipeline, opts...)
	if err != nil {
		return nil, err
	}
	return events, nil
}
