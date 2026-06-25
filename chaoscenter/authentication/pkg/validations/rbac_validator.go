package validations

import (
	"errors"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
)

func RbacValidator(uid string, projectID string,
	requiredRoles []string, invitation string,
	service services.ApplicationService, groups ...[]string) error {
	sanitizedProjectID, err := utils.SanitizeMongoParam(projectID)
	if err != nil {
		log.Errorf("authgRPC Error (project sanitization): %s", err)
		return errors.New("auth gRPC - Unauthorized")
	}

	user, err := service.GetUser(uid)
	if err != nil {
		log.Errorf("authgRPC Error: querying for user -  %s", err)
		return err
	}
	if user.DeactivatedAt != nil {
		log.Error("authgRPC Error: Deactivated User")
		return errors.New("auth gRPC - Deactivated User")
	}

	// Check for individual member permission
	filter := bson.D{
		{"_id", sanitizedProjectID},
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
		log.Errorf("authgRPC Error: %s", err)
		return err
	}
	if len(project) == 0 {
		return errors.New("auth gRPC - Unauthorized")
	}

	// Individual check failed — try group-based authorization
	var userGroups []string
	if len(groups) > 0 && len(groups[0]) > 0 {
		userGroups = groups[0]
	} else {
		userGroups = user.OIDCGroups
	}

	if len(userGroups) > 0 {
		sanitizedGroups, sanitizeErr := utils.SanitizeMongoSlice(userGroups)
		if sanitizeErr != nil {
			log.Errorf("authgRPC Error (group sanitization): %s", sanitizeErr)
			return errors.New("auth gRPC - Unauthorized")
		}

		groupFilter := bson.D{
			{"_id", sanitizedProjectID},
			{"groups", bson.D{
				{"$elemMatch", bson.D{
					{"group", bson.D{
						{"$in", sanitizedGroups},
					}},
					{"role", bson.D{
						{"$in", requiredRoles},
					}},
				}},
			}},
		}

		groupProject, err := service.GetProjects(groupFilter)
		if err != nil {
			log.Errorf("authgRPC Error (group check): %s", err)
			return err
		}
		if len(groupProject) > 0 {
			return nil
		}
	}

	return errors.New("auth gRPC - Unauthorized")
}
