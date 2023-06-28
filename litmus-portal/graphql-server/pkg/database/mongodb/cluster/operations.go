package cluster

import (
	"context"
	"fmt"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	backgroundContext = context.Background()
)

// Operator is the model for cluster collection
type Operator struct {
	operator mongodb.MongoOperator
}

// NewClusterOperator returns a new instance of Operator
func NewClusterOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

// InsertCluster takes details of a cluster and inserts into the database collection
func (c *Operator) InsertCluster(cluster Cluster) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	err := c.operator.Create(ctx, mongodb.ClusterCollection, cluster)
	if err != nil {
		return err
	}

	return nil
}

// GetCluster takes a clusterID to retrieve the cluster details from the database
func (c *Operator) GetCluster(clusterID string) (Cluster, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{"cluster_id", clusterID}}

	var cluster Cluster
	result, err := c.operator.Get(ctx, mongodb.ClusterCollection, query)
	if err != nil {
		return Cluster{}, fmt.Errorf("error in getting cluster data: %v", err)
	}

	err = result.Decode(&cluster)
	if err != nil {
		return Cluster{}, fmt.Errorf("error in decoding cluster data: %v", err)
	}

	return cluster, nil
}

// GetAgentDetails takes a agentName and projectID to retrieve the cluster details from the database
func (c *Operator) GetAgentDetails(ctx context.Context, clusterID string, projectID string) (Cluster, error) {
	query := bson.D{
		{"project_id", projectID},
		{"cluster_id", clusterID},
	}

	var cluster Cluster
	result, err := c.operator.Get(ctx, mongodb.ClusterCollection, query)
	if err != nil {
		return Cluster{}, fmt.Errorf("error in getting cluster data: %v", err)
	}

	err = result.Decode(&cluster)
	if err != nil {
		return Cluster{}, fmt.Errorf("error in decoding cluster data: %v", err)
	}

	return cluster, nil
}

// UpdateCluster takes query and update parameters to update the cluster details in the database
func (c *Operator) UpdateCluster(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := c.operator.Update(ctx, mongodb.ClusterCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// GetClusterWithProjectID takes projectID and clusterType parameters to retrieve the cluster details from the database
func (c *Operator) GetClusterWithProjectID(projectID string, clusterType *string) ([]*Cluster, error) {

	var query bson.D
	if clusterType == nil {
		query = bson.D{
			{"project_id", projectID},
			{"is_removed", false},
		}
	} else {
		query = bson.D{
			{"project_id", projectID},
			{"cluster_type", clusterType},
			{"is_removed", false},
		}
	}

	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var clusters []*Cluster

	results, err := c.operator.List(ctx, mongodb.ClusterCollection, query)
	if err != nil {
		return []*Cluster{}, err
	}

	err = results.All(ctx, &clusters)
	if err != nil {
		return []*Cluster{}, err
	}

	return clusters, nil
}

// ListClusters returns all the clusters matching the query
func (c *Operator) ListClusters(ctx context.Context, query bson.D) ([]*Cluster, error) {
	var clusters []*Cluster
	results, err := c.operator.List(ctx, mongodb.ClusterCollection, query)
	if err != nil {
		return []*Cluster{}, err
	}
	err = results.All(ctx, &clusters)
	if err != nil {
		return []*Cluster{}, err
	}
	return clusters, nil
}

// GetAggregateProjects takes a mongo pipeline to retrieve the project details from the database
func (c *Operator) GetAggregateProjects(ctx context.Context, pipeline mongo.Pipeline, opts *options.AggregateOptions) (*mongo.Cursor, error) {
	results, err := c.operator.Aggregate(ctx, mongodb.ClusterCollection, pipeline, opts)
	if err != nil {
		return nil, err
	}

	return results, nil
}
