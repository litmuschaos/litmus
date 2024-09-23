package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/generated"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	data_store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
)

// RegisterInfra is the resolver for the registerInfra field.
func (r *mutationResolver) RegisterInfra(ctx context.Context, projectID string, request model.RegisterInfraRequest) (*model.RegisterInfraResponse, error) {
	logFields := logrus.Fields{
		"projectId": projectID,
	}

	logrus.WithFields(logFields).Info("request received for new a chaos infrastructure")

	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UserInfrastructureReg],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	rcaResponse, err := r.chaosInfrastructureService.RegisterInfra(ctx, projectID, request)
	if err != nil {
		logrus.WithFields(logFields).Error(err)
		return nil, err
	}
	return rcaResponse, err
}

// ConfirmInfraRegistration is the resolver for the confirmInfraRegistration field.
func (r *mutationResolver) ConfirmInfraRegistration(ctx context.Context, request model.InfraIdentity) (*model.ConfirmInfraRegistrationResponse, error) {
	return r.chaosInfrastructureService.ConfirmInfraRegistration(request, *data_store.Store)
}

// DeleteInfra is the resolver for the deleteInfra field.
func (r *mutationResolver) DeleteInfra(ctx context.Context, projectID string, infraID string) (string, error) {
	logFields := logrus.Fields{
		"projectId":    projectID,
		"chaosInfraId": infraID,
	}

	logrus.WithFields(logFields).Info("request received to delete chaos infrastructure")

	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteInfrastructures],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	dcaResponse, err := r.chaosInfrastructureService.DeleteInfra(ctx, projectID, infraID, *data_store.Store)
	if err != nil {
		logrus.WithFields(logFields).Error(err)
		return "", err
	}
	return dcaResponse, err
}

// GetManifestWithInfraID is the resolver for the getManifestWithInfraID field.
func (r *mutationResolver) GetManifestWithInfraID(ctx context.Context, projectID string, infraID string, accessKey string) (string, error) {
	logFields := logrus.Fields{

		"projectId":    projectID,
		"chaosInfraId": infraID,
	}

	reqHeader, ok := ctx.Value("request-header").(http.Header)
	if !ok {
		return "", fmt.Errorf("unable to parse request header")
	}

	referrer := reqHeader.Get("Referer")
	if referrer == "" {
		return "", fmt.Errorf("unable to parse referer header")
	}

	referrerURL, err := url.Parse(referrer)
	if err != nil {
		return "", err
	}
	logrus.WithFields(logFields).Info("request received to get chaos infrastructure installation manifest")
	manifest, err := r.chaosInfrastructureService.GetManifestWithInfraID(fmt.Sprintf("%s://%s", referrerURL.Scheme, referrerURL.Host), infraID, accessKey)
	if err != nil {
		return "", err
	}

	return string(manifest), nil
}

// PodLog is the resolver for the podLog field.
func (r *mutationResolver) PodLog(ctx context.Context, request model.PodLog) (string, error) {
	return r.chaosInfrastructureService.PodLog(request, *data_store.Store)
}

// KubeObj is the resolver for the kubeObj field.
func (r *mutationResolver) KubeObj(ctx context.Context, request model.KubeObjectData) (string, error) {
	return r.chaosInfrastructureService.KubeObj(request, *data_store.Store)
}

// KubeNamespace is the resolver for the kubeNamespace field.
func (r *mutationResolver) KubeNamespace(ctx context.Context, request model.KubeNamespaceData) (string, error) {
	return r.chaosInfrastructureService.KubeNamespace(request, *data_store.Store)
}

// GetInfra is the resolver for the getInfra field.
func (r *queryResolver) GetInfra(ctx context.Context, projectID string, infraID string) (*model.Infra, error) {
	logFields := logrus.Fields{
		"projectId":    projectID,
		"chaosInfraId": infraID,
	}
	logrus.WithFields(logFields).Info("request received to get chaos infrastructure")
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetInfrastructure],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	getInfraResponse, err := r.chaosInfrastructureService.GetInfra(ctx, projectID, infraID)
	if err != nil {
		logrus.WithFields(logFields).Error(err)
		return nil, err
	}
	return getInfraResponse, err
}

// ListInfras is the resolver for the listInfras field.
func (r *queryResolver) ListInfras(ctx context.Context, projectID string, request *model.ListInfraRequest) (*model.ListInfraResponse, error) {
	logFields := logrus.Fields{
		"projectId": projectID,
	}
	logrus.WithFields(logFields).Info("request received to list chaos infrastructures")
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListInfrastructures],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	lcaResponse, err := r.chaosInfrastructureService.ListInfras(projectID, request)
	if err != nil {
		logrus.WithFields(logFields).Error(err)
		return nil, err
	}
	return lcaResponse, err
}

// GetInfraDetails is the resolver for the getInfraDetails field.
func (r *queryResolver) GetInfraDetails(ctx context.Context, infraID string, projectID string) (*model.Infra, error) {
	logFields := logrus.Fields{
		"projectId":    projectID,
		"chaosInfraId": infraID,
	}
	logrus.WithFields(logFields).Info("request received to get chaos infrastructure details")
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetInfraDetails],
		model.InvitationAccepted.String())

	gcaResponse, err := r.chaosInfrastructureService.GetInfraDetails(ctx, infraID, projectID)
	if err != nil {
		logrus.WithFields(logFields).Error(err)
		return nil, err
	}
	return gcaResponse, err
}

// GetInfraManifest is the resolver for the getInfraManifest field.
func (r *queryResolver) GetInfraManifest(ctx context.Context, infraID string, upgrade bool, projectID string) (string, error) {
	logFields := logrus.Fields{
		"projectId": projectID,
	}

	reqHeader, ok := ctx.Value("request-header").(http.Header)
	if !ok {
		return "", fmt.Errorf("unable to parse request header")
	}

	referrer := reqHeader.Get("Referer")
	if referrer == "" {
		return "", fmt.Errorf("unable to parse referer header")
	}

	referrerURL, err := url.Parse(referrer)
	if err != nil {
		return "", err
	}

	logrus.WithFields(logFields).Info("request received to get chaos infrastructure manifest")
	err = authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetManifest],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	getInfra, err := r.chaosInfrastructureService.GetDBInfra(infraID)
	if err != nil {
		return "", err
	}

	gcaResponse, err := chaos_infrastructure.GetK8sInfraYaml(referrerURL.Host, getInfra)
	if err != nil {
		logrus.WithFields(logFields).Error(err)
		return "", err
	}
	return string(gcaResponse), err
}

// GetInfraStats is the resolver for the getInfraStats field.
func (r *queryResolver) GetInfraStats(ctx context.Context, projectID string) (*model.GetInfraStatsResponse, error) {
	logFields := logrus.Fields{
		"projectId": projectID,
	}
	logrus.WithFields(logFields).Info("request received to get chaos infrastructure stats")
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetInfraDetails],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return r.chaosInfrastructureService.GetInfraStats(ctx, projectID)
}

// GetVersionDetails is the resolver for the getVersionDetails field.
func (r *queryResolver) GetVersionDetails(ctx context.Context, projectID string) (*model.InfraVersionDetails, error) {
	return r.chaosInfrastructureService.GetVersionDetails()
}

// GetServerVersion is the resolver for the getServerVersion field.
func (r *queryResolver) GetServerVersion(ctx context.Context) (*model.ServerVersionResponse, error) {
	return r.chaosInfrastructureService.QueryServerVersion(ctx)
}

// GetInfraEvents is the resolver for the getInfraEvents field.
func (r *subscriptionResolver) GetInfraEvents(ctx context.Context, projectID string) (<-chan *model.InfraEventResponse, error) {
	logrus.Print("NEW EVENT ", projectID)
	infraEvent := make(chan *model.InfraEventResponse, 1)

	data_store.Store.Mutex.Lock()
	data_store.Store.InfraEventPublish[projectID] = append(data_store.Store.InfraEventPublish[projectID], infraEvent)
	data_store.Store.Mutex.Unlock()

	go func() {
		<-ctx.Done()
	}()

	return infraEvent, nil
}

// InfraConnect is the resolver for the infraConnect field.
func (r *subscriptionResolver) InfraConnect(ctx context.Context, request model.InfraIdentity) (<-chan *model.InfraActionResponse, error) {
	logrus.Print("NEW CLUSTER CONNECT: ", request.InfraID)
	infraAction := make(chan *model.InfraActionResponse, 1)
	verifiedInfra, err := r.chaosInfrastructureService.VerifyInfra(request)
	if err != nil {
		logrus.Print("VALIDATION FAILED: ", request.InfraID)
		return infraAction, err
	}
	data_store.Store.Mutex.Lock()
	if infra_channel, ok := data_store.Store.ConnectedInfra[request.InfraID]; ok {
		data_store.Store.Mutex.Unlock()
		logrus.Print("ALREADY CONNECTED, FORCED DISCONNECT: ", request.InfraID)
		close(infra_channel)
		return infraAction, errors.New("CLUSTER ALREADY CONNECTED")
	}
	data_store.Store.ConnectedInfra[request.InfraID] = infraAction
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		verifiedInfra.IsActive = false
		logrus.Print("Context Done, will handle disconnection for: ", request.InfraID)
		newVerifiedInfra := model.Infra{}
		copier.Copy(&newVerifiedInfra, &verifiedInfra)

		r.chaosInfrastructureService.SendInfraEvent("infra-status", "Infra Offline", "Infra Disconnect", newVerifiedInfra, *data_store.Store)

		data_store.Store.Mutex.Lock()
		delete(data_store.Store.ConnectedInfra, request.InfraID)
		data_store.Store.Mutex.Unlock()
		query := bson.D{{"infra_id", request.InfraID}}
		update := bson.D{{"$set", bson.D{{"is_active", false}, {"updated_at", time.Now().UnixMilli()}}}}

		err = r.chaosInfrastructureService.UpdateInfra(query, update)
		if err != nil {
			logrus.Print("Error", err)
		}
	}()

	query := bson.D{{"infra_id", request.InfraID}}
	update := bson.D{{"$set", bson.D{{"is_active", true}, {"updated_at", time.Now().UnixMilli()}, {"version", request.Version}}}}

	err = r.chaosInfrastructureService.UpdateInfra(query, update)
	if err != nil {
		return infraAction, err
	}

	newVerifiedInfra := model.Infra{}
	copier.Copy(&newVerifiedInfra, &verifiedInfra)

	verifiedInfra.IsActive = true
	r.chaosInfrastructureService.SendInfraEvent("infra-status", "Infra Live", "Infra is Live and Connected", newVerifiedInfra, *data_store.Store)
	return infraAction, nil
}

// GetPodLog is the resolver for the getPodLog field.
func (r *subscriptionResolver) GetPodLog(ctx context.Context, request model.PodLogRequest) (<-chan *model.PodLogResponse, error) {
	logrus.Print("NEW LOG REQUEST: ", request.InfraID, request.PodName)
	workflowLog := make(chan *model.PodLogResponse, 1)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.ExperimentLog[reqID.String()] = workflowLog
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		logrus.Print("CLOSED LOG LISTENER: ", request.InfraID, request.PodName)
		delete(data_store.Store.ExperimentLog, reqID.String())
	}()
	go r.chaosExperimentHandler.GetLogs(reqID.String(), request, *data_store.Store)
	return workflowLog, nil
}

// GetKubeObject is the resolver for the getKubeObject field.
func (r *subscriptionResolver) GetKubeObject(ctx context.Context, request model.KubeObjectRequest) (<-chan *model.KubeObjectResponse, error) {
	logrus.Print("NEW KUBEOBJECT REQUEST", request.InfraID)
	kubeObjData := make(chan *model.KubeObjectResponse)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.KubeObjectData[reqID.String()] = kubeObjData
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		logrus.Println("Closed KubeObj Listener")
		delete(data_store.Store.KubeObjectData, reqID.String())
	}()
	go r.chaosExperimentHandler.GetKubeObjData(reqID.String(), request, *data_store.Store)

	return kubeObjData, nil
}

// GetKubeNamespace is the resolver for the getKubeNamespace field.
func (r *subscriptionResolver) GetKubeNamespace(ctx context.Context, request model.KubeNamespaceRequest) (<-chan *model.KubeNamespaceResponse, error) {
	logrus.Print("NEW NAMESPACE REQUEST", request.InfraID)
	kubeNamespaceData := make(chan *model.KubeNamespaceResponse)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.KubeNamespaceData[reqID.String()] = kubeNamespaceData
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		logrus.Println("Closed KubeNamespace Listener")
		delete(data_store.Store.KubeNamespaceData, reqID.String())
	}()
	go r.chaosExperimentHandler.GetKubeNamespaceData(reqID.String(), request, *data_store.Store)

	return kubeNamespaceData, nil
}

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type subscriptionResolver struct{ *Resolver }
