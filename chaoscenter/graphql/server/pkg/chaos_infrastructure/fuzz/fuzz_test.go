package test

import (
	"context"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/handler"
	chaosExperimentMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/model/mocks"
	chaosExperimentRunMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run/model/mocks"
	chaosInfraMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure/model/mocks"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbGitOpsMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops/model/mocks"
	"go.mongodb.org/mongo-driver/bson"

	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	dbOperationsEnvironment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/environments"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
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
	mongodbMockOperator = new(dbMocks.MongoOperator)
	environmentOperator = dbOperationsEnvironment.NewEnvironmentOperator(mongodbMockOperator)
)

func stringPointer(v string) *string { return &v }

func FuzzRegisterInfra(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID string
			request   model.RegisterInfraRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		ctx := context.Background()
		mockServices := NewMockServices()
		mockResponse := &model.RegisterInfraResponse{
			Token:    "test-token",
			InfraID:  "test-infra-id",
			Name:     targetStruct.request.Name,
			Manifest: "test-manifest",
		}
		mockServices.InfrastructureService.
			On("RegisterInfra", ctx, targetStruct.projectID, targetStruct.request).
			Return(mockResponse, nil)

		response, err := mockServices.InfrastructureService.RegisterInfra(ctx, targetStruct.projectID, targetStruct.request)
		if response.Name != targetStruct.request.Name {
			t.Errorf("Chaos Infrastructure Name is %s Return %s", response.Name, targetStruct.request.Name)
		}
		if err != nil {
			t.Errorf("ChaosInfrastructure.RegisterInfra() error = %v", err)
			return
		}
		if response == nil {
			t.Errorf("Returned environment is nil")
		}
	})

}

func FuzzDeleteInfra(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID string
			infraID   string
			r         store.StateData
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		ctx := context.Background()
		mockServices := NewMockServices()

		mockServices.InfrastructureService.
			On("DeleteInfra", ctx, targetStruct.projectID, targetStruct.infraID, targetStruct.r).
			Return("infra deleted successfully", nil)

		response, err := mockServices.InfrastructureService.DeleteInfra(ctx, targetStruct.projectID, targetStruct.infraID, targetStruct.r)
		if err != nil {
			t.Errorf("ChaosInfrastructure.RegisterInfra() error = %v", err)
			return
		}
		if response == "" {
			t.Errorf("Returned environment is nil")
		}

	})
}

func FuzzGetInfraTest(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID string
			infraID   string
		}{}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		ctx := context.Background()
		mockServices := NewMockServices()

		mockResponse := &model.Infra{
			InfraID:                 targetStruct.infraID,
			ProjectID:               targetStruct.projectID,
			Name:                    "TestInfraName",
			Description:             nil,
			Tags:                    []string{"tag1", "tag2"},
			EnvironmentID:           "test-env-id",
			PlatformName:            "test-platform",
			IsActive:                true,
			IsInfraConfirmed:        true,
			IsRemoved:               false,
			UpdatedAt:               "1680000000",
			CreatedAt:               "1670000000",
			Token:                   "test-token",
			InfraNamespace:          nil,
			ServiceAccount:          nil,
			InfraScope:              "test-scope",
			StartTime:               "1675000000",
			Version:                 "1.0.0",
			CreatedBy:               &model.UserDetails{Username: "test-user"},
			UpdatedBy:               &model.UserDetails{Username: "test-user"},
			NoOfExperiments:         nil,
			NoOfExperimentRuns:      nil,
			LastExperimentTimestamp: nil,
			UpdateStatus:            "UpToDate",
		}

		mockServices.InfrastructureService.
			On("GetInfra", context.Background(), targetStruct.projectID, targetStruct.infraID).
			Return(mockResponse, nil)

		infra, err := mockServices.InfrastructureService.GetInfra(ctx, targetStruct.projectID, targetStruct.infraID)
		if err != nil {
			t.Errorf("ChaosInfrastructure.GetInfra() error = %v", err)
			return
		}
		if infra.InfraID != targetStruct.infraID {
			t.Errorf("ProjectID mismatch: got %v, want %v", infra.InfraID, targetStruct.infraID)
		}
	})
}

func FuzzListInfras(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID string
			request   *model.ListInfraRequest
		}{}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()

		mockResponse := &model.ListInfraResponse{
			TotalNoOfInfras: 10,
			Infras: []*model.Infra{
				{
					InfraID:          "infra1",
					ProjectID:        targetStruct.projectID,
					Name:             "Test Infra",
					EnvironmentID:    "env1",
					Description:      stringPointer("Test description"),
					PlatformName:     "Test Platform",
					IsActive:         true,
					IsInfraConfirmed: true,
					UpdatedAt:        "1622527200",
					CreatedAt:        "1622523600",
					Token:            "test-token",
					InfraNamespace:   stringPointer("test-namespace"),
					ServiceAccount:   stringPointer("test-service-account"),
					InfraScope:       "test-scope",
					StartTime:        "1622520000",
					Version:          "v1.0",
					Tags:             []string{"tag1", "tag2"},
					IsRemoved:        false,
				},
			},
		}

		mockServices.InfrastructureService.On("ListInfras", targetStruct.projectID, targetStruct.request).
			Return(mockResponse, nil)

		response, err := mockServices.InfrastructureService.ListInfras(targetStruct.projectID, targetStruct.request)
		if err != nil {
			t.Errorf("ChaosInfrastructure.DeleteInfra() error = %v", err)
			return
		}

		if response.TotalNoOfInfras < 0 {
			t.Errorf("Invalid TotalNoOfInfras: %d", response.TotalNoOfInfras)
		}
		for _, infra := range response.Infras {
			if infra.InfraID == "" {
				t.Errorf("InfraID should not be empty")
			}
			if infra.ProjectID != targetStruct.projectID {
				t.Errorf("ProjectID mismatch: got %v, want %v", infra.ProjectID, targetStruct.projectID)
			}
		}

	})
}

func FuzzGetInfraDetails(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			InfraID   string
			projectID string
			request   *model.ListInfraRequest
		}{}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockResponse := &model.Infra{
			InfraID:                 targetStruct.InfraID,
			ProjectID:               targetStruct.projectID,
			Name:                    "TestInfraName",
			Description:             nil,
			Tags:                    []string{"tag1", "tag2"},
			EnvironmentID:           "test-env-id",
			PlatformName:            "test-platform",
			IsActive:                true,
			IsInfraConfirmed:        true,
			IsRemoved:               false,
			UpdatedAt:               "1680000000",
			CreatedAt:               "1670000000",
			Token:                   "test-token",
			InfraNamespace:          nil,
			ServiceAccount:          nil,
			InfraScope:              "test-scope",
			StartTime:               "1675000000",
			Version:                 "1.0.0",
			CreatedBy:               &model.UserDetails{Username: "test-user"},
			UpdatedBy:               &model.UserDetails{Username: "test-user"},
			NoOfExperiments:         nil,
			NoOfExperimentRuns:      nil,
			LastExperimentTimestamp: nil,
			UpdateStatus:            "UpToDate",
		}

		mockServices.InfrastructureService.
			On("GetInfra", context.Background(), targetStruct.projectID, targetStruct.InfraID).
			Return(mockResponse, nil)

		mockServices.InfrastructureService.
			On("GetInfraDetails", context.Background(), targetStruct.InfraID, targetStruct.projectID).
			Return(mockResponse, nil)

		ctx := context.Background()
		response, err := mockServices.InfrastructureService.GetInfraDetails(ctx, targetStruct.InfraID, targetStruct.projectID)
		if err != nil {
			t.Errorf("ChaosInfrastructure.DeleteInfra() error = %v", err)
			return
		}
		if response.InfraID != targetStruct.InfraID {
			t.Errorf("InfraID mismatch: got %v, want %v", response.InfraID, targetStruct.InfraID)
		}

	})
}

func FuzzGetInfraStats(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			projectID string
		}{}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockResponse := &model.GetInfraStatsResponse{
			TotalInfrastructures:             10,
			TotalActiveInfrastructure:        7,
			TotalInactiveInfrastructures:     3,
			TotalConfirmedInfrastructure:     8,
			TotalNonConfirmedInfrastructures: 2,
		}

		mockServices.InfrastructureService.
			On("GetInfraStats", context.Background(), targetStruct.projectID).
			Return(mockResponse, nil)

		ctx := context.Background()
		response, err := mockServices.InfrastructureService.GetInfraStats(ctx, targetStruct.projectID)
		if err != nil {
			t.Errorf("ChaosInfrastructure.DeleteInfra() error = %v", err)
			return
		}
		if response.TotalInfrastructures != mockResponse.TotalInfrastructures {
			t.Errorf("TotalInfrastructures mismatch: got %v, want %v", response.TotalInfrastructures, mockResponse.TotalInfrastructures)
		}
		if response.TotalActiveInfrastructure != mockResponse.TotalActiveInfrastructure {
			t.Errorf("TotalActiveInfrastructure mismatch: got %v, want %v", response.TotalActiveInfrastructure, mockResponse.TotalActiveInfrastructure)
		}
		if response.TotalInactiveInfrastructures != mockResponse.TotalInactiveInfrastructures {
			t.Errorf("TotalInactiveInfrastructures mismatch: got %v, want %v", response.TotalInactiveInfrastructures, mockResponse.TotalInactiveInfrastructures)
		}
		if response.TotalConfirmedInfrastructure != mockResponse.TotalConfirmedInfrastructure {
			t.Errorf("TotalConfirmedInfrastructure mismatch: got %v, want %v", response.TotalConfirmedInfrastructure, mockResponse.TotalConfirmedInfrastructure)
		}
		if response.TotalNonConfirmedInfrastructures != mockResponse.TotalNonConfirmedInfrastructures {
			t.Errorf("TotalNonConfirmedInfrastructures mismatch: got %v, want %v", response.TotalNonConfirmedInfrastructures, mockResponse.TotalNonConfirmedInfrastructures)
		}

	})
}

func FuzzGetVersionDetails(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		mockServices := NewMockServices()
		mockResponse := &model.InfraVersionDetails{
			LatestVersion:      "testVersion1",
			CompatibleVersions: []string{"compatibleVersion1", "compatibleVersion2"},
		}

		mockServices.InfrastructureService.On("GetVersionDetails").Return(mockResponse, nil)
		response, err := mockServices.InfrastructureService.GetVersionDetails()

		if err != nil {
			t.Errorf("infraService.GetVersionDetails() error = %v", err)
			return
		}

		if response == nil {
			t.Errorf("Expected a non-nil response")
			return
		}
		if response.LatestVersion == "" {
			t.Errorf("Expected a valid latest version")
		}

	})
}

func FuzzQueryServerVersion(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		ctx := context.Background()
		mockResponse := &model.ServerVersionResponse{
			Key:   "version",
			Value: string(data),
		}

		mockServices := NewMockServices()
		mockServices.InfrastructureService.On("GetConfig", ctx, "version").Return(mockResponse, nil)
		mockServices.InfrastructureService.On("QueryServerVersion", ctx).Return(mockResponse, nil)
		response, err := mockServices.InfrastructureService.QueryServerVersion(ctx)
		if err != nil {
			t.Errorf("QueryServerVersion() error = %v", err)
			return
		}
		if response == nil {
			t.Errorf("Expected a non-nil response")
			return
		}
		if response.Key != "version" {
			t.Errorf("Expected Key to be 'version', got %s", response.Key)
		}
		if response.Value != string(data) {
			t.Errorf("Expected Value to be %s, got %s", string(data), response.Value)
		}
	})
}

func FuzzPodLog(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			request model.PodLog
			r       store.StateData
		}{}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.InfrastructureService.
			On("PodLog", targetStruct.request, targetStruct.r).
			Return("LOGS SENT SUCCESSFULLY", nil)
		response, err := mockServices.InfrastructureService.PodLog(targetStruct.request, targetStruct.r)
		if err != nil {
			t.Errorf("ChaosInfrastructure.PodLog() error = %v", err)
			return
		}
		if response == "" {
			t.Errorf("Returned environment is nil")
		}

	})
}

func FuzzKubeObj(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			request model.KubeObjectData
			r       store.StateData
		}{}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.InfrastructureService.
			On("KubeObj", targetStruct.request, targetStruct.r).
			Return("KubeData sent successfully", nil)

		response, err := mockServices.InfrastructureService.KubeObj(targetStruct.request, targetStruct.r)
		if err != nil {
			t.Errorf("ChaosInfrastructure.KubeObj() error = %v", err)
			return
		}
		if response == "" {
			t.Errorf("Returned environment is nil")
		}
	})
}

func FuzzSendInfraEvent(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			EventType   string
			EventName   string
			Description string
			Infra       model.Infra
			R           store.StateData
		}{}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		targetStruct.R.InfraEventPublish = make(map[string][]chan *model.InfraEventResponse)
		projectID := targetStruct.Infra.ProjectID
		if projectID != "" {
			targetStruct.R.InfraEventPublish[projectID] = append(targetStruct.R.InfraEventPublish[projectID], make(chan *model.InfraEventResponse, 1))
		}

		mockServices.InfrastructureService.SendInfraEvent(targetStruct.EventType, targetStruct.EventName, targetStruct.Description, targetStruct.Infra, targetStruct.R)

		if projectID != "" {
			select {
			case event := <-targetStruct.R.InfraEventPublish[projectID][0]:
				if event == nil {
					t.Errorf("Expected non-nil event")
				}
				if event.EventType != targetStruct.EventType {
					t.Errorf("Expected EventType to be %s, got %s", targetStruct.EventType, event.EventType)
				}
				if event.EventName != targetStruct.EventName {
					t.Errorf("Expected EventName to be %s, got %s", targetStruct.EventName, event.EventName)
				}
				if event.Description != targetStruct.Description {
					t.Errorf("Expected Description to be %s, got %s", targetStruct.Description, event.Description)
				}
				if event.Infra != &targetStruct.Infra {
					t.Errorf("Expected Infra to be %+v, got %+v", targetStruct.Infra, event.Infra)
				}
			default:
				t.Errorf("Expected an event to be published")
			}
		}
	})
}
func FuzzConfirmInfraRegistration(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			request model.InfraIdentity
			r       store.StateData
		}{}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.InfrastructureService.
			On("ConfirmInfraRegistration", targetStruct.request, targetStruct.r).
			Return(&model.ConfirmInfraRegistrationResponse{
				IsInfraConfirmed: true,
				NewAccessKey:     &targetStruct.request.AccessKey,
				InfraID:          &targetStruct.request.InfraID,
			}, nil)

		response, err := mockServices.InfrastructureService.ConfirmInfraRegistration(targetStruct.request, targetStruct.r)
		if err != nil {
			t.Errorf("ChaosInfrastructure.ConfirmInfraRegistration() error = %v", err)
			return
		}
		if response == nil {
			t.Errorf("Returned environment is nil")
		}

	})
}

func FuzzVerifyInfra(f *testing.F) {

	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		request := model.InfraIdentity{}
		err := fuzzConsumer.GenerateStruct(&request)
		if err != nil {
			return
		}

		mockServices := NewMockServices()

		expectedInfra := &dbChaosInfra.ChaosInfra{
			InfraID:      request.InfraID,
			AccessKey:    request.AccessKey,
			IsRegistered: true,
			Version:      request.Version,
		}

		mockServices.InfrastructureService.
			On("VerifyInfra", request).
			Return(expectedInfra, nil)

		response, err := mockServices.InfrastructureService.VerifyInfra(request)
		if err != nil {
			t.Errorf("ChaosInfrastructure.VerifyInfra() error = %v", err)
			return
		}
		if response == nil {
			t.Errorf("Returned environment is nil")
		}

	})
}
func FuzzUpdateInfra(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			query  bson.D
			update bson.D
		}{}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.InfrastructureService.
			On("UpdateInfra", targetStruct.query, targetStruct.update).
			Return(nil)

		err = mockServices.InfrastructureService.UpdateInfra(targetStruct.query, targetStruct.update)
		if err != nil {
			t.Errorf("ChaosInfrastructure.UpdateInfra() error = %v", err)
			return
		}

	})
}
func FuzzGetDBInfra(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		var infraID string
		err := fuzzConsumer.GenerateStruct(&infraID)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		expectedInfra := dbChaosInfra.ChaosInfra{
			InfraID: infraID,
		}

		mockServices.InfrastructureService.
			On("GetDBInfra", infraID).
			Return(expectedInfra, nil)

		response, err := mockServices.InfrastructureService.GetDBInfra(infraID)
		if err != nil {
			t.Errorf("ChaosInfrastructure.GetDBInfra() error = %v", err)
			return
		}
		if response.InfraID != infraID {
			t.Errorf("InfraID mismatch: got %v, want %v", response.InfraID, infraID)
		}
	})
}
