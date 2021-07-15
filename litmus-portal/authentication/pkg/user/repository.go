package user

import (
	"context"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/utils"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

//Repository holds the mongo database implementation of the Service
type Repository interface {
	FindUser(username string) (*entities.User, error)
	CheckPasswordHash(hash, password string) error
	UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error
	CreateUser(user *entities.User) (*entities.User, error)
	UpdateUser(user *entities.User) (*entities.User, error)
	IsAdministrator(user *entities.User) error
	GetUsers() (*[]entities.User, error)
	UpdateUserState(username string, isDeactivate bool) error
}

type repository struct {
	Collection *mongo.Collection
}

// FindUser finds and returns a user if it exists
func (r repository) FindUser(username string) (*entities.User, error) {
	var result = entities.User{}
	findOneErr := r.Collection.FindOne(context.TODO(), bson.M{
		"username": username,
	}).Decode(&result)

	if findOneErr != nil {
		return nil, findOneErr
	}
	return &result, nil
}

// CheckPasswordHash checks password hash and password from user input
func (r repository) CheckPasswordHash(hash, password string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))

	if err != nil {
		return utils.ErrWrongPassword
	}

	return nil
}

// UpdatePassword helps to update the password of the user, it acts as a resetPassword when isAdminBeingReset is set to true
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

	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(userPassword.NewPassword), utils.PasswordEncryptionCost)
	_, err = r.Collection.UpdateOne(context.Background(), bson.M{"_id": result.ID}, bson.M{"$set": bson.M{
		"password": string(newHashedPassword),
	}})
	if err != nil {
		return err
	}

	return nil
}

// CreateUser creates a new user in the database
func (r repository) CreateUser(user *entities.User) (*entities.User, error) {
	_, err := r.Collection.InsertOne(context.Background(), user)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return nil, utils.ErrUserExists
		}
		return nil, err
	}
	return user.SanitizedUser(), nil
}

// UpdateUser updates user details in the database
func (r repository) UpdateUser(user *entities.User) (*entities.User, error) {
	if user.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), utils.PasswordEncryptionCost)
		if err != nil {
			return nil, err
		}
		user.Password = string(hashedPassword)
	}
	data, _ := toDoc(user)
	_, err := r.Collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, bson.M{"$set": data})
	if err != nil {
		return nil, err
	}

	return user.SanitizedUser(), nil
}

// GetUsers fetches all the users from the database
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

// IsAdministrator verifies if the passed user is an administrator
func (r repository) IsAdministrator(user *entities.User) error {
	var result = entities.User{}
	findOneErr := r.Collection.FindOne(context.TODO(), bson.M{
		"_id":      user.ID,
		"username": user.UserName,
	}).Decode(&result)
	if findOneErr != nil {
		return findOneErr
	}
	if result.Role != entities.RoleAdmin {
		return utils.ErrInvalidCredentials
	}
	return nil
}

// UpdateUserState updates the deactivated_at state of the user
func (r repository) UpdateUserState(username string, isDeactivate bool) error {
	var err error
	if isDeactivate {
		_, err = r.Collection.UpdateOne(context.Background(), bson.M{"username": username}, bson.M{"$set": bson.M{
			"deactivated_at": strconv.FormatInt(time.Now().Unix(), 10),
		}})
	} else {
		_, err = r.Collection.UpdateOne(context.Background(), bson.M{"username": username}, bson.M{"$set": bson.M{
			"deactivated_at": nil,
		}})
	}

	if err != nil {
		return err
	}

	return nil
}

// NewRepo creates a new instance of this repository
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
