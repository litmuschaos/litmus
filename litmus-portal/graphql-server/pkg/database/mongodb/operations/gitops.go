package operations

import (
	"context"
	"errors"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
)

var (
	gitOpsCollection *mongo.Collection
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

//AddGitConfig inserts new git config for project
func AddGitConfig(ctx context.Context, config *dbSchema.GitConfigDB) error {
	ctx, cancel := context.WithTimeout(backgroundContext, timeout)
	defer cancel()
	_, err := gitOpsCollection.InsertOne(ctx, config)
	if err != nil {
		return err
	}
	return nil
}

//GetGitConfig retrieves git config using project id
func GetGitConfig(ctx context.Context, projectID string) (*dbSchema.GitConfigDB, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, timeout)
	defer cancel()
	query := bson.M{"project_id": projectID}
	var res dbSchema.GitConfigDB
	err := gitOpsCollection.FindOne(ctx, query).Decode(&res)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &res, nil
}

//GetAllGitConfig retrieves all git configs from db
func GetAllGitConfig(ctx context.Context) ([]dbSchema.GitConfigDB, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, timeout)
	defer cancel()
	query := bson.D{{}}
	cursor, err := gitOpsCollection.Find(ctx, query)
	if err != nil {
		return nil, err
	}
	var configs []dbSchema.GitConfigDB
	err = cursor.All(ctx, &configs)
	if err != nil {
		return nil, err
	}
	return configs, nil
}

//UpdateGitConfig update git config matching the query
func UpdateGitConfig(ctx context.Context, query bson.D, update bson.D) error {
	ctx, cancel := context.WithTimeout(backgroundContext, timeout)
	defer cancel()
	updateResult, err := gitOpsCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("No matching git config found")
	}

	return nil
}

//DeleteGitConfig removes git config corresponding to the given project id
func DeleteGitConfig(ctx context.Context, projectID string) error {
	ctx, cancel := context.WithTimeout(backgroundContext, timeout)
	defer cancel()
	_, err := gitOpsCollection.DeleteOne(ctx, bson.M{"project_id": projectID})

	if err != nil {
		return err
	}
	return nil
}
