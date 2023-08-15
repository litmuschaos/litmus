package projects

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/image_registry"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/project"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/grpc"
	image_registry2 "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/image_registry"
	self_deployer "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/self-deployer"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	grpc2 "google.golang.org/grpc"
)

// ProjectInitializer creates a default hub and default image registry for a new project
func ProjectInitializer(ctx context.Context, projectID string, role string, operator mongodb.MongoOperator) error {

	var bl_true = true

	self_deployer.StartDeployer(projectID, operator)

	irOp := image_registry.NewImageRegistryOperator(operator)
	irService := image_registry2.NewImageRegistryService(irOp)
	_, err := irService.CreateImageRegistry(ctx, projectID, model.ImageRegistryInput{
		IsDefault:         bl_true,
		ImageRegistryName: "docker.io",
		ImageRepoName:     "litmuschaos",
		ImageRegistryType: "public",
		SecretName:        nil,
		SecretNamespace:   nil,
		EnableRegistry:    &bl_true,
	})
	if err != nil {
		return err
	}

	return nil
}

func ProjectEvents(projectEventChannel chan string, mongoClient *mongo.Client, mongoOp mongodb.MongoOperator) error {
	routineCtx, cancelFn := context.WithCancel(context.Background())
	_ = cancelFn
	pipeline := mongo.Pipeline{
		bson.D{{"$match", bson.D{{"operationType", "insert"}}}},
	}

	projectDetails, err := project.NewProjectOperator(mongoOp).WatchProjectEvents(routineCtx, pipeline, mongoClient)
	if err != nil {
		return err
	}
	var conn *grpc2.ClientConn
	client, conn := grpc.GetAuthGRPCSvcClient(conn)
	defer conn.Close()

	for projectDetails.Next(routineCtx) {
		var DbEvent project.ProjectCreationEvent
		if err := projectDetails.Decode(&DbEvent); err != nil {
			return err
		}
		if DbEvent.OperationType == "insert" {
			user, err := grpc.GetUserById(client, DbEvent.FullDocument.CreatedBy)
			if err != nil {
				logrus.Error(err)
			}
			err = ProjectInitializer(routineCtx, DbEvent.FullDocument.ID, user.Role, mongoOp)
			if err != nil {
				logrus.Error(err)
			}
			//projectEventChannel <- DbEvent.OperationType
		}
	}
	return nil
}
