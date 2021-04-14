package usermanagement

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

var (
	userCollection    *mongo.Collection
	projectCollection *mongo.Collection
)

func init() {
	userCollection = mongodb.Database.Collection("user")
	projectCollection = mongodb.Database.Collection("project")
}

// InsertUser ...
func InsertUser(ctx context.Context, user *User) error {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := userCollection.InsertOne(ctx, user)
	if err != nil {
		return errors.New("Error creating User: " + err.Error())
	}

	return nil
}

// GetUserByUserName ...
func GetUserByUserName(ctx context.Context, username string) (*User, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var user = new(User)
	query := bson.M{"username": username}
	err := userCollection.FindOne(ctx, query).Decode(user)
	if err != nil {
		return nil, errors.New("Error getting user with username: " + username + " error: " + err.Error())
	}

	return user, err
}

// GetUserByUserID :returns user details based on userID
func GetUserByUserID(ctx context.Context, userID string) (*User, error) {
	var user = new(User)
	query := bson.M{"_id": userID}
	err := userCollection.FindOne(ctx, query).Decode(user)
	if err != nil {
		return nil, errors.New("Error getting user with userID: " + userID + " error: " + err.Error())
	}

	return user, err
}

// GetUsers ...
func GetUsers(ctx context.Context) ([]User, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{}}
	cursor, err := userCollection.Find(ctx, query)
	if err != nil {
		return []User{}, errors.New("Error getting users: " + err.Error())
	}
	var users []User
	err = cursor.All(ctx, &users)
	if err != nil {
		return []User{}, errors.New("Error deserializing users in the user object : " + err.Error())
	}
	return users, nil
}

// UpdateUser ...
func UpdateUser(ctx context.Context, user *User) error {

	filter := bson.M{"_id": user.ID}
	update := bson.M{"$set": bson.M{"name": user.Name, "email": user.Email, "company_name": user.CompanyName, "updated_at": user.UpdatedAt}}

	result, err := userCollection.UpdateOne(ctx, filter, update)
	if err != nil || result.ModifiedCount != 1 {
		return errors.New("Error updating User : " + err.Error())
	}

	opts := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{
			bson.M{"elem.user_id": user.ID},
		},
	})
	filter = bson.M{}
	update = bson.M{"$set": bson.M{"members.$[elem].name": user.Name, "members.$[elem].email": user.Email, "members.$[elem].company_name": user.CompanyName}}

	_, err = projectCollection.UpdateMany(ctx, filter, update, opts)
	if err != nil {
		return errors.New("Error updating User in projects : " + err.Error())
	}

	return nil
}
