package chaoshub

import (
	"context"
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbSchemaChaosHub "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_hub"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func TestListChaosHubs_SearchesLiterally(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	var pipeline mongo.Pipeline
	mockOp.On("Aggregate", mock.Anything, mongodb.ChaosHubCollection, mock.Anything, mock.Anything).
		Run(func(args mock.Arguments) {
			pipeline = args.Get(2).(mongo.Pipeline)
		}).Return((*mongo.Cursor)(nil), errors.New("stop after the pipeline is built")).Once()

	service := NewService(dbSchemaChaosHub.NewChaosHubOperator(mockOp))
	name, description := "my hub (prod", "faults for c++ apps"
	_, err := service.ListChaosHubs(context.Background(), "project-1", &model.ListChaosHubRequest{
		Filter: &model.ChaosHubFilterInput{ChaosHubName: &name, Description: &description},
	})

	assert.Error(t, err)
	assert.Contains(t, pipeline, bson.D{{"$match", bson.D{{"name", bson.M{"$regex": `my hub \(prod`, "$options": "i"}}}}})
	assert.Contains(t, pipeline, bson.D{{"$match", bson.D{{"description", bson.M{"$regex": `faults for c\+\+ apps`, "$options": "i"}}}}})
}
