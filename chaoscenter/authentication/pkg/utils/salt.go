package utils

import (
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

func UpdateUserSalt(service services.ApplicationService, userID string) (string, error) {
	// generate salt and add/update to user collection
	// pass the salt in the below func which will act as jwt secret
	salt, err := RandomString(6)
	if err != nil {
		log.Error(err)
		return "", err
	}

	newHashedSalt, err := bcrypt.GenerateFromPassword([]byte(salt), PasswordEncryptionCost)
	if err != nil {
		log.Error(err)
		return "", err
	}

	err = service.UpdateUserByQuery(bson.D{
		{"user_id", userID},
	}, bson.D{
		{"$set", bson.D{
			{"salt", string(newHashedSalt)},
		}},
	})
	if err != nil {
		log.Error(err)
		return "", err
	}

	return salt, nil
}
