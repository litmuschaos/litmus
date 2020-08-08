package mutations

import (
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/graphql/subscriptions"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/utils"
)

//ClusterRegister creates an entry for a new cluster in DB and generates the url used to apply manifest
func ClusterRegister(input model.ClusterInput) (string, error) {
	newCluster := database.Cluster{
		ClusterID:    uuid.New().String(),
		ClusterName:  input.ClusterName,
		Description:  input.Description,
		ProjectID:    input.ProjectID,
		AccessKey:    utils.RandomString(32),
		ClusterType:  input.ClusterType,
		PlatformName: input.PlatformName,
		CreatedAt:    strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:    strconv.FormatInt(time.Now().Unix(), 10),
	}

	err := database.InsertCluster(newCluster)
	if err != nil {
		return "", err
	}

	log.Print("NEW CLUSTER REGISTERED : ID-", newCluster.ClusterID, " PID-", newCluster.ProjectID)
	token, err := cluster.ClusterCreateJWT(newCluster.ClusterID)
	if err != nil {
		return "", err
	}

	return token, nil
}

//ConfirmClusterRegistration takes the cluster_id and access_key from the subscriber and validates it, if validated generates and sends new access_key
func ConfirmClusterRegistration(identity model.ClusterIdentity, r store.StateData) (*model.ClusterConfirmResponse, error) {
	cluster, err := database.GetCluster(identity.ClusterID)
	if err != nil {
		return &model.ClusterConfirmResponse{IsClusterConfirmed: false}, err
	}

	if cluster.AccessKey == identity.AccessKey {
		newKey := utils.RandomString(32)
		time := strconv.FormatInt(time.Now().Unix(), 10)
		query := bson.D{{"cluster_id", identity.ClusterID}}
		update := bson.D{{"$set", bson.D{{"access_key", newKey}, {"is_registered", true}, {"updated_at", time}}}}

		err = database.UpdateCluster(query, update)
		if err != nil {
			return &model.ClusterConfirmResponse{IsClusterConfirmed: false}, err
		}

		cluster.IsRegistered = true
		cluster.AccessKey = ""

		log.Print("CLUSTER Confirmed : ID-", cluster.ClusterID, " PID-", cluster.ProjectID)
		subscriptions.SendClusterEvent("cluster-registration", "New Cluster", "New Cluster registration", model.Cluster(cluster), r)

		return &model.ClusterConfirmResponse{IsClusterConfirmed: true, NewClusterKey: &newKey, ClusterID: &cluster.ClusterID}, err
	}
	return &model.ClusterConfirmResponse{IsClusterConfirmed: false}, err
}

//NewEvent takes a event from a subscriber, validates identity and broadcasts the event to the users
func NewEvent(clusterEvent model.ClusterEventInput, r store.StateData) (string, error) {
	cluster, err := database.GetCluster(clusterEvent.ClusterID)
	if err != nil {
		return "", err
	}

	if cluster.AccessKey == clusterEvent.AccessKey && cluster.IsRegistered {
		log.Print("CLUSTER EVENT : ID-", cluster.ClusterID, " PID-", cluster.ProjectID)
		subscriptions.SendClusterEvent("cluster-event", clusterEvent.EventName, clusterEvent.Description, model.Cluster(cluster), r)
		return "Event Published", nil
	}

	return "", errors.New("ERROR WITH CLUSTER EVENT")
}
