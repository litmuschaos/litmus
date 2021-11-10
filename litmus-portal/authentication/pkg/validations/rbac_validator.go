package validations

import (
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"litmus/litmus-portal/authentication/pkg/services"
)

func RbacValidator(uid string, projectID string,
	requiredRoles []string, invitation string,
	service services.ApplicationService) error {

	// Check for user status validity
	//user, err := service.GetUser(uid)
	//if err != nil {
	//	return err
	//}

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
	project, err := service.GetProjects(filter)
	if err != nil {
		return err
	}
	if project == nil {
		return errors.New("Unauthorized")
	}

	return nil
}
