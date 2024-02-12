package ops

import (
	"context"
	"errors"
	"io"
	"log"
	"math/rand"
	"os"
	"reflect"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	probe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/handler"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"sigs.k8s.io/yaml"
)

var (
	mongodbMockOperator        = new(dbMocks.MongoOperator)
	infraOperator              = dbChaosInfra.NewInfrastructureOperator(mongodbMockOperator)
	chaosExperimentOperator    = dbChaosExperiment.NewChaosExperimentOperator(mongodbMockOperator)
	chaosExperimentRunOperator = dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodbMockOperator)
	probeService               = probe.NewProbeService()
)

var chaosExperimentRunTestService = NewChaosExperimentService(chaosExperimentOperator, infraOperator, chaosExperimentRunOperator, probeService)

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(io.Discard)
	os.Exit(m.Run())
}

func loadYAMLData(path string) (string, error) {
	YAMLData, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	jsonData, err := yaml.YAMLToJSON(YAMLData)
	if err != nil {
		return "", err
	}
	return string(jsonData), nil
}

func TestNewChaosExperimentService(t *testing.T) {
	type args struct {
		chaosWorkflowOperator      *dbChaosExperiment.Operator
		clusterOperator            *dbChaosInfra.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		probeService               probe.Service
	}
	tests := []struct {
		name string
		args args
		want Service
	}{
		{
			name: "NewChaosExperimentService",
			args: args{
				chaosWorkflowOperator:      chaosExperimentOperator,
				clusterOperator:            infraOperator,
				chaosExperimentRunOperator: chaosExperimentRunOperator,
				probeService:               probeService,
			},
			want: &chaosExperimentService{
				chaosExperimentOperator:     chaosExperimentOperator,
				chaosInfrastructureOperator: infraOperator,
				chaosExperimentRunOperator:  chaosExperimentRunOperator,
				probeService:                probeService,
			},
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if got := NewChaosExperimentService(tc.args.chaosWorkflowOperator, tc.args.clusterOperator, tc.args.chaosExperimentRunOperator, tc.args.probeService); !reflect.DeepEqual(got, tc.want) {
				t.Errorf("NewChaosExperimentService() = %v, want %v", got, tc.want)
			}
		})
	}
}

func Test_chaosExperimentService_ProcessExperiment(t *testing.T) {
	projectID := uuid.NewString()
	revID := uuid.NewString()

	commonPath := "../model/mocks/"
	yamlTypeMap := map[string]string{
		"workflow":       commonPath + "workflow.yaml",
		"cron_workflow":  commonPath + "cron_workflow.yaml",
		"chaos_engine":   commonPath + "chaos_engine.yaml",
		"chaos_schedule": commonPath + "chaos_schedule.yaml",
		"wrong_type":     commonPath + "wrong_type.yaml",
	}
	experimentID := uuid.NewString()
	infraID := uuid.NewString()
	projectID = uuid.NewString()

	tests := []struct {
		experiment *model.ChaosExperimentRequest
		name       string
		given      func(experiment *model.ChaosExperimentRequest)
		wantErr    bool
	}{
		{
			name: "success: Process Experiment (type-workflow)",
			experiment: &model.ChaosExperimentRequest{
				ExperimentID:   &experimentID,
				InfraID:        infraID,
				ExperimentName: "test-podtato-head-1682669740",
			},
			given: func(experiment *model.ChaosExperimentRequest) {
				findResult := bson.D{
					{Key: "infra_id", Value: infraID},
					{Key: "project_id", Value: projectID},
					{Key: "is_active", Value: true},
					{Key: "is_registered", Value: true},
				}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()

				yaml, err := loadYAMLData(yamlTypeMap["workflow"])
				if (err != nil) != false {
					t.Errorf("chaosExperimentService.ProcessExperiment() error = %v, wantErr %v", err, false)
					return
				}
				experiment.ExperimentManifest = yaml
			},
		},
		{
			name: "success: Process Experiment (type-cron_workflow)",
			experiment: &model.ChaosExperimentRequest{
				ExperimentID:   &experimentID,
				InfraID:        infraID,
				ExperimentName: "test-podtato-head-1682669740",
			},
			given: func(experiment *model.ChaosExperimentRequest) {
				findResult := bson.D{
					{Key: "infra_id", Value: infraID},
					{Key: "project_id", Value: projectID},
					{Key: "is_active", Value: true},
					{Key: "is_registered", Value: true},
				}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()

				yaml, err := loadYAMLData(yamlTypeMap["cron_workflow"])
				if (err != nil) != false {
					t.Errorf("chaosExperimentService.ProcessExperiment() error = %v, wantErr %v", err, false)
					return
				}
				experiment.ExperimentManifest = yaml
			},
		},
		{
			name: "success: Process Experiment (type-chaos_engine)",
			experiment: &model.ChaosExperimentRequest{
				ExperimentID:   &experimentID,
				InfraID:        infraID,
				ExperimentName: "nginx-chaos",
			},
			given: func(experiment *model.ChaosExperimentRequest) {
				findResult := bson.D{
					{Key: "infra_id", Value: infraID},
					{Key: "project_id", Value: projectID},
					{Key: "is_active", Value: true},
					{Key: "is_registered", Value: true},
				}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()

				yaml, err := loadYAMLData(yamlTypeMap["chaos_engine"])
				if (err != nil) != false {
					t.Errorf("chaosExperimentService.ProcessExperiment() error = %v, wantErr %v", err, false)
					return
				}
				experiment.ExperimentManifest = yaml
			},
		},
		{
			name: "success: Process Experiment (type-chaos_schedule)",
			experiment: &model.ChaosExperimentRequest{
				ExperimentID:   &experimentID,
				InfraID:        infraID,
				ExperimentName: "schedule-nginx",
			},
			given: func(experiment *model.ChaosExperimentRequest) {
				findResult := bson.D{
					{Key: "infra_id", Value: infraID},
					{Key: "project_id", Value: projectID},
					{Key: "is_active", Value: true},
					{Key: "is_registered", Value: true},
				}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()

				yaml, err := loadYAMLData(yamlTypeMap["chaos_schedule"])
				if (err != nil) != false {
					t.Errorf("chaosExperimentService.ProcessExperiment() error = %v, wantErr %v", err, false)
					return
				}
				experiment.ExperimentManifest = yaml
			},
		},
		{
			name: "failure: Process Experiment (type-random(incorrect))",
			experiment: &model.ChaosExperimentRequest{
				ExperimentID:   &experimentID,
				InfraID:        infraID,
				ExperimentName: "schedule-nginx",
			},
			given: func(experiment *model.ChaosExperimentRequest) {
				findResult := bson.D{
					{Key: "infra_id", Value: infraID},
					{Key: "project_id", Value: projectID},
					{Key: "is_active", Value: true},
					{Key: "is_registered", Value: true},
				}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()

				yaml, err := loadYAMLData(yamlTypeMap["wrong_type"])
				if (err != nil) != false {
					t.Errorf("chaosExperimentService.ProcessExperiment() error = %v, wantErr %v", err, false)
					return
				}
				experiment.ExperimentManifest = yaml
			},
			wantErr: true,
		},
		{
			name: "failure: incorrect experiment name",
			experiment: &model.ChaosExperimentRequest{
				ExperimentID:   &experimentID,
				InfraID:        infraID,
				ExperimentName: "some_random_name",
			},
			given: func(experiment *model.ChaosExperimentRequest) {
				findResult := bson.D{
					{Key: "infra_id", Value: infraID},
					{Key: "project_id", Value: projectID},
					{Key: "is_active", Value: true},
					{Key: "is_registered", Value: true},
				}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()

				yaml, err := loadYAMLData(yamlTypeMap["workflow"])
				if (err != nil) != false {
					t.Errorf("chaosExperimentService.ProcessExperiment() error = %v, wantErr %v", err, false)
					return
				}
				experiment.ExperimentManifest = yaml
			},
			wantErr: true,
		},
		{
			name: "failure: unable to unmarshal experiment manifest",
			experiment: &model.ChaosExperimentRequest{
				ExperimentID:   &experimentID,
				InfraID:        infraID,
				ExperimentName: "some_name",
			},
			given: func(experiment *model.ChaosExperimentRequest) {
				findResult := bson.D{
					{Key: "infra_id", Value: infraID},
					{Key: "project_id", Value: projectID},
					{Key: "is_active", Value: true},
					{Key: "is_registered", Value: true},
				}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()

				yaml := "{\"kind\": \"SomeKubernetesKind\", \"apiVersion\": \"v1\", \"metadata\": {\"name\": \"some-name\"}"
				experiment.ExperimentManifest = yaml
			},
			wantErr: true,
		},
		{
			name: "failure: inactive infra",
			experiment: &model.ChaosExperimentRequest{
				ExperimentID:   &experimentID,
				InfraID:        infraID,
				ExperimentName: "test-podtato-head-1682669740",
			},
			given: func(_ *model.ChaosExperimentRequest) {
				findResult := bson.D{
					{Key: "infra_id", Value: infraID},
					{Key: "project_id", Value: projectID},
				}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: incorrect project ID",
			experiment: &model.ChaosExperimentRequest{
				ExperimentID:   &experimentID,
				InfraID:        infraID,
				ExperimentName: "test-podtato-head-1682669740",
			},
			given: func(_ *model.ChaosExperimentRequest) {
				findResult := bson.D{
					{Key: "infra_id", Value: infraID},
					{Key: "project_id", Value: uuid.NewString()},
					{Key: "is_active", Value: true},
				}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: mongo returns empty result",
			experiment: &model.ChaosExperimentRequest{
				ExperimentID:   &experimentID,
				InfraID:        infraID,
				ExperimentName: "test-podtato-head-1682669740",
			},
			given: func(_ *model.ChaosExperimentRequest) {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(singleResult, errors.New("nil single result returned")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tc.given(tc.experiment)
			_, _, err := chaosExperimentRunTestService.ProcessExperiment(context.Background(), tc.experiment, projectID, revID)
			if (err != nil) != tc.wantErr {
				t.Errorf("chaosExperimentService.ProcessExperiment() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
		})
	}
}

func Test_chaosExperimentService_ProcessExperimentCreation(t *testing.T) {
	type args struct {
		input *model.ChaosExperimentRequest
	}
	ctx := context.Background()
	store := store.NewStore()
	experimentID := uuid.NewString()
	projectID := uuid.NewString()
	revisionID := uuid.NewString()
	infraID := uuid.NewString()
	username := "test"
	wfType := dbChaosExperiment.NonCronExperiment

	tests := []struct {
		name    string
		args    args
		given   func()
		wantErr bool
	}{
		{
			name: "success: Process Experiment Creation",
			args: args{
				input: &model.ChaosExperimentRequest{
					ExperimentID: &experimentID,
					InfraID:      infraID,
				},
			},
			given: func() {
				mongodbMockOperator.On("Create", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(nil)
			},
		},
		{
			name: "success: Process Experiment Creation with weights",
			args: args{
				input: &model.ChaosExperimentRequest{
					ExperimentID: &experimentID,
					InfraID:      infraID,
					Weightages: []*model.WeightagesInput{
						{
							Weightage: rand.Int(),
						},
					},
				},
			},
			given: func() {
				mongodbMockOperator.On("Create", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(nil)
			},
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tc.given()
			if err := chaosExperimentRunTestService.ProcessExperimentCreation(ctx, tc.args.input, username, projectID, &wfType, revisionID, store); (err != nil) != tc.wantErr {
				t.Errorf("chaosExperimentService.ProcessExperimentCreation() error = %v, wantErr %v", err, tc.wantErr)
			}
		})
	}
}

func Test_chaosExperimentService_ProcessExperimentUpdate(t *testing.T) {
	type args struct {
		workflow       *model.ChaosExperimentRequest
		updateRevision bool
	}
	username := "test"
	wfType := dbChaosExperiment.NonCronExperiment
	revisionID := uuid.NewString()
	infraID := uuid.NewString()
	projectID := uuid.NewString()
	store := store.NewStore()
	tests := []struct {
		name    string
		args    args
		given   func()
		wantErr bool
	}{
		{
			name: "success: Process Experiment Update",
			args: args{
				workflow: &model.ChaosExperimentRequest{
					Weightages: []*model.WeightagesInput{
						{
							FaultName: "pod-delete",
						},
					},
					InfraID:            infraID,
					ExperimentManifest: "{\"kind\": \"SomeKubernetesKind\", \"apiVersion\": \"v1\", \"metadata\": {\"name\": \"some-name\"}}",
				},
				updateRevision: true,
			},
			given: func() {
				updateResult := &mongo.UpdateResult{
					MatchedCount: 1,
				}
				mongodbMockOperator.On("Update", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything, mock.Anything).Return(updateResult, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: incorrect experiment manifest",
			args: args{
				workflow: &model.ChaosExperimentRequest{
					Weightages: []*model.WeightagesInput{
						{
							FaultName: "pod-delete",
						},
					},
					InfraID:            infraID,
					ExperimentManifest: "{\"test\": \"name\"}",
				},
				updateRevision: true,
			},
			given: func() {
				updateResult := &mongo.UpdateResult{
					MatchedCount: 1,
				}
				mongodbMockOperator.On("Update", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything, mock.Anything).Return(updateResult, nil).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: failed to update experiment",
			args: args{
				workflow: &model.ChaosExperimentRequest{
					Weightages: []*model.WeightagesInput{
						{
							FaultName: "pod-delete",
						},
					},
					InfraID:            infraID,
					ExperimentManifest: "{\"kind\": \"SomeKubernetesKind\", \"apiVersion\": \"v1\", \"metadata\": {\"name\": \"some-name\"}}",
				},
				updateRevision: true,
			},
			given: func() {
				updateResult := &mongo.UpdateResult{
					MatchedCount: 1,
				}
				mongodbMockOperator.On("Update", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything, mock.Anything).Return(updateResult, errors.New("error while updating")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tc.given()
			if err := chaosExperimentRunTestService.ProcessExperimentUpdate(tc.args.workflow, username, &wfType, revisionID, tc.args.updateRevision, projectID, store); (err != nil) != tc.wantErr {
				t.Errorf("chaosExperimentService.ProcessExperimentUpdate() error = %v, wantErr %v", err, tc.wantErr)
			}
		})
	}
}
