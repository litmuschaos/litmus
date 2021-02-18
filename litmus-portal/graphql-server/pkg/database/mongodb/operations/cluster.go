package operations

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
)

var (
	clusterCollection *mongo.Collection
	backgroundContext = context.Background()
	err               error
)

func init() {
	clusterCollection = mongodb.Database.Collection("cluster-collection")
}

func InsertCluster(cluster dbSchema.Cluster) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := clusterCollection.InsertOne(ctx, cluster)
	if err != nil {
		return err
	}

	return nil
}

func GetCluster(cluster_id string) (dbSchema.Cluster, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.M{"cluster_id": cluster_id}

	var cluster dbSchema.Cluster
	err = clusterCollection.FindOne(ctx, query).Decode(&cluster)
	if err != nil {
		return dbSchema.Cluster{}, err
	}

	return cluster, nil
}

func UpdateCluster(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := clusterCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	return nil
}

func GetClusterWithProjectID(project_id string, cluster_type *string) ([]*dbSchema.Cluster, error) {

	var query bson.M
	if cluster_type == nil {
		query = bson.M{"project_id": project_id, "is_removed": false}
	} else {
		query = bson.M{"project_id": project_id, "cluster_type": cluster_type, "is_removed": false}
	}

	fmt.Print(query)
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var clusters []*dbSchema.Cluster

	cursor, err := clusterCollection.Find(ctx, query)
	if err != nil {
		return []*dbSchema.Cluster{}, err
	}

	err = cursor.All(ctx, &clusters)
	if err != nil {
		return []*dbSchema.Cluster{}, err
	}

	return clusters, nil
}
