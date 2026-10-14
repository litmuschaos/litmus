package handler

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
)

func TestDeleteProbe_RecordsSystemActor(t *testing.T) {
	mockOp := storedHTTPProbe(t)
	svc := newProbeServiceWithMock(mockOp)

	recordsActor := mock.MatchedBy(func(update bson.D) bool {
		set := update[0].Value.(bson.D)
		for _, field := range set {
			if field.Key == "updated_by" {
				return field.Value.(mongodb.UserDetailResponse).Username == "test-user"
			}
		}
		return false
	})
	mockOp.On("Update", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything, recordsActor, mock.Anything).
		Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()

	deleted, err := svc.DeleteProbe(actorContext(), "my-probe", "project-1")

	assert.NoError(t, err)
	assert.True(t, deleted)
	mockOp.AssertExpectations(t)
}

func TestDeleteProbe_MissingActor(t *testing.T) {
	mockOp := storedHTTPProbe(t)
	svc := newProbeServiceWithMock(mockOp)

	_, err := svc.DeleteProbe(context.Background(), "my-probe", "project-1")

	assert.EqualError(t, err, "JWT token not found")
	mockOp.AssertNotCalled(t, "Update", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}
