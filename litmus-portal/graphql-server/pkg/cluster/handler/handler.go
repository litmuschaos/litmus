package handler

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/handlers"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	clusterOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

// RegisterCluster creates an entry for a new cluster in DB and generates the url used to apply manifest
func RegisterCluster(request model.RegisterClusterRequest) (*model.RegisterClusterResponse, error) {
	endpoint, err := handlers.GetEndpoint(request.ClusterType)
	if err != nil {
		return nil, err
	}

	if endpoint == "" {
		return nil, errors.New("failed to retrieve the server endpoint")
	}

	clusterID := uuid.New().String()
	token, err := clusterOps.ClusterCreateJWT(clusterID)
	if err != nil {
		return &model.RegisterClusterResponse{}, err
	}

	if request.NodeSelector != nil {
		selectors := strings.Split(*request.NodeSelector, ",")

		for _, el := range selectors {
			kv := strings.Split(el, "=")
			if len(kv) != 2 {
				return nil, errors.New("node selector environment variable is not correct. Correct format: \"key1=value2,key2=value2\"")
			}

			if strings.Contains(kv[0], "\"") || strings.Contains(kv[1], "\"") {
				return nil, errors.New("node selector environment variable contains escape character(s). Correct format: \"key1=value2,key2=value2\"")
			}
		}
	}
	var tolerations []*dbSchemaCluster.Toleration
	err = copier.Copy(&tolerations, request.Tolerations)
	if err != nil {
		return &model.RegisterClusterResponse{}, err
	}

	newCluster := dbSchemaCluster.Cluster{
		ClusterID:      clusterID,
		ClusterName:    request.ClusterName,
		Description:    request.Description,
		ProjectID:      request.ProjectID,
		AccessKey:      utils.RandomString(32),
		ClusterType:    request.ClusterType,
		PlatformName:   request.PlatformName,
		AgentNamespace: request.AgentNamespace,
		Serviceaccount: request.ServiceAccount,
		AgentScope:     request.AgentScope,
		AgentNsExists:  request.AgentNsExists,
		AgentSaExists:  request.AgentSaExists,
		CreatedAt:      strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:      strconv.FormatInt(time.Now().Unix(), 10),
		Token:          token,
		IsRemoved:      false,
		NodeSelector:   request.NodeSelector,
		Tolerations:    tolerations,
		SkipSSL:        request.SkipSsl,
		StartTime:      strconv.FormatInt(time.Now().Unix(), 10),
	}

	err = dbOperationsCluster.InsertCluster(newCluster)
	if err != nil {
		return &model.RegisterClusterResponse{}, err
	}

	logrus.Print("New Agent Registered with ID: ", clusterID, " PROJECT_ID: ", request.ProjectID)

	return &model.RegisterClusterResponse{
		ClusterID:   newCluster.ClusterID,
		Token:       token,
		ClusterName: newCluster.ClusterName,
	}, nil
}

// ConfirmClusterRegistration takes the cluster_id and access_key from the subscriber and validates it, if validated generates and sends new access_key
func ConfirmClusterRegistration(request model.ClusterIdentity, r store.StateData) (*model.ConfirmClusterRegistrationResponse, error) {
	currentVersion := os.Getenv("VERSION")
	if currentVersion != request.Version {
		return nil, fmt.Errorf("ERROR: CLUSTER VERSION MISMATCH (need %v got %v)", currentVersion, request.Version)
	}

	cluster, err := dbOperationsCluster.GetCluster(request.ClusterID)
	if err != nil {
		return &model.ConfirmClusterRegistrationResponse{IsClusterConfirmed: false}, err
	}

	if cluster.AccessKey == request.AccessKey {
		newKey := utils.RandomString(32)
		time := strconv.FormatInt(time.Now().Unix(), 10)
		query := bson.D{{"cluster_id", request.ClusterID}}
		update := bson.D{{"$unset", bson.D{{"token", ""}}}, {"$set", bson.D{{"access_key", newKey}, {"is_registered", true}, {"is_cluster_confirmed", true}, {"updated_at", time}}}}

		err = dbOperationsCluster.UpdateCluster(query, update)
		if err != nil {
			return &model.ConfirmClusterRegistrationResponse{IsClusterConfirmed: false}, err
		}

		cluster.IsRegistered = true
		cluster.AccessKey = ""

		newCluster := model.Cluster{}
		copier.Copy(&newCluster, &cluster)

		log.Print("Cluster Confirmed having ID: ", cluster.ClusterID, ", PID: ", cluster.ProjectID)
		SendClusterEvent("cluster-registration", "New Cluster", "New Cluster registration", newCluster, r)

		return &model.ConfirmClusterRegistrationResponse{IsClusterConfirmed: true, NewAccessKey: &newKey, ClusterID: &cluster.ClusterID}, err
	}
	return &model.ConfirmClusterRegistrationResponse{IsClusterConfirmed: false}, err
}

// NewClusterEvent takes an event from a subscriber, validates identity and broadcasts the event to the users
func NewClusterEvent(request model.NewClusterEventRequest, r store.StateData) (string, error) {
	cluster, err := dbOperationsCluster.GetCluster(request.ClusterID)
	if err != nil {
		return "", err
	}

	if cluster.AccessKey == request.AccessKey && cluster.IsRegistered {
		log.Print("CLUSTER EVENT : ID-", cluster.ClusterID, " PID-", cluster.ProjectID)

		newCluster := model.Cluster{}
		copier.Copy(&newCluster, &cluster)

		SendClusterEvent("cluster-event", request.EventName, request.Description, newCluster, r)
		return "Event Published", nil
	}

	return "", errors.New("ERROR WITH CLUSTER EVENT")
}

// DeleteClusters takes clusterIDs and r parameters, deletes the clusters from the database and sends a request to the subscriber for clean-up
func DeleteClusters(ctx context.Context, projectID string, clusterIds []*string, r store.StateData) (string, error) {
	query := bson.D{
		{"project_id", projectID},
		{"cluster_id", bson.D{
			{"$in", clusterIds},
		}},
	}
	// Update cluster info in db
	updatedAtTime := strconv.FormatInt(time.Now().Unix(), 10)
	update := bson.D{{"$set", bson.D{{"is_removed", true}, {"updated_at", updatedAtTime}}}}

	err := dbOperationsCluster.UpdateCluster(query, update)
	if err != nil {
		return "", err
	}
	clusters, err := dbOperationsCluster.ListClusters(ctx, query)
	if err != nil {
		return "", nil
	}

	for _, cluster := range clusters {
		requests := []string{
			`{
		   		"apiVersion": "v1",
		   		"kind": "ConfigMap",
		   		"metadata": {
					"name": "agent-config",
					"namespace": ` + *cluster.AgentNamespace + `
		   		}
			}`,
			`{
				"apiVersion": "apps/v1",
				"kind": "Deployment",
				"metadata": {
					"name": "subscriber",
					"namespace": ` + *cluster.AgentNamespace + `
				}
			}`,
		}

		tkn := ctx.Value(authorization.AuthKey).(string)
		username, _ := authorization.GetUsername(tkn)

		for _, request := range requests {
			SendRequestToSubscriber(clusterOps.SubscriberRequests{
				K8sManifest: request,
				RequestType: "delete",
				ProjectID:   cluster.ProjectID,
				ClusterID:   cluster.ClusterID,
				Namespace:   *cluster.AgentNamespace,
				Username:    &username,
			}, r)
		}

	}
	return "Successfully deleted clusters", nil
}

// ListClusters takes a projectID and clusterType to filter and return a list of clusters
func ListClusters(projectID string, clusterType *string) ([]*model.Cluster, error) {
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
	newEvent := model.ClusterEventResponse{
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
			from frontend as a separate workflowNamespace field under ChaosWorkFlowRequest model
			for CreateChaosWorkflow mutation to be passed to this function.
		*/
	}
	newAction := &model.ClusterActionResponse{
		ProjectID: subscriberRequest.ProjectID,
		Action: &model.ActionPayload{
			K8sManifest:  subscriberRequest.K8sManifest,
			Namespace:    subscriberRequest.Namespace,
			RequestType:  subscriberRequest.RequestType,
			ExternalData: subscriberRequest.ExternalData,
			Username:     subscriberRequest.Username,
		},
	}

	r.Mutex.Lock()

	if observer, ok := r.ConnectedCluster[subscriberRequest.ClusterID]; ok {
		observer <- newAction
	}

	r.Mutex.Unlock()
}

// GetAgentDetails fetches agent details from the DB
func GetAgentDetails(ctx context.Context, clusterID string, projectID string) (*model.Cluster, error) {
	cluster, err := dbOperationsCluster.GetAgentDetails(ctx, clusterID, projectID)
	if err != nil {
		return nil, err
	}

	newCluster := model.Cluster{}

	err = copier.Copy(&newCluster, &cluster)
	if err != nil {
		return nil, err
	}

	return &newCluster, nil
}
