package gitops

import (
	"context"
	"errors"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

var (
	gitOpsCollection  *mongo.Collection
	backgroundContext = context.Background()
)

const timeout = 15 * time.Second

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
	err := mongodb.Operator.Create(ctx, mongodb.GitOpsCollection, config)
	if err != nil {
		return err
	}
	return nil
}

// GetGitConfig retrieves git config using project id
func GetGitConfig(ctx context.Context, projectID string) (*GitConfigDB, error) {
	query := bson.D{{"project_id", projectID}}
	var res GitConfigDB
	result, err := mongodb.Operator.Get(ctx,mongodb.GitOpsCollection, query)
	err =result.Decode(&res)
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
	results, err := mongodb.Operator.List(ctx,mongodb.GitOpsCollection, query)
	if err != nil {
		return nil, err
	}
	var configs []GitConfigDB
	err = results.All(ctx, &configs)
	if err != nil {
		return nil, err
	}
	return configs, nil
}

// ReplaceGitConfig updates git config matching the query
func ReplaceGitConfig(ctx context.Context, query bson.D, update *GitConfigDB) error {
	updateResult, err := mongodb.Operator.Replace(ctx,mongodb.GitOpsCollection, query, update)
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
	updateResult, err := mongodb.Operator.Update(ctx,mongodb.GitOpsCollection, query, update)
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
	query := bson.D{{"project_id", projectID}}
	_, err := mongodb.Operator.Delete(ctx,mongodb.GitOpsCollection, query)

	if err != nil {
		return err
	}
	return nil
}
