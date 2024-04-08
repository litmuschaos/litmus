package fuzz_tests

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/golang-jwt/jwt"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/handler"
	chaosExperimentMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/model/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/ops"
	chaosExperimentRunMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run/model/mocks"
	chaosInfraMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure/model/mocks"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbGitOpsMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops/model/mocks"
	probe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/handler"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/mongo"
)

type MockServices struct {
	ChaosExperimentService     *chaosExperimentMocks.ChaosExperimentService
	ChaosExperimentRunService  *chaosExperimentRunMocks.ChaosExperimentRunService
	InfrastructureService      *chaosInfraMocks.InfraService
	GitOpsService              *dbGitOpsMocks.GitOpsService
	ChaosExperimentOperator    *dbChaosExperiment.Operator
	ChaosExperimentRunOperator *dbChaosExperimentRun.Operator
	MongodbOperator            *dbMocks.MongoOperator
	ChaosExperimentHandler     *handler.ChaosExperimentHandler
}

func NewMockServices() *MockServices {
	var (
		mongodbMockOperator        = new(dbMocks.MongoOperator)
		infrastructureService      = new(chaosInfraMocks.InfraService)
		chaosExperimentRunService  = new(chaosExperimentRunMocks.ChaosExperimentRunService)
		gitOpsService              = new(dbGitOpsMocks.GitOpsService)
		chaosExperimentOperator    = dbChaosExperiment.NewChaosExperimentOperator(mongodbMockOperator)
		chaosExperimentRunOperator = dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodbMockOperator)
		chaosExperimentService     = new(chaosExperimentMocks.ChaosExperimentService)
	)
	var chaosExperimentHandler = handler.NewChaosExperimentHandler(chaosExperimentService, chaosExperimentRunService, infrastructureService, gitOpsService, chaosExperimentOperator, chaosExperimentRunOperator, mongodbMockOperator)
	return &MockServices{
		ChaosExperimentService:     chaosExperimentService,
		ChaosExperimentRunService:  chaosExperimentRunService,
		InfrastructureService:      infrastructureService,
		GitOpsService:              gitOpsService,
		ChaosExperimentOperator:    chaosExperimentOperator,
		ChaosExperimentRunOperator: chaosExperimentRunOperator,
		MongodbOperator:            mongodbMockOperator,
		ChaosExperimentHandler:     chaosExperimentHandler,
	}
}

var (
	mongodbMockOperator        = new(dbMocks.MongoOperator)
	infraOperator              = dbChaosInfra.NewInfrastructureOperator(mongodbMockOperator)
	chaosExperimentOperator    = dbChaosExperiment.NewChaosExperimentOperator(mongodbMockOperator)
	chaosExperimentRunOperator = dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodbMockOperator)
	probeService               = probe.NewProbeService()
)

var chaosExperimentRunTestService = ops.NewChaosExperimentService(chaosExperimentOperator, infraOperator, chaosExperimentRunOperator, probeService)

type KubernetesKind struct {
	Kind       string   `json:"kind"`
	ApiVersion string   `json:"apiVersion"`
	Metadata   Metadata `json:"metadata"`
}
type args struct {
	chaosWorkflowOperator      *dbChaosExperiment.Operator
	clusterOperator            *dbChaosInfra.Operator
	chaosExperimentRunOperator *dbChaosExperimentRun.Operator
	probeService               probe.Service
}

// Metadata represents the metadata of a Kubernetes manifest
type Metadata struct {
	Name string `json:"name"`
}

type chaosExperimentService struct {
	chaosExperimentOperator     *dbChaosExperiment.Operator
	chaosInfrastructureOperator *dbChaosInfra.Operator
	chaosExperimentRunOperator  *dbChaosExperimentRun.Operator
	probeService                probe.Service
}

// GenerateRandomManifest generates a random Kubernetes manifest
func GenerateRandomManifest() (string) {
	kinds := []string{"Deployment", "Pod", "Service", "ConfigMap"}
	kind := kinds[rand.Intn(len(kinds))]

	manifest := KubernetesKind{
		Kind:       kind,
		ApiVersion: "v1",
		Metadata: Metadata{
			Name: fmt.Sprintf("random-%s", kind),
		},
	}

	manifestJSON, err := json.Marshal(manifest)
	if err != nil {
		return ""
	}

	return string(manifestJSON)
}

func FuzzProcessExperimentUpdate(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
		ctx := context.Background()
		ctx = context.WithValue(ctx, authorization.AuthKey, username)
		targetStruct := &struct {
			workflow      model.ChaosExperimentRequest
			updateRevision bool
			projectID  string
			revisionID string
			infraID 	string
			weightage  int
		}{}

		targetStruct.workflow = model.ChaosExperimentRequest{
			Weightages: []*model.WeightagesInput{
				{
					FaultName: "pod-delete",
				},
			},
			InfraID:	targetStruct.infraID,
			ExperimentManifest: GenerateRandomManifest(),
		}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		store := store.NewStore()
		wfType := dbChaosExperiment.NonCronExperiment
		updateResult := &mongo.UpdateResult{
			MatchedCount: 1,
		}
		mongodbMockOperator.On("Update", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything, mock.Anything).Return(updateResult, nil).Once()
		err1 := chaosExperimentRunTestService.ProcessExperimentUpdate(&targetStruct.workflow, username, &wfType, targetStruct.revisionID, targetStruct.updateRevision, targetStruct.projectID, store)
		if err1 != nil {
			t.Errorf("error = %v", err)
			return
		}
	})
}

func FuzzProcessExperimentCreate(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		username, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{"username": "test"}).SignedString([]byte(utils.Config.JwtSecret))
		ctx := context.Background()
		ctx = context.WithValue(ctx, authorization.AuthKey, username)
		targetStruct := &struct {
			input      model.ChaosExperimentRequest
			updateRevision bool
			projectID  string
			revisionID string
			infraID 	string
			weightage  int
			experimentID string
		}{}

		targetStruct.input = model.ChaosExperimentRequest{
			ExperimentID: &targetStruct.experimentID,
			InfraID:      targetStruct.infraID,
			Weightages: []*model.WeightagesInput{
				{
					Weightage: targetStruct.weightage,
				},
			},
		}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		store := store.NewStore()
		wfType := dbChaosExperiment.NonCronExperiment
		mongodbMockOperator.On("Create", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(nil)
		err1 := chaosExperimentRunTestService.ProcessExperimentCreation(ctx, &targetStruct.input, username,  targetStruct.projectID, &wfType, targetStruct.revisionID, store)
		if err1 != nil {
			t.Errorf("error = %v", err)
			return
		}
	})
}

