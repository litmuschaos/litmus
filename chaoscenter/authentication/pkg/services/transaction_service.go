package services

import (
	"context"
	"strconv"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
)

type transactionService interface {
	UpdateStateTransaction(userRequest entities.UpdateUserState) error
}

func (a applicationService) UpdateStateTransaction(userRequest entities.UpdateUserState) error {
	session, err := a.db.Client().StartSession()
	if err != nil {
		return err
	}
	if err = session.StartTransaction(); err != nil {
		return err
	}
	if err = mongo.WithSession(context.TODO(), session, func(sc mongo.SessionContext) error {
		// Checking if user exists
		user, err := a.FindUserByUsername(userRequest.Username)
		if err != nil {
			log.Error(err)
			return utils.ErrUserNotFound
		}

		// Checking if updated user is admin
		if user.Role == entities.RoleAdmin {
			return utils.ErrUpdatingAdmin
		}

		var deactivateTime string

		if *userRequest.IsDeactivate {
			deactivateTime = strconv.FormatInt(time.Now().Unix(), 10)

			// Checking if user is already deactivated
			if user.DeactivatedAt != nil {
				return utils.ErrUserAlreadyDeactivated
			}
		}

		// Updating details in user collection
		err = a.UpdateUserState(userRequest.Username, *userRequest.IsDeactivate, deactivateTime)
		if err != nil {
			log.Info(err)
			return utils.ErrServerError
		}
		// Updating details in project collection
		err = a.UpdateProjectState(user.ID, deactivateTime)
		if err != nil {
			log.Info(err)
			return utils.ErrServerError
		}

		if err = session.CommitTransaction(sc); err != nil {
			return err
		}
		return nil
	}); err != nil {
		return err
	}
	session.EndSession(context.TODO())
	return nil
}
