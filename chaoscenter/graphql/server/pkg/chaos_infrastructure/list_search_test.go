package chaos_infrastructure_test

import (
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func TestListInfras_SearchesLiterally(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	var pipeline mongo.Pipeline
	mockOp.On("Aggregate", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything, mock.Anything).
		Run(func(args mock.Arguments) {
			pipeline = args.Get(2).(mongo.Pipeline)
		}).Return((*mongo.Cursor)(nil), errors.New("stop after the pipeline is built")).Once()

	service := chaos_infrastructure.NewChaosInfrastructureService(dbChaosInfra.NewInfrastructureOperator(mockOp), nil, mockOp)
	name, description := "my infra (prod", "runs c++ apps"
	_, err := service.ListInfras("project-1", &model.ListInfraRequest{
		Filter: &model.InfraFilterInput{Name: &name, Description: &description},
	})

	assert.Error(t, err)
	assert.Contains(t, pipeline, bson.D{{"$match", bson.D{{"name", bson.M{"$regex": `my infra \(prod`, "$options": "i"}}}}})
	assert.Contains(t, pipeline, bson.D{{"$match", bson.D{{"description", bson.M{"$regex": `runs c\+\+ apps`, "$options": "i"}}}}})
}
