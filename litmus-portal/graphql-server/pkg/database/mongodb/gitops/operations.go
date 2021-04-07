package gitops

import (
	"context"
	"errors"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

var (
	gitOpsCollection  *mongo.Collection
	backgroundContext = context.Background()
)

func init() {
	gitOpsCollection = mongodb.Database.Collection("gitops-collection")
	_, err := gitOpsCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"project_id": 1,
			},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		log.Fatal("Error Creating Index for GitOps Collection : ", err)
	}
}

// AddGitConfig inserts new git config for project
func AddGitConfig(ctx context.Context, config *GitConfigDB) error {
	_, err := gitOpsCollection.InsertOne(ctx, config)
	if err != nil {
		return err
	}
	return nil
}

// GetGitConfig retrieves git config using project id
func GetGitConfig(ctx context.Context, projectID string) (*GitConfigDB, error) {
	query := bson.M{"project_id": projectID}
	var res GitConfigDB
	err := gitOpsCollection.FindOne(ctx, query).Decode(&res)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &res, nil
}

// GetAllGitConfig retrieves all git configs from db
func GetAllGitConfig(ctx context.Context) ([]GitConfigDB, error) {
	query := bson.D{{}}
	cursor, err := gitOpsCollection.Find(ctx, query)
	if err != nil {
		return nil, err
	}
	var configs []GitConfigDB
	err = cursor.All(ctx, &configs)
	if err != nil {
		return nil, err
	}
	return configs, nil
}

// ReplaceGitConfig updates git config matching the query
func ReplaceGitConfig(ctx context.Context, query bson.D, update *GitConfigDB) error {
	updateResult, err := gitOpsCollection.ReplaceOne(ctx, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("No matching git config found")
	}

	return nil
}

// UpdateGitConfig update git config matching the query
func UpdateGitConfig(ctx context.Context, query bson.D, update bson.D) error {
	updateResult, err := gitOpsCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("No matching git config found")
	}

	return nil
}

// DeleteGitConfig removes git config corresponding to the given project id
func DeleteGitConfig(ctx context.Context, projectID string) error {
	_, err := gitOpsCollection.DeleteOne(ctx, bson.M{"project_id": projectID})

	if err != nil {
		return err
	}
	return nil
}
