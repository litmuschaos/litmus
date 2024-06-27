package response

import (
	authConfig2 "github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/authConfig"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func AddSalt(service services.ApplicationService) error {
	// generate salt and add/update to user collection
	// pass the salt in the below func which will act as jwt secret
	getSalt, err := service.GetConfig("salt")
	if err != nil && err != mongo.ErrNoDocuments {
		log.Error(err)
		return err
	}
	if getSalt != nil {
		return nil
	}

	salt, err := utils.RandomString(6)
	if err != nil {
		log.Error(err)
		return err
	}

	newHashedSalt, err := bcrypt.GenerateFromPassword([]byte(salt), utils.PasswordEncryptionCost)
	if err != nil {
		log.Error(err)
		return err
	}
	authConfig := authConfig2.AuthConfig{
		Key:   "salt",
		Value: string(newHashedSalt),
	}

	err = service.CreateConfig(authConfig)
	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}
