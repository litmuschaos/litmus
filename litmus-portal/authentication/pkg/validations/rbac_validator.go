package validations

import (
	"errors"
	"litmus/litmus-portal/authentication/pkg/services"

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
    {Key: "_id", Value: projectID},
    {Key: "members", Value: bson.D{
      {Key: "$elemMatch", Value: bson.D{
        {Key: "user_id", Value: uid},
        {Key: "role", Value: bson.D{
          {Key: "$in", Value: requiredRoles},
				}},
        {Key: "invitation", Value: invitation},
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
		log.Error("authgRPC Error: Unauthorised")
		return errors.New("auth gRPC - Unauthorized")
	}

	return nil
}
