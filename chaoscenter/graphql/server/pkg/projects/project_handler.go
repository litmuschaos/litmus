package projects

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/image_registry"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/project"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/grpc"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	grpc2 "google.golang.org/grpc"
)

// ProjectInitializer creates a default hub and default image registry for a new project
func ProjectInitializer(ctx context.Context, project project.Project, role string, operator mongodb.MongoOperator) error {

	var bl_true = true
	currentTime := time.Now().UnixMilli()

	imageRegistry := image_registry.ImageRegistry{
		ImageRegistryID:   uuid.New().String(),
		ProjectID:         project.ID,
		ImageRegistryName: "docker.io",
		ImageRepoName:     "litmuschaos",
		ImageRegistryType: "public",
		SecretName:        nil,
		SecretNamespace:   nil,
		EnableRegistry:    &bl_true,
		IsDefault:         true,
		Audit: mongodb.Audit{
			CreatedAt: currentTime,
			UpdatedAt: currentTime,
			CreatedBy: project.CreatedBy,
			UpdatedBy: project.UpdatedBy,
			IsRemoved: false,
		},
	}

	irOp := image_registry.NewImageRegistryOperator(operator)
	err := irOp.InsertImageRegistry(ctx, imageRegistry)
	if err != nil {
		return err
	}

	return nil
}

func ProjectEvents(projectEventChannel chan string, mongoClient *mongo.Client, mongoOp mongodb.MongoOperator) {

	pipeline := mongo.Pipeline{
		bson.D{{"$match", bson.D{{"operationType", "insert"}}}},
	}
	projectDetails, err := project.NewProjectOperator(mongoOp).WatchProjectEvents(context.Background(), pipeline, mongoClient)
	if err != nil {
		log.Error(err.Error())
	}
	var conn *grpc2.ClientConn
	client, conn := grpc.GetAuthGRPCSvcClient(conn)
	defer conn.Close()

	for projectDetails.Next(context.Background()) {
		var DbEvent project.ProjectCreationEvent
		if err := projectDetails.Decode(&DbEvent); err != nil {
			log.Error(err.Error())
		}
		if DbEvent.OperationType == "insert" {
			user, err := grpc.GetUserById(client, DbEvent.FullDocument.CreatedBy.UserID)
			if err != nil {
				log.Error(err)
			}
			err = ProjectInitializer(context.Background(), DbEvent.FullDocument, user.Role, mongoOp)
			if err != nil {
				log.Error(err)
			}
			//projectEventChannel <- DbEvent.OperationType
		}
	}

}
