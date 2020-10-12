package operations

import (
	"context"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var userCollection *mongo.Collection

func init() {
	userCollection = mongodb.Database.Collection("user")
}

// InsertUser ...
func InsertUser(ctx context.Context, user *dbSchema.User) error {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := userCollection.InsertOne(ctx, user)
	if err != nil {
		log.Print("Error creating User : ", err)
		return err
	}

	return nil
}

//GetUserByUserName ...
func GetUserByUserName(ctx context.Context, username string) (*dbSchema.User, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var user *dbSchema.User = new(dbSchema.User)
	query := bson.M{"username": username}
	err := userCollection.FindOne(ctx, query).Decode(user)
	if err != nil {
		log.Print("Error getting user with username: ", username, " error: ", err)
		return nil, err
	}

	return user, err
}

//GetUsers ...
func GetUsers(ctx context.Context) ([]dbSchema.User, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{}}
	cursor, err := userCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GETTING USERS : ", err)
		return []dbSchema.User{}, err
	}
	var users []dbSchema.User
	err = cursor.All(ctx, &users)
	if err != nil {
		log.Print("Error deserializing users in the user object : ", err)
		return []dbSchema.User{}, err
	}
	return users, nil
}

//UpdateUser ...
func UpdateUser(ctx context.Context, user *dbSchema.User) error {

	filter := bson.M{"_id": user.ID}
	update := bson.M{"$set": bson.M{"name": user.Name, "email": user.Email, "company_name": user.CompanyName, "updated_at": user.UpdatedAt}}

	result, err := userCollection.UpdateOne(ctx, filter, update)
	if err != nil || result.ModifiedCount != 1 {
		log.Print("Error updating User : ", err)
		return err
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
		log.Print("Error updating User in projects : ", err)
		return err
	}

	return nil
}
