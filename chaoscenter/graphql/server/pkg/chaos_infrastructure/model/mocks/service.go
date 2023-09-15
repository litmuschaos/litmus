package mocks

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
)

type InfraService struct {
	mock.Mock
}

func (s *InfraService) RegisterInfra(c context.Context, projectID string, input model.RegisterInfraRequest) (*model.RegisterInfraResponse, error) {
	args := s.Called(c, projectID, input)
	return args.Get(0).(*model.RegisterInfraResponse), args.Error(1)
}

func (s *InfraService) ConfirmInfraRegistration(request model.InfraIdentity, r store.StateData) (*model.ConfirmInfraRegistrationResponse, error) {
	args := s.Called(request, r)
	return args.Get(0).(*model.ConfirmInfraRegistrationResponse), args.Error(1)
}

func (s *InfraService) VerifyInfra(identity model.InfraIdentity) (*dbChaosInfra.ChaosInfra, error) {
	args := s.Called(identity)
	return args.Get(0).(*dbChaosInfra.ChaosInfra), args.Error(1)
}

func (s *InfraService) DeleteInfra(ctx context.Context, projectID string, infraId string, r store.StateData) (string, error) {
	args := s.Called(ctx, projectID, infraId, r)
	return args.String(0), args.Error(1)
}

func (s *InfraService) ListInfras(projectID string, request *model.ListInfraRequest) (*model.ListInfraResponse, error) {
	args := s.Called(projectID, request)
	return args.Get(0).(*model.ListInfraResponse), args.Error(1)
}

func (s *InfraService) GetInfraDetails(ctx context.Context, infraID string, projectID string) (*model.Infra, error) {
	args := s.Called(ctx, infraID, projectID)
	return args.Get(0).(*model.Infra), args.Error(1)
}

func (s *InfraService) SendInfraEvent(eventType, eventName, description string, infra model.Infra, r store.StateData) {
	s.Called(eventType, eventName, description, infra, r)
}

func (s *InfraService) GetManifest(token string) ([]byte, int, error) {
	args := s.Called(token)
	return args.Get(0).([]byte), args.Int(1), args.Error(2)
}

func (s *InfraService) GetManifestWithInfraID(infraID string, accessKey string) ([]byte, error) {
	args := s.Called(infraID, accessKey)
	return args.Get(0).([]byte), args.Error(1)
}

func (s *InfraService) GetInfra(ctx context.Context, projectID string, infraID string) (*model.Infra, error) {
	args := s.Called(ctx, projectID, infraID)
	return args.Get(0).(*model.Infra), args.Error(1)
}

func (s *InfraService) GetInfraStats(ctx context.Context, projectID string) (*model.GetInfraStatsResponse, error) {
	args := s.Called(ctx, projectID)
	return args.Get(0).(*model.GetInfraStatsResponse), args.Error(1)
}

func (s *InfraService) GetVersionDetails() (*model.InfraVersionDetails, error) {
	args := s.Called()
	return args.Get(0).(*model.InfraVersionDetails), args.Error(1)
}

func (s *InfraService) QueryServerVersion(ctx context.Context) (*model.ServerVersionResponse, error) {
	args := s.Called(ctx)
	return args.Get(0).(*model.ServerVersionResponse), args.Error(1)
}

func (s *InfraService) PodLog(request model.PodLog, r store.StateData) (string, error) {
	args := s.Called(request, r)
	return args.String(0), args.Error(1)
}

func (s *InfraService) KubeObj(request model.KubeObjectData, r store.StateData) (string, error) {
	args := s.Called(request, r)
	return args.String(0), args.Error(1)
}

func (s *InfraService) UpdateInfra(query bson.D, update bson.D) error {
	args := s.Called(query, update)
	return args.Error(0)
}

func (s *InfraService) GetDBInfra(infraID string) (dbChaosInfra.ChaosInfra, error) {
	args := s.Called(infraID)
	return args.Get(0).(dbChaosInfra.ChaosInfra), args.Error(1)
}
