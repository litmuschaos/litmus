package cluster

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

var (
	clusterCollection *mongo.Collection
	backgroundContext = context.Background()
	err               error
)

func init() {
	clusterCollection = mongodb.Database.Collection("cluster-collection")
}

// InsertCluster takes details of a cluster and inserts into the database collection
func InsertCluster(cluster Cluster) error {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	_, err := clusterCollection.InsertOne(ctx, cluster)
	if err != nil {
		return err
	}

	return nil
}

// GetCluster takes a clusterID to retrieve the cluster details from the database
func GetCluster(clusterID string) (Cluster, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	query := bson.M{"cluster_id": clusterID}

	var cluster Cluster
	err = clusterCollection.FindOne(ctx, query).Decode(&cluster)
	if err != nil {
		return Cluster{}, err
	}

	return cluster, nil
}

// UpdateCluster takes query and update parameters to update the cluster details in the database
func UpdateCluster(query bson.D, update bson.D) error {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	_, err := clusterCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	return nil
}

// GetClusterWithProjectID takes projectID and clusterType parameters to retrieve the cluster details from the database
func GetClusterWithProjectID(projectID string, clusterType *string) ([]*Cluster, error) {

	var query bson.M
	if clusterType == nil {
		query = bson.M{"project_id": projectID, "is_removed": false}
	} else {
		query = bson.M{"project_id": projectID, "cluster_type": clusterType, "is_removed": false}
	}

	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var clusters []*Cluster

	cursor, err := clusterCollection.Find(ctx, query)
	if err != nil {
		return []*Cluster{}, err
	}

	err = cursor.All(ctx, &clusters)
	if err != nil {
		return []*Cluster{}, err
	}

	return clusters, nil
}
