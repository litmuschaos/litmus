package user

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/utils"
)

type Repository interface {
	FindUser(user *entities.User) (*entities.User, error)
	UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error
	CreateUser(user *entities.User) (*entities.User, error)
	UpdateUser(user *entities.User) (*entities.User, error)
	IsAdministrator(user *entities.User) error
	GetUsers() (*[]entities.User, error)
}

type repository struct {
	Collection *mongo.Collection
}

func (r repository) FindUser(user *entities.User) (*entities.User, error) {
	var result = entities.User{}
	findOneErr := r.Collection.FindOne(context.TODO(), bson.M{
		"username": user.UserName,
	}).Decode(&result)
	if findOneErr != nil {
		return nil, findOneErr
	}
	err := bcrypt.CompareHashAndPassword([]byte(result.Password), []byte(user.Password))
	if err != nil {
		return nil, err
	}
	return result.SanitizedUser(), nil
}

func (r repository) UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error {
	var result = entities.User{}
	result.UserName = userPassword.Username
	findOneErr := r.Collection.FindOne(context.TODO(), bson.M{
		"username": result.UserName,
	}).Decode(&result)
	if findOneErr != nil {
		return findOneErr
	}
	if isAdminBeingReset {
		err := bcrypt.CompareHashAndPassword([]byte(result.Password), []byte(userPassword.OldPassword))
		if err != nil {
			return err
		}
	}
	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(userPassword.NewPassword), bcrypt.DefaultCost)
	_, err = r.Collection.UpdateOne(context.Background(), bson.M{"_id": result.ID}, bson.M{"$set": bson.M{
		"password": string(newHashedPassword),
	}})
	if err != nil {
		return err
	}
	return nil
}

func (r repository) CreateUser(user *entities.User) (*entities.User, error) {
	user.ID = primitive.NewObjectID()
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.Password = string(hashedPassword)
	_, err = r.Collection.InsertOne(context.Background(), user)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return nil, utils.ErrUserExists
		}
		return nil, err
	}
	return user.SanitizedUser(), nil
}

func (r repository) UpdateUser(user *entities.User) (*entities.User, error) {
	data, _ := toDoc(user)
	_, err := r.Collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, bson.M{"$set": data})
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

func (r repository) IsAdministrator(user *entities.User) error {
	var result = entities.User{}
	findOneErr := r.Collection.FindOne(context.TODO(), bson.M{
		"_id":      user.ID,
		"username": user.UserName,
	}).Decode(&result)
	if findOneErr != nil {
		return findOneErr
	}
	if result.UserName != utils.AdminName || result.Role != entities.RoleAdmin {
		return utils.ErrInvalidCredentials
	}
	return nil
}

func NewRepo(collection *mongo.Collection) Repository {
	return &repository{
		Collection: collection,
	}
}

func toDoc(v interface{}) (doc *bson.M, err error) {
	data, err := bson.Marshal(v)
	if err != nil {
		return
	}
	err = bson.Unmarshal(data, &doc)
	return
}
