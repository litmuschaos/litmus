package cluster

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

type Service interface {
	RegisterCluster(request model.RegisterClusterRequest) (*model.RegisterClusterResponse, error)
	UpdateCluster(query bson.D, update bson.D) error
	ConfirmClusterRegistration(request model.ClusterIdentity, r store.StateData) (*model.ConfirmClusterRegistrationResponse, error)
	NewClusterEvent(request model.NewClusterEventRequest, r store.StateData) (string, error)
	DeleteClusters(ctx context.Context, projectID string, clusterIds []*string, r store.StateData) (string, error)
	ListClusters(projectID string, clusterType *string) ([]*model.Cluster, error)
	GetAgentDetails(ctx context.Context, clusterID string, projectID string) (*model.Cluster, error)
	GetManifestWithClusterID(clusterID string, accessKey string) ([]byte, error)
	SendClusterEvent(eventType, eventName, description string, cluster model.Cluster, r store.StateData)
	VerifyCluster(identity model.ClusterIdentity) (*dbSchemaCluster.Cluster, error)
	GetManifest(token string) ([]byte, int, error)
	GetCluster(clusterID string) (dbSchemaCluster.Cluster, error)
	GetEndpoint(agentType utils.AgentType) (string, error)
	GetClusterResource(manifest string, namespace string) (*unstructured.Unstructured, error)
}

type clusterService struct {
	clusterOperator       *dbSchemaCluster.Operator
	chaosWorkflowOperator *dbOperationsWorkflow.Operator
	kubeClients           *k8s.KubeClients
}

// NewService returns a new instance of Service
func NewService(clusterOperator *dbSchemaCluster.Operator, chaosWorkflowOperator *dbOperationsWorkflow.Operator, kubeClients *k8s.KubeClients) Service {
	return &clusterService{
		clusterOperator:       clusterOperator,
		chaosWorkflowOperator: chaosWorkflowOperator,
		kubeClients:           kubeClients,
	}
}

// RegisterCluster creates an entry for a new cluster in DB and generates the url used to apply manifest
func (c *clusterService) RegisterCluster(request model.RegisterClusterRequest) (*model.RegisterClusterResponse, error) {
	endpoint, err := c.GetEndpoint(utils.AgentType(request.ClusterType))
	if err != nil {
		return nil, err
	}

	if endpoint == "" {
		return nil, errors.New("failed to retrieve the server endpoint")
	}

	clusterID := uuid.New().String()
	token, err := CreateClusterJWT(clusterID)
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

	err = c.clusterOperator.InsertCluster(newCluster)
	if err != nil {
		return &model.RegisterClusterResponse{}, err
	}

	log.Info("new Agent Registered with ID: ", clusterID, " project_id: ", request.ProjectID)

	return &model.RegisterClusterResponse{
		ClusterID:   newCluster.ClusterID,
		Token:       token,
		ClusterName: newCluster.ClusterName,
	}, nil
}

// UpdateCluster updates the cluster details
func (c *clusterService) UpdateCluster(query bson.D, update bson.D) error {
	return c.clusterOperator.UpdateCluster(query, update)
}

// ConfirmClusterRegistration takes the cluster_id and access_key from the subscriber and validates it, if validated generates and sends new access_key
func (c *clusterService) ConfirmClusterRegistration(request model.ClusterIdentity, r store.StateData) (*model.ConfirmClusterRegistrationResponse, error) {
	currentVersion := utils.Config.Version
	if currentVersion != request.Version {
		return nil, fmt.Errorf("ERROR: CLUSTER VERSION MISMATCH (need %v got %v)", currentVersion, request.Version)
	}

	cluster, err := c.clusterOperator.GetCluster(request.ClusterID)
	if err != nil {
		return &model.ConfirmClusterRegistrationResponse{IsClusterConfirmed: false}, err
	}

	if cluster.AccessKey == request.AccessKey {
		newKey := utils.RandomString(32)
		time := strconv.FormatInt(time.Now().Unix(), 10)
		query := bson.D{{"cluster_id", request.ClusterID}}
		update := bson.D{{"$unset", bson.D{{"token", ""}}}, {"$set", bson.D{{"access_key", newKey}, {"is_registered", true}, {"is_cluster_confirmed", true}, {"updated_at", time}}}}

		err = c.clusterOperator.UpdateCluster(query, update)
		if err != nil {
			return &model.ConfirmClusterRegistrationResponse{IsClusterConfirmed: false}, err
		}

		cluster.IsRegistered = true
		cluster.AccessKey = ""

		newCluster := model.Cluster{}
		copier.Copy(&newCluster, &cluster)

		log.Info("cluster Confirmed having ID: ", cluster.ClusterID, ", PID: ", cluster.ProjectID)
		c.SendClusterEvent("cluster-registration", "New Cluster", "New Cluster registration", newCluster, r)

		return &model.ConfirmClusterRegistrationResponse{IsClusterConfirmed: true, NewAccessKey: &newKey, ClusterID: &cluster.ClusterID}, err
	}
	return &model.ConfirmClusterRegistrationResponse{IsClusterConfirmed: false}, err
}

// NewClusterEvent takes an event from a subscriber, validates identity and broadcasts the event to the users
func (c *clusterService) NewClusterEvent(request model.NewClusterEventRequest, r store.StateData) (string, error) {
	cluster, err := c.clusterOperator.GetCluster(request.ClusterID)
	if err != nil {
		return "", err
	}

	if cluster.AccessKey == request.AccessKey && cluster.IsRegistered {
		log.Info("cluster event : ID-", cluster.ClusterID, " PID-", cluster.ProjectID)

		newCluster := model.Cluster{}
		copier.Copy(&newCluster, &cluster)

		c.SendClusterEvent("cluster-event", request.EventName, request.Description, newCluster, r)
		return "Event Published", nil
	}

	return "", errors.New("error with cluster event")
}

// DeleteClusters takes clusterIDs and r parameters, deletes the clusters from the database and sends a request to the subscriber for clean-up
func (c *clusterService) DeleteClusters(ctx context.Context, projectID string, clusterIds []*string, r store.StateData) (string, error) {
	query := bson.D{
		{"project_id", projectID},
		{"cluster_id", bson.D{
			{"$in", clusterIds},
		}},
	}
	// Update cluster info in db
	updatedAtTime := strconv.FormatInt(time.Now().Unix(), 10)
	update := bson.D{{"$set", bson.D{{"is_removed", true}, {"updated_at", updatedAtTime}}}}

	err := c.clusterOperator.UpdateCluster(query, update)
	if err != nil {
		return "", err
	}
	clusters, err := c.clusterOperator.ListClusters(ctx, query)
	if err != nil {
		return "", err
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
					"labels": {
                       "app": "subscriber",
                    },
					"namespace": ` + *cluster.AgentNamespace + `
				}
			}`,
		}

		tkn := ctx.Value(authorization.AuthKey).(string)
		username, _ := authorization.GetUsername(tkn)

		for _, request := range requests {
			SendRequestToSubscriber(SubscriberRequests{
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
func (c *clusterService) ListClusters(projectID string, clusterType *string) ([]*model.Cluster, error) {
	clusters, err := c.clusterOperator.GetClusterWithProjectID(projectID, clusterType)
	if err != nil {
		return nil, err
	}
	var newClusters []*model.Cluster

	for _, cluster := range clusters {
		var totalNoOfSchedules int
		lastWorkflowTimestamp := "0"
		workflows, err := c.chaosWorkflowOperator.GetWorkflowsByClusterID(cluster.ClusterID)
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

// GetAgentDetails fetches agent details from the DB
func (c *clusterService) GetAgentDetails(ctx context.Context, clusterID string, projectID string) (*model.Cluster, error) {
	cluster, err := c.clusterOperator.GetAgentDetails(ctx, clusterID, projectID)
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

// GetManifestWithClusterID returns manifest for a given cluster
func (c *clusterService) GetManifestWithClusterID(clusterID string, accessKey string) ([]byte, error) {
	reqCluster, err := c.clusterOperator.GetCluster(clusterID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve the cluster %v", err)
	}

	// Checking if cluster with given clusterID and accesskey is present
	if reqCluster.AccessKey != accessKey {
		return nil, fmt.Errorf("ACCESS_KEY is invalid")
	}

	var config subscriberConfigurations
	config.ServerEndpoint, err = c.GetEndpoint(utils.AgentType(reqCluster.ClusterType))
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve the server endpoint %v", err)
	}

	var scope = utils.Config.ChaosCenterScope
	if scope == string(utils.AgentScopeCluster) && utils.Config.TlsSecretName != "" {
		config.TLSCert, err = c.kubeClients.GetTLSCert(utils.Config.TlsSecretName)
		if err != nil {
			return nil, fmt.Errorf("failed to retrieve the tls cert %v", err)
		}
	}

	if scope == string(utils.AgentScopeNamespace) {
		config.TLSCert = utils.Config.TlsCertB64
	}

	var respData []byte
	if reqCluster.AgentScope == string(utils.AgentScopeCluster) {
		respData, err = manifestParser(reqCluster, "manifests/cluster", &config)
	} else if reqCluster.AgentScope == string(utils.AgentScopeNamespace) {
		respData, err = manifestParser(reqCluster, "manifests/namespace", &config)
	} else {
		return nil, fmt.Errorf("env AGENT_SCOPE is empty")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to parse the manifest %v", err)
	}

	return respData, nil
}

// SendClusterEvent sends events from the clusters to the appropriate users listening for the events
func (c *clusterService) SendClusterEvent(eventType, eventName, description string, cluster model.Cluster, r store.StateData) {
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

// VerifyCluster utils function used to verify cluster identity
func (c *clusterService) VerifyCluster(identity model.ClusterIdentity) (*dbSchemaCluster.Cluster, error) {
	currentVersion := utils.Config.Version
	if strings.Contains(strings.ToLower(currentVersion), CIVersion) {
		if currentVersion != identity.Version {
			return nil, fmt.Errorf("ERROR: CLUSTER VERSION MISMATCH (need %v got %v)", currentVersion, identity.Version)
		}
	} else {
		splitCPVersion := strings.Split(currentVersion, ".")
		splitSubVersion := strings.Split(identity.Version, ".")
		if len(splitSubVersion) != 3 || splitSubVersion[0] != splitCPVersion[0] || splitSubVersion[1] != splitCPVersion[1] {
			return nil, fmt.Errorf("ERROR: CLUSTER VERSION MISMATCH (need %v.%v.x got %v)", splitCPVersion[0], splitCPVersion[1], identity.Version)
		}
	}
	cluster, err := c.clusterOperator.GetCluster(identity.ClusterID)
	if err != nil {
		return nil, err
	}

	if !(cluster.AccessKey == identity.AccessKey && cluster.IsRegistered) {
		return nil, fmt.Errorf("ERROR:  CLUSTER_ID MISMATCH")
	}
	return &cluster, nil
}

// GetManifest returns manifest for a given cluster
func (c *clusterService) GetManifest(token string) ([]byte, int, error) {
	clusterID, err := ValidateClusterJWT(token)
	if err != nil {
		return nil, http.StatusNotFound, err
	}

	reqCluster, err := c.clusterOperator.GetCluster(clusterID)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}

	var config subscriberConfigurations
	config.ServerEndpoint, err = c.GetEndpoint(utils.AgentType(reqCluster.ClusterType))
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}

	var scope = utils.Config.ChaosCenterScope
	if scope == string(utils.AgentScopeCluster) && utils.Config.TlsSecretName != "" {
		config.TLSCert, err = c.kubeClients.GetTLSCert(utils.Config.TlsSecretName)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}
	}

	if scope == string(utils.AgentScopeNamespace) {
		config.TLSCert = utils.Config.TlsCertB64
	}

	if !reqCluster.IsRegistered {
		var respData []byte
		if reqCluster.AgentScope == "cluster" {
			respData, err = manifestParser(reqCluster, "manifests/cluster", &config)
		} else if reqCluster.AgentScope == "namespace" {
			respData, err = manifestParser(reqCluster, "manifests/namespace", &config)
		} else {
			log.Error("env AGENT_SCOPE is empty")
		}
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		return respData, http.StatusOK, nil
	} else {
		return []byte("Cluster is already registered"), http.StatusConflict, nil
	}
}

// GetCluster returns cluster details for a given clusterID
func (c *clusterService) GetCluster(clusterID string) (dbSchemaCluster.Cluster, error) {
	return c.clusterOperator.GetCluster(clusterID)
}

// GetEndpoint returns the endpoint for the subscriber
func (c *clusterService) GetEndpoint(agentType utils.AgentType) (string, error) {
	// returns endpoint from env, if provided by user
	if utils.Config.ChaosCenterUiEndpoint != "" {
		return utils.Config.ChaosCenterUiEndpoint + "/ws/query", nil
	}

	// generating endpoint based on ChaosCenter Scope & AgentType (Self or External)
	agentEndpoint, err := c.kubeClients.GetServerEndpoint(utils.AgentScope(utils.Config.ChaosCenterScope), agentType)

	if agentEndpoint == "" || err != nil {
		return "", fmt.Errorf("failed to retrieve the server endpoint %v", err)
	}

	return agentEndpoint, err
}

// GetClusterResource returns the cluster resource for a given manifest
func (c *clusterService) GetClusterResource(manifest string, namespace string) (*unstructured.Unstructured, error) {
	return c.kubeClients.ClusterResource(manifest, namespace)
}
