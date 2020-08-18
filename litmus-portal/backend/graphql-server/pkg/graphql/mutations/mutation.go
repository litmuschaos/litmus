package mutations

import (
	"encoding/json"
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

// WorkFlowRunHandler Updates or Inserts a new Workflow Run into the DB
func WorkFlowRunHandler(input model.WorkflowRunInput, r store.StateData) (string, error) {
	cluster, err := cluster.VerifyCluster(*input.ClusterID)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	newWorkflowRun := model.WorkflowRun{
		ClusterID:     cluster.ClusterID,
		ClusterName:   cluster.ClusterName,
		ProjectID:     cluster.ProjectID,
		LastUpdated:   strconv.FormatInt(time.Now().Unix(), 10),
		WorkflowRunID: input.WorkflowRunID,
		WorkflowName:  input.WorkflowName,
		ExecutionData: input.ExecutionData,
		WorkflowID:    "000000000000",
	}

	subscriptions.SendWorkflowEvent(newWorkflowRun, r)
	err = database.UpsertWorkflowRun(database.WorkflowRun(newWorkflowRun))
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	return "Workflow Run Accepted", nil
}

// LogsHandler receives logs from the workflow-agent and publishes to frontend clients
func LogsHandler(podLog model.PodLog, r store.StateData) (string, error) {
	_, err := cluster.VerifyCluster(*podLog.ClusterID)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	if reqChan, ok := r.WorkflowLog[podLog.RequestID]; ok {
		resp := model.PodLogResponse{
			PodName:       podLog.PodName,
			WorkflowRunID: podLog.WorkflowRunID,
			PodType:       podLog.PodType,
			Log:           podLog.Log,
		}
		reqChan <- &resp
		close(reqChan)
		return "LOGS SENT SUCCESSFULLY", nil
	}
	return "LOG REQUEST CANCELLED", nil
}

func CreateChaosWorkflow(input *model.ChaosWorkFlowInput, r store.StateData) (*model.ChaosWorkFlowResponse, error) {
	marshalData, err := json.Marshal(input.Weightages)
	if err != nil {
		return &model.ChaosWorkFlowResponse{}, err
	}

	var Weightages []*database.WeightagesInput
	if err := json.Unmarshal(marshalData, &Weightages); err != nil {
		return &model.ChaosWorkFlowResponse{}, err
	}

	workflow_id := utils.RandomString(32)
	newChaosWorkflow := database.ChaosWorkFlowInput{
		WorkflowID:          workflow_id,
		WorkflowManifest:    input.WorkflowManifest,
		CronSyntax:          input.CronSyntax,
		WorkflowName:        input.WorkflowName,
		WorkflowDescription: input.WorkflowDescription,
		IsCustomWorkflow:    input.IsCustomWorkflow,
		ProjectID:           input.ProjectID,
		ClusterID:           input.ClusterID,
		Weightages:          Weightages,
	}

	err = database.InsertChaosWorkflow(newChaosWorkflow)
	if err != nil {
		return nil, err
	}

	subscriptions.SendWorkflowRequest(&newChaosWorkflow, r)

	return &model.ChaosWorkFlowResponse{
		WorkflowID:          workflow_id,
		CronSyntax:          input.CronSyntax,
		WorkflowName:        input.WorkflowName,
		WorkflowDescription: input.WorkflowDescription,
		IsCustomWorkflow:    input.IsCustomWorkflow,
	}, nil
}
