package handler

import (
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	clusterOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

// ClusterRegister creates an entry for a new cluster in DB and generates the url used to apply manifest
func ClusterRegister(input model.ClusterInput) (*model.ClusterRegResponse, error) {
	clusterID := uuid.New().String()

	token, err := clusterOps.ClusterCreateJWT(clusterID)
	if err != nil {
		return &model.ClusterRegResponse{}, err
	}

	newCluster := dbSchemaCluster.Cluster{
		ClusterID:      clusterID,
		ClusterName:    input.ClusterName,
		Description:    input.Description,
		ProjectID:      input.ProjectID,
		AccessKey:      utils.RandomString(32),
		ClusterType:    input.ClusterType,
		PlatformName:   input.PlatformName,
		AgentNamespace: input.AgentNamespace,
		Serviceaccount: input.Serviceaccount,
		AgentScope:     input.AgentScope,
		AgentNsExists:  input.AgentNsExists,
		AgentSaExists:  input.AgentSaExists,
		CreatedAt:      strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:      strconv.FormatInt(time.Now().Unix(), 10),
		Token:          token,
		IsRemoved:      false,
	}

	err = dbOperationsCluster.InsertCluster(newCluster)
	if err != nil {
		return &model.ClusterRegResponse{}, err
	}

	log.Print("NEW CLUSTER REGISTERED : ID-", clusterID, " PID-", input.ProjectID)

	return &model.ClusterRegResponse{
		ClusterID:   newCluster.ClusterID,
		Token:       token,
		ClusterName: newCluster.ClusterName,
	}, nil
}

// ConfirmClusterRegistration takes the cluster_id and access_key from the subscriber and validates it, if validated generates and sends new access_key
func ConfirmClusterRegistration(identity model.ClusterIdentity, r store.StateData) (*model.ClusterConfirmResponse, error) {
	cluster, err := dbOperationsCluster.GetCluster(identity.ClusterID)
	if err != nil {
		return &model.ClusterConfirmResponse{IsClusterConfirmed: false}, err
	}

	if cluster.AccessKey == identity.AccessKey {
		newKey := utils.RandomString(32)
		time := strconv.FormatInt(time.Now().Unix(), 10)
		query := bson.D{{"cluster_id", identity.ClusterID}}
		update := bson.D{{"$unset", bson.D{{"token", ""}}}, {"$set", bson.D{{"access_key", newKey}, {"is_registered", true}, {"is_cluster_confirmed", true}, {"updated_at", time}}}}

		err = dbOperationsCluster.UpdateCluster(query, update)
		if err != nil {
			return &model.ClusterConfirmResponse{IsClusterConfirmed: false}, err
		}

		cluster.IsRegistered = true
		cluster.AccessKey = ""

		newCluster := model.Cluster{}
		copier.Copy(&newCluster, &cluster)

		log.Print("Cluster Confirmed having ID: ", cluster.ClusterID, ", PID: ", cluster.ProjectID)
		SendClusterEvent("cluster-registration", "New Cluster", "New Cluster registration", newCluster, r)

		return &model.ClusterConfirmResponse{IsClusterConfirmed: true, NewAccessKey: &newKey, ClusterID: &cluster.ClusterID}, err
	}
	return &model.ClusterConfirmResponse{IsClusterConfirmed: false}, err
}

// NewEvent takes a event from a subscriber, validates identity and broadcasts the event to the users
func NewEvent(clusterEvent model.ClusterEventInput, r store.StateData) (string, error) {
	cluster, err := dbOperationsCluster.GetCluster(clusterEvent.ClusterID)
	if err != nil {
		return "", err
	}

	if cluster.AccessKey == clusterEvent.AccessKey && cluster.IsRegistered {
		log.Print("CLUSTER EVENT : ID-", cluster.ClusterID, " PID-", cluster.ProjectID)

		newCluster := model.Cluster{}
		copier.Copy(&newCluster, &cluster)

		SendClusterEvent("cluster-event", clusterEvent.EventName, clusterEvent.Description, newCluster, r)
		return "Event Published", nil
	}

	return "", errors.New("ERROR WITH CLUSTER EVENT")
}

// DeleteCluster takes clusterID and r parameters, deletes the cluster from the database and sends a request to the subscriber for clean-up
func DeleteCluster(clusterID string, r store.StateData) (string, error) {
	time := strconv.FormatInt(time.Now().Unix(), 10)

	query := bson.D{{"cluster_id", clusterID}}
	update := bson.D{{"$set", bson.D{{"is_removed", true}, {"updated_at", time}}}}

	err := dbOperationsCluster.UpdateCluster(query, update)
	if err != nil {
		return "", err
	}
	cluster, err := dbOperationsCluster.GetCluster(clusterID)
	if err != nil {
		return "", nil
	}

	requests := []string{
		`{
			"apiVersion": "apps/v1",
			"kind": "Deployment",
			"metadata": {
				"name": "subscriber",
				"namespace": ` + *cluster.AgentNamespace + `
			}
		}`,
		`{
		   "apiVersion": "v1",
		   "kind": "ConfigMap",
		   "metadata": {
			  "name": "agent-config",
			  "namespace": ` + *cluster.AgentNamespace + `
		   }
		}`,
	}

	for _, request := range requests {
		SendRequestToSubscriber(clusterOps.SubscriberRequests{
			K8sManifest: request,
			RequestType: "delete",
			ProjectID:   cluster.ProjectID,
			ClusterID:   clusterID,
			Namespace:   *cluster.AgentNamespace,
		}, r)
	}

	return "Successfully deleted cluster", nil
}

// QueryGetClusters takes a projectID and clusterType to filter and return a list of clusters
func QueryGetClusters(projectID string, clusterType *string) ([]*model.Cluster, error) {
	clusters, err := dbOperationsCluster.GetClusterWithProjectID(projectID, clusterType)
	if err != nil {
		return nil, err
	}
	newClusters := []*model.Cluster{}

	for _, cluster := range clusters {
		var totalNoOfSchedules int
		lastWorkflowTimestamp := "0"
		workflows, err := dbOperationsWorkflow.GetWorkflowsByClusterID(cluster.ClusterID)
		if err != nil {
			return nil, err
		}
		newCluster := model.Cluster{}
		copier.Copy(&newCluster, &cluster)
		newCluster.NoOfWorkflows = func(i int) *int { return &i }(len(workflows))
		for _, workflow := range workflows {
			if workflow.IsRemoved == false {
				totalNoOfSchedules = totalNoOfSchedules + len(workflow.WorkflowRuns)
			}
			if strings.Compare(workflow.UpdatedAt, lastWorkflowTimestamp) == 1 {
				lastWorkflowTimestamp = workflow.UpdatedAt
			}
		}
		newCluster.LastWorkflowTimestamp = lastWorkflowTimestamp
		newCluster.NoOfSchedules = func(i int) *int { return &i }(totalNoOfSchedules)

		newClusters = append(newClusters, &newCluster)
	}

	return newClusters, nil
}

// SendClusterEvent sends events from the clusters to the appropriate users listening for the events
func SendClusterEvent(eventType, eventName, description string, cluster model.Cluster, r store.StateData) {
	newEvent := model.ClusterEvent{
		EventID:     uuid.New().String(),
		EventType:   eventType,
		EventName:   eventName,
		Description: description,
		Cluster:     &cluster,
	}
	r.Mutex.Lock()
	if r.ClusterEventPublish != nil {
		for _, observer := range r.ClusterEventPublish[cluster.ProjectID] {
			observer <- &newEvent
		}
	}
	r.Mutex.Unlock()
}

// SendRequestToSubscriber sends events from the graphQL server to the subscribers listening for the requests
func SendRequestToSubscriber(subscriberRequest clusterOps.SubscriberRequests, r store.StateData) {
	if os.Getenv("AGENT_SCOPE") == "cluster" {
		/*
			namespace = Obtain from WorkflowManifest or
			from frontend as a separate workflowNamespace field under ChaosWorkFlowInput model
			for CreateChaosWorkflow mutation to be passed to this function.
		*/
	}
	newAction := &model.ClusterAction{
		ProjectID: subscriberRequest.ProjectID,
		Action: &model.ActionPayload{
			K8sManifest:  subscriberRequest.K8sManifest,
			Namespace:    subscriberRequest.Namespace,
			RequestType:  subscriberRequest.RequestType,
			ExternalData: subscriberRequest.ExternalData,
		},
	}

	r.Mutex.Lock()

	if observer, ok := r.ConnectedCluster[subscriberRequest.ClusterID]; ok {
		observer <- newAction
	}

	r.Mutex.Unlock()
}
