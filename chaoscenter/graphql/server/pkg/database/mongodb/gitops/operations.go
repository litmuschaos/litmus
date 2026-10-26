package gitops

import (
	"context"
	"errors"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// Operator is the struct for gitOps operator
type Operator struct {
	operator mongodb.MongoOperator
}

// NewGitOpsOperator returns a new instance of gitOps operator
func NewGitOpsOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

// AddGitConfig inserts new git config for project
func (g *Operator) AddGitConfig(ctx context.Context, config *GitConfigDB) error {
	err := g.operator.Create(ctx, mongodb.GitOpsCollection, config)
	if err != nil {
		return err
	}
	return nil
}

// GetGitConfig retrieves git config using project id
func (g *Operator) GetGitConfig(ctx context.Context, projectID string) (*GitConfigDB, error) {
	query := bson.D{{"project_id", projectID}}
	var res GitConfigDB
	result, err := g.operator.Get(ctx, mongodb.GitOpsCollection, query)
	err = result.Decode(&res)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &res, nil
}

// GetAllGitConfig retrieves all git configs from db
func (g *Operator) GetAllGitConfig(ctx context.Context) ([]GitConfigDB, error) {
	query := bson.D{{}}
	results, err := g.operator.List(ctx, mongodb.GitOpsCollection, query)
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
func (g *Operator) ReplaceGitConfig(ctx context.Context, query bson.D, update *GitConfigDB) error {
	updateResult, err := g.operator.Replace(ctx, mongodb.GitOpsCollection, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("No matching git config found")
	}

	return nil
}

// UpdateGitConfig update git config matching the query
func (g *Operator) UpdateGitConfig(ctx context.Context, query bson.D, update bson.D) error {
	updateResult, err := g.operator.Update(ctx, mongodb.GitOpsCollection, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("No matching git config found")
	}

	return nil
}

// DeleteGitConfig removes git config corresponding to the given project id
func (g *Operator) DeleteGitConfig(ctx context.Context, projectID string) error {
	query := bson.D{{"project_id", projectID}}
	_, err := g.operator.Delete(ctx, mongodb.GitOpsCollection, query)

	if err != nil {
		return err
	}
	return nil
}
