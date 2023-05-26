package projects

import (
	"context"
	"fmt"
	"github.com/harness/hce-saas/graphql/server/pkg/database/mongodb/project"
	"github.com/harness/hce-saas/graphql/server/pkg/grpc"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	grpc2 "google.golang.org/grpc"
)

// InitializeProject implements project.ProjectServer
//func (s *ProjectServer) InitializeProject(ctx context.Context, req *pb.ProjectInitializationRequest) (*wrapperspb.BoolValue, error) {
//	res := &wrapperspb.BoolValue{Value: false}
//
//	// Check request
//	if req == nil {
//		return res, fmt.Errorf("request must not be nil")
//	}
//
//	if req.ProjectID == "" {
//		return res, fmt.Errorf("empty field in the request")
//	}
//
//	// ProjectInitializer initializes the project by creating instances for required stateful services
//	err := ProjectInitializer(ctx, req.ProjectID, req.Role, s.Operator)
//	if err != nil {
//		return res, fmt.Errorf("failed to initialize project, %w", err)
//	} else {
//		return &wrapperspb.BoolValue{Value: true}, nil
//	}
//}

// ProjectInitializer creates a default hub and default image registry for a new project
func ProjectInitializer(ctx context.Context, projectID string, role string /*, operator mongodb.MongoOperator*/) error {

	var (
	//selfCluster = utils.Config.SelfAgent
	//bl_true     = true
	)

	//defaultHub := model.CreateChaosHubRequest{
	//	ProjectID:  projectID,
	//	HubName:    "Litmus ChaosHub",
	//	RepoURL:    "https://github.com/litmuschaos/chaos-charts",
	//	RepoBranch: utils.Config.HubBranchName,
	//}

	//log.Print("Cloning https://github.com/litmuschaos/chaos-charts")

	//TODO: Remove goroutine after adding hub optimisations
	//go chaoshub.NewService(operator).AddChaosHub(context.Background(), defaultHub)

	//_, err := imageRegistryOps.CreateImageRegistry(ctx, projectID, model.ImageRegistryInput{
	//	IsDefault:         bl_true,
	//	ImageRegistryName: "docker.io",
	//	ImageRepoName:     "litmuschaos",
	//	ImageRegistryType: "public",
	//	SecretName:        nil,
	//	SecretNamespace:   nil,
	//	EnableRegistry:    &bl_true,
	//})

	//if strings.ToLower(selfCluster) == "true" && strings.ToLower(role) == "admin" {
	//	logrus.Infof("Starting self deployer")
	//	go self_deployer.StartDeployer(projectID)
	//}
	//
	//return err
	return nil
}

func ProjectEvents(projectEventChannel chan string, mongoClient *mongo.Client) error {
	routineCtx, cancelFn := context.WithCancel(context.Background())
	_ = cancelFn
	//routineCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	//defer cancel()
	pipeline := mongo.Pipeline{
		bson.D{{"$match", bson.D{{"operationType", "insert"}}}},
	}
	projectDetails, err := project.WatchProjectEvents(routineCtx, pipeline, mongoClient)
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
		//fmt.Println("eventt1", DbEvent.FullDocument.Name, DbEvent.OperationType)
		if DbEvent.OperationType == "insert" {
			fmt.Println("insert event", DbEvent.FullDocument.Name)

			user, err := grpc.GetUserById(client, DbEvent.FullDocument.CreatedBy)
			if err != nil {
				logrus.Error(err)
				//return err
			}
			fmt.Println("user role: ", user.Username)
			err = ProjectInitializer(routineCtx, DbEvent.FullDocument.ID, user.Role)
			if err != nil {
				logrus.Error(err)
			}

			//projectEventChannel <- DbEvent.OperationType
		}
	}
	return nil
}
