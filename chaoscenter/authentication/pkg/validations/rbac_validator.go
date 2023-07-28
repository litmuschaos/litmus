package validations

import (
	"errors"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
)

func RbacValidator(uid string, projectID string,
	requiredRoles []string, invitation string,
	service services.ApplicationService) error {

	user, err := service.GetUser(uid)
	if err != nil {
		log.Errorf("authgRPC Error: querying for user -  %s", err)
		return err
	}
	if user.DeactivatedAt != nil {
		log.Error("authgRPC Error: Deactivated User")
		return errors.New("auth gRPC - Deactivated User")
	}

	// Check for project permission validity
	filter := bson.D{
		{"_id", projectID},
		{"members", bson.D{
			{"$elemMatch", bson.D{
				{"user_id", uid},
				{"role", bson.D{
					{"$in", requiredRoles},
				}},
				{"invitation", invitation},
			}},
		}},
	}

	// Check for permission over projects
	project, err := service.GetProjects(filter)
	if err != nil {
		log.Errorf("authgRPC Error: %s", err)
		return err
	}
	if project == nil {
		return errors.New("auth gRPC - Unauthorized")
	}

	return nil
}
