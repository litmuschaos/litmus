package response

import (
	"encoding/base64"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/authConfig"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
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

	salt, err := utils.RandomString(32)
	if err != nil {
		log.Error(err)
		return err
	}
	encodedSalt := base64.StdEncoding.EncodeToString([]byte(salt))

	config := authConfig.AuthConfig{
		Key:   "salt",
		Value: encodedSalt,
	}

	err = service.CreateConfig(config)
	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}
