package chaoshub

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/google/uuid"
	dbSchemaChaosHub "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_hub"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// writeFault writes a chart with the given number of faults where the hub sync puts it
func writeFault(t *testing.T, hubPath, chart string, faults int) {
	t.Helper()
	dir := filepath.Join(hubPath, "faults", chart)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	manifest := "apiVersion: litmuchaos.io/v1alpha1\nkind: ChartServiceVersion\nmetadata:\n  name: " + chart + "\nspec:\n  faults:\n"
	for i := 0; i < faults; i++ {
		manifest += "    - name: fault-" + uuid.NewString() + "\n"
	}
	if err := os.WriteFile(filepath.Join(dir, chart+".chartserviceversion.yaml"), []byte(manifest), 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestGetChaosHub_CountsFaults(t *testing.T) {
	projectID := uuid.NewString()
	hubID := uuid.NewString()
	hubName := "hub-" + uuid.NewString()
	hubPath := DefaultPath + projectID + "/" + hubName
	t.Cleanup(func() { os.RemoveAll(DefaultPath + projectID) })

	writeFault(t, hubPath, "kubernetes", 2)
	writeFault(t, hubPath, "aws", 1)

	mongoOperator := new(dbMocks.MongoOperator)
	hub := bson.D{
		{Key: "hub_id", Value: hubID},
		{Key: "project_id", Value: projectID},
		{Key: "name", Value: hubName},
	}
	mongoOperator.On("Get", mock.Anything, mock.Anything, mock.Anything).
		Return(mongo.NewSingleResultFromDocument(hub, nil, nil), nil)

	service := NewService(dbSchemaChaosHub.NewChaosHubOperator(mongoOperator))
	status, err := service.GetChaosHub(context.Background(), hubID, projectID)

	assert.NoError(t, err)
	assert.Equal(t, "3", status.TotalFaults)
}
