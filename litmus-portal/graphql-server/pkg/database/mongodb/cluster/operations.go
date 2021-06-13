package cluster

import (
	"context"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	backgroundContext = context.Background()
)

// InsertCluster takes details of a cluster and inserts into the database collection
func InsertCluster(cluster Cluster) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	err := mongodb.Operator.Create(ctx, mongodb.ClusterCollection, cluster)
	if err != nil {
		return err
	}

	return nil
}

// GetCluster takes a clusterID to retrieve the cluster details from the database
func GetCluster(clusterID string) (Cluster, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{"cluster_id", clusterID}}

	var cluster Cluster
	result, err := mongodb.Operator.Get(ctx, mongodb.ClusterCollection, query)
	err = result.Decode(&cluster)
	if err != nil {
		return Cluster{}, err
	}

	return cluster, nil
}

// UpdateCluster takes query and update parameters to update the cluster details in the database
func UpdateCluster(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := mongodb.Operator.Update(ctx, mongodb.ClusterCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// GetClusterWithProjectID takes projectID and clusterType parameters to retrieve the cluster details from the database
func GetClusterWithProjectID(projectID string, clusterType *string) ([]*Cluster, error) {

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

	results, err := mongodb.Operator.List(ctx, mongodb.ClusterCollection, query)
	if err != nil {
		return []*Cluster{}, err
	}

	err = results.All(ctx, &clusters)
	if err != nil {
		return []*Cluster{}, err
	}

	return clusters, nil
}

// GetClusters returns all the clusters matching the query
func GetClusters(ctx context.Context, query bson.D) ([]*Cluster, error) {
	var clusters []*Cluster
	results, err := mongodb.Operator.List(ctx, mongodb.ClusterCollection, query)
	if err != nil {
		return []*Cluster{}, err
	}
	err = results.All(ctx, &clusters)
	if err != nil {
		return []*Cluster{}, err
	}
	return clusters, nil
}
