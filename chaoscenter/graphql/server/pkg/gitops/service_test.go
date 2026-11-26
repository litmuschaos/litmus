package gitops

import (
	"testing"

	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	chaosExperimentMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/model/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
)

// matchesDocument reports whether every field of an equality query is present
// in doc with the same value, as a MongoDB find would match it.
func matchesDocument(doc bson.M) func(bson.D) bool {
	return func(query bson.D) bool {
		for _, field := range query {
			if value, ok := doc[field.Key]; !ok || value != field.Value {
				return false
			}
		}
		return true
	}
}

func TestDeleteExperiment_FindsExperimentStoredUnderName(t *testing.T) {
	mongoOperator := new(dbMocks.MongoOperator)
	chaosExperimentService := new(chaosExperimentMocks.ChaosExperimentService)
	service := &gitOpsService{
		chaosExperimentService: chaosExperimentService,
		chaosExperimentOps:     *chaos_experiment.NewChaosExperimentOperator(mongoOperator),
	}

	// Experiments keep their name in the "name" field (ResourceDetails).
	stored := bson.M{
		"experiment_id": "experiment-1",
		"project_id":    "project-1",
		"name":          "my-exp",
		"is_removed":    false,
	}
	mongoOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.MatchedBy(matchesDocument(stored))).
		Return(mongo.NewSingleResultFromDocument(stored, nil, nil), nil).Once()
	chaosExperimentService.On("ProcessExperimentDelete", mock.MatchedBy(matchesDocument(stored)),
		mock.MatchedBy(func(e chaos_experiment.ChaosExperimentRequest) bool {
			return e.ExperimentID == "experiment-1"
		}), "git-ops", mock.Anything).Return(nil).Once()

	err := service.deleteExperiment("project-1/my-exp.yaml", GitConfig{ProjectID: "project-1"})
	if err != nil {
		t.Fatalf("deleteExperiment() error = %v", err)
	}
	mongoOperator.AssertExpectations(t)
	chaosExperimentService.AssertExpectations(t)
}
