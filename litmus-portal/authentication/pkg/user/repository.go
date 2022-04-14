package user

import (
	"context"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/utils"

	"github.com/google/uuid"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

//Repository holds the mongo database implementation of the Service
type Repository interface {
	LoginUser(user *entities.User) (*entities.User, error)
	GetUser(uid string) (*entities.User, error)
	GetUsers() (*[]entities.User, error)
	FindUsersByUID(uid []string) (*[]entities.User, error)
	FindUserByUsername(username string) (*entities.User, error)
	CheckPasswordHash(hash, password string) error
	UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error
	CreateUser(user *entities.User) (*entities.User, error)
	UpdateUser(user *entities.UserDetails) error
	IsAdministrator(user *entities.User) error
	UpdateUserState(username string, isDeactivate bool, deactivateTime string) error
}

type repository struct {
	Collection *mongo.Collection
	DataBase   *mongo.Database
	Client     *mongo.Client
}

// LoginUser helps to Login the user via OAuth, if user does not exists, creates a new user
func (r repository) LoginUser(user *entities.User) (*entities.User, error) {
	user.ID = uuid.Must(uuid.NewRandom()).String()
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), utils.PasswordEncryptionCost)
	if err != nil {
		return nil, err
	}
	user.Password = string(hashedPassword)
	_, err = r.Collection.InsertOne(context.Background(), user)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			var result = entities.User{}
			findOneErr := r.Collection.FindOne(context.TODO(), bson.M{
				"username": user.UserName,
			}).Decode(&result)
			if findOneErr != nil {
				return nil, findOneErr
			}
			return &result, nil
		}
		return nil, err
	}
	return user.SanitizedUser(), nil
}

// GetUser fetches the user from database that matches the passed uid
func (r repository) GetUser(uid string) (*entities.User, error) {
	var result = entities.User{}
	findOneErr := r.Collection.FindOne(context.TODO(), bson.M{
		"_id": uid,
	}).Decode(&result)

	if findOneErr != nil {
		return nil, findOneErr
	}
	return &(*result.SanitizedUser()), nil
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

// FindUsersByUID fetches the user from database that matches the passed uids
func (r repository) FindUsersByUID(uid []string) (*[]entities.User, error) {
	cursor, err := r.Collection.Find(context.Background(),
		bson.D{
			{"_id", bson.D{
				{"$in", uid},
			}},
		})

	if err != nil {
		return nil, err
	}

	var Users = []entities.User{}
	for cursor.Next(context.TODO()) {
		var user entities.User
		_ = cursor.Decode(&user)
		Users = append(Users, *user.SanitizedUser())
	}

	return &Users, nil
}

// FindUser finds and returns a user if it exists
func (r repository) FindUserByUsername(username string) (*entities.User, error) {
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
func (r repository) UpdateUser(user *entities.UserDetails) error {
	data, _ := toDoc(user)
	_, err := r.Collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, bson.M{"$set": data})
	if err != nil {
		return err
	}

	return nil
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
func (r repository) UpdateUserState(username string, isDeactivate bool, deactivateTime string) error {
	var err error
	if isDeactivate {
		_, err = r.Collection.UpdateOne(context.Background(), bson.M{"username": username}, bson.M{"$set": bson.M{
			"deactivated_at": deactivateTime,
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
