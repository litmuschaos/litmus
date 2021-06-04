package user

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"litmus/litmus-portal/authentication/pkg/entities"
)

type Repository interface {
	LoginUser(user *entities.User) (*entities.User, error)
	UpdatePassword(username string, currentPassword string, oldPassword string) error
	ResetPassword(username string, password string) error
	CreateUser(user *entities.User) (*entities.User, error)
	UpdateUser(user *entities.User) (*entities.User, error)
	GetUsers() (*[]entities.User, error)
}

type repository struct {
	Collection *mongo.Collection
}

func (r repository) LoginUser(user *entities.User) (*entities.User, error) {
	panic("Need to implement")
}

func (r repository) UpdatePassword(username string, currentPassword string, oldPassword string) error {
	panic("Need to implement")
}

func (r repository) ResetPassword(username string, password string) error {
	panic("Need to implement")
}

func (r repository) CreateUser(user *entities.User) (*entities.User, error) {
	user.ID = primitive.NewObjectID()
	_, err := r.Collection.InsertOne(context.Background(), user)
	if err != nil{
		return nil, err
	}
	return user.SanitizedUser(), nil
}

func (r repository) UpdateUser(user *entities.User) (*entities.User, error) {
	_, err := r.Collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, bson.M{"$set": user})
	if err != nil {
		return nil, err
	}
	return user.SanitizedUser(), nil
}

func (r repository) GetUsers() (*[]entities.User, error) {
	var Users []entities.User
	cursor, err := r.Collection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	for cursor.Next(context.TODO()) {
		var user entities.User
		_ = cursor.Decode(&user)
		Users = append(Users, *user.SanitizedUser())
	}
	return &Users, nil
}


func NewRepo(collection *mongo.Collection) Repository {
	return &repository{
		Collection: collection,
	}
}
