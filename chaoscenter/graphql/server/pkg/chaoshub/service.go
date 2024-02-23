package chaoshub

import (
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub/handler"
	chaosHubOps "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub/ops"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbSchemaChaosHub "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_hub"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
)

const (
	timeInterval               = 6 * time.Hour
	DefaultPath                = "/tmp/"
	DefaultHubID               = "6f39cea9-6264-4951-83a8-29976b614289"
	DefaultHubSyncTimeInterval = 6 * time.Hour
)

type Service interface {
	AddChaosHub(ctx context.Context, chaosHub model.CreateChaosHubRequest, projectID string) (*model.ChaosHub, error)
	AddRemoteChaosHub(ctx context.Context, chaosHub model.CreateRemoteChaosHub, projectID string) (*model.ChaosHub, error)
	SaveChaosHub(ctx context.Context, chaosHub model.CreateChaosHubRequest, projectID string) (*model.ChaosHub, error)
	SyncChaosHub(ctx context.Context, hubID string, projectID string) (string, error)
	UpdateChaosHub(ctx context.Context, chaosHub model.UpdateChaosHubRequest, projectID string) (*model.ChaosHub, error)
	DeleteChaosHub(ctx context.Context, hubID string, projectID string) (bool, error)
	ListChaosFaults(ctx context.Context, hubID string, projectID string) ([]*model.Chart, error)
	GetChaosFault(ctx context.Context, request model.ExperimentRequest, projectID string) (*model.FaultDetails, error)
	GetChaosHub(ctx context.Context, chaosHubID string, projectID string) (*model.ChaosHubStatus, error)
	ListChaosHubs(ctx context.Context, projectID string, request *model.ListChaosHubRequest) ([]*model.ChaosHubStatus, error)
	ListPredefinedExperiments(ctx context.Context, hubID string, projectID string) ([]*model.PredefinedExperimentList, error)
	GetPredefinedExperiment(ctx context.Context, hubID string, experiment []string, projectID string) ([]*model.PredefinedExperimentList, error)
	IsChaosHubAvailable(ctx context.Context, name string, projectID string) (bool, error)
	GetAllHubs(ctx context.Context) ([]*model.ChaosHub, error)
	RecurringHubSync()
	SyncDefaultChaosHubs()
	GetChaosHubStats(ctx context.Context, projectID string) (*model.GetChaosHubStatsResponse, error)
}

type chaosHubService struct {
	chaosHubOperator *dbSchemaChaosHub.Operator
}

// NewService returns a new instance of Service
func NewService(chaosHubOperator *dbSchemaChaosHub.Operator) Service {
	return &chaosHubService{
		chaosHubOperator: chaosHubOperator,
	}
}

// AddChaosHub is used for Adding a new ChaosHub
func (c *chaosHubService) AddChaosHub(ctx context.Context, chaosHub model.CreateChaosHubRequest, projectID string) (*model.ChaosHub, error) {
	if IsExist, err := c.IsChaosHubAvailable(ctx, chaosHub.Name, projectID); err != nil {
		return nil, err
	} else if IsExist == true {
		return nil, errors.New("Name Already exists")
	}
	currentTime := time.Now()
	cloneHub := NewCloningInputFrom(chaosHub)
	description := ""
	if chaosHub.Description != nil {
		description = *chaosHub.Description
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		log.Error("error getting username: ", err)
		return nil, err
	}

	newHub := &dbSchemaChaosHub.ChaosHub{
		ID:         uuid.New().String(),
		ProjectID:  projectID,
		RepoURL:    chaosHub.RepoURL,
		RepoBranch: chaosHub.RepoBranch,
		ResourceDetails: mongodb.ResourceDetails{
			Name:        chaosHub.Name,
			Description: description,
			Tags:        chaosHub.Tags,
		},
		IsPrivate:     chaosHub.IsPrivate,
		AuthType:      string(chaosHub.AuthType),
		HubType:       string(model.HubTypeGit),
		Token:         chaosHub.Token,
		UserName:      chaosHub.UserName,
		Password:      chaosHub.Password,
		SSHPrivateKey: chaosHub.SSHPrivateKey,
		SSHPublicKey:  chaosHub.SSHPublicKey,
		Audit: mongodb.Audit{
			CreatedAt: currentTime.UnixMilli(),
			UpdatedAt: currentTime.UnixMilli(),
			IsRemoved: false,
			CreatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
			UpdatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
		},
		LastSyncedAt: time.Now().UnixMilli(),
		IsDefault:    false,
	}

	// Adding the new hub into database with the given username.
	if err := c.chaosHubOperator.CreateChaosHub(ctx, newHub); err != nil {
		log.Error(err)
		return nil, err
	}

	// Cloning the repository at a path from chaoshub link structure.
	if err := chaosHubOps.GitClone(cloneHub, projectID); err != nil {
		log.Error(err)
	}

	return newHub.GetOutputChaosHub(), nil
}

func (c *chaosHubService) AddRemoteChaosHub(ctx context.Context, chaosHub model.CreateRemoteChaosHub, projectID string) (*model.ChaosHub, error) {
	IsExist, err := c.IsChaosHubAvailable(ctx, chaosHub.Name, projectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("Name Already exists")
	}
	description := ""
	if chaosHub.Description != nil {
		description = *chaosHub.Description
	}
	currentTime := time.Now()

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Error("error getting userID: ", err)
		return nil, err
	}

	newHub := &dbSchemaChaosHub.ChaosHub{
		ID:         uuid.New().String(),
		ProjectID:  projectID,
		RepoURL:    chaosHub.RepoURL,
		RepoBranch: "",
		ResourceDetails: mongodb.ResourceDetails{
			Name:        chaosHub.Name,
			Description: description,
			Tags:        chaosHub.Tags,
		},
		IsPrivate: false,
		HubType:   string(model.HubTypeRemote),
		AuthType:  string(model.AuthTypeNone),
		Audit: mongodb.Audit{
			CreatedAt: currentTime.UnixMilli(),
			UpdatedAt: currentTime.UnixMilli(),
			IsRemoved: false,
			CreatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
			UpdatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
		},
		LastSyncedAt: time.Now().UnixMilli(),
		IsDefault:    false,
	}

	// Adding the new hub into database with the given name.
	err = c.chaosHubOperator.CreateChaosHub(ctx, newHub)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	err = handler.DownloadRemoteHub(chaosHub, projectID)
	if err != nil {
		err = fmt.Errorf("Hub configurations saved successfully. Failed to connect the remote repo: " + err.Error())
		log.Error(err)
		return nil, err
	}

	return newHub.GetOutputChaosHub(), nil
}

// SaveChaosHub is used for Adding a new ChaosHub
func (c *chaosHubService) SaveChaosHub(ctx context.Context, chaosHub model.CreateChaosHubRequest, projectID string) (*model.ChaosHub, error) {

	IsExist, err := c.IsChaosHubAvailable(ctx, chaosHub.Name, projectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("Name Already exists")
	}

	// Initialize a UID for new Hub.
	uuid := uuid.New()
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Error("error getting userID: ", err)
		return nil, err
	}

	description := ""
	if chaosHub.Description != nil {
		description = *chaosHub.Description
	}
	currentTime := time.Now()
	newHub := &dbSchemaChaosHub.ChaosHub{
		ID:         uuid.String(),
		ProjectID:  projectID,
		RepoURL:    chaosHub.RepoURL,
		RepoBranch: chaosHub.RepoBranch,
		ResourceDetails: mongodb.ResourceDetails{
			Name:        chaosHub.Name,
			Description: description,
			Tags:        chaosHub.Tags,
		},
		IsPrivate:     chaosHub.IsPrivate,
		AuthType:      string(chaosHub.AuthType),
		Token:         chaosHub.Token,
		UserName:      chaosHub.UserName,
		Password:      chaosHub.Password,
		SSHPrivateKey: chaosHub.SSHPrivateKey,
		SSHPublicKey:  chaosHub.SSHPublicKey,
		Audit: mongodb.Audit{
			CreatedAt: currentTime.UnixMilli(),
			UpdatedAt: currentTime.UnixMilli(),
			IsRemoved: false,
			CreatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
			UpdatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
		},
		LastSyncedAt: time.Now().UnixMilli(),
	}

	// Adding the new hub into database with the given username without cloning.
	err = c.chaosHubOperator.CreateChaosHub(ctx, newHub)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	return newHub.GetOutputChaosHub(), nil
}

// SyncChaosHub is used for syncing the hub again if some not present or some error happens.
func (c *chaosHubService) SyncChaosHub(ctx context.Context, hubID string, projectID string) (string, error) {
	chaosHub, err := c.chaosHubOperator.GetHubByID(ctx, hubID, projectID)
	if err != nil {
		return "", err
	}

	syncHubInput := model.CloningInput{
		Name:          chaosHub.Name,
		RepoURL:       chaosHub.RepoURL,
		RepoBranch:    chaosHub.RepoBranch,
		IsPrivate:     chaosHub.IsPrivate,
		UserName:      chaosHub.UserName,
		Password:      chaosHub.Password,
		AuthType:      model.AuthType(chaosHub.AuthType),
		Token:         chaosHub.Token,
		SSHPrivateKey: chaosHub.SSHPrivateKey,
		IsDefault:     false,
	}

	time := time.Now().UnixMilli()
	query := bson.D{{"hub_id", hubID}, {"is_removed", false}}
	update := bson.D{{"$set", bson.D{{"last_synced_at", time}}}}

	if chaosHub.HubType == string(model.HubTypeRemote) {
		err = handler.SyncRemoteRepo(syncHubInput, projectID)
		if err != nil {
			return "", err
		}
	} else {
		err = chaosHubOps.GitSyncHandlerForProjects(syncHubInput, projectID)
		if err != nil {
			return "", err
		}
	}
	// Updating the last_synced_at time using hubID
	err = c.chaosHubOperator.UpdateChaosHub(ctx, query, update)
	if err != nil {
		log.Error(err)
		return "", err
	}
	return "Successfully synced ChaosHub", nil
}

func (c *chaosHubService) UpdateChaosHub(ctx context.Context, chaosHub model.UpdateChaosHubRequest, projectID string) (*model.ChaosHub, error) {

	cloneHub := model.CloningInput{
		RepoBranch:    chaosHub.RepoBranch,
		RepoURL:       chaosHub.RepoURL,
		Name:          chaosHub.Name,
		IsPrivate:     chaosHub.IsPrivate,
		UserName:      chaosHub.UserName,
		Password:      chaosHub.Password,
		AuthType:      chaosHub.AuthType,
		Token:         chaosHub.Token,
		SSHPrivateKey: chaosHub.SSHPrivateKey,
		IsDefault:     false,
	}
	fmt.Println(chaosHub.SSHPrivateKey)
	prevChaosHub, err := c.chaosHubOperator.GetHubByID(ctx, chaosHub.ID, projectID)
	if err != nil {
		return nil, err
	}
	clonePath := DefaultPath + prevChaosHub.ProjectID + "/" + prevChaosHub.Name
	if prevChaosHub.HubType == string(model.HubTypeRemote) {
		if prevChaosHub.Name != chaosHub.Name || prevChaosHub.RepoURL != chaosHub.RepoURL {
			remoteHub := model.CreateRemoteChaosHub{
				Name:    chaosHub.Name,
				RepoURL: chaosHub.RepoURL,
			}
			err = os.RemoveAll(clonePath)
			if err != nil {
				return nil, err
			}
			err = handler.DownloadRemoteHub(remoteHub, projectID)
			if err != nil {
				return nil, err
			}
		}
	} else {
		// Syncing/Cloning the repository at a path from chaoshub link structure.
		if prevChaosHub.Name != chaosHub.Name || prevChaosHub.RepoURL != chaosHub.RepoURL || prevChaosHub.RepoBranch != chaosHub.RepoBranch || prevChaosHub.IsPrivate != chaosHub.IsPrivate || prevChaosHub.AuthType != chaosHub.AuthType.String() {
			err = os.RemoveAll(clonePath)
			if err != nil {
				return nil, err
			}
			err = chaosHubOps.GitClone(cloneHub, projectID)
			if err != nil {
				return nil, err
			}
		} else {
			err := chaosHubOps.GitSyncHandlerForProjects(cloneHub, projectID)
			if err != nil {
				return nil, err
			}
		}
	}

	time := time.Now().UnixMilli()
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	query := bson.D{{"hub_id", chaosHub.ID}, {"is_removed", false}}
	update := bson.D{
		{"$set", bson.D{
			{"repo_url", chaosHub.RepoURL},
			{"repo_branch", chaosHub.RepoBranch},
			{"name", chaosHub.Name},
			{"description", chaosHub.Description},
			{"tags", chaosHub.Tags},
			{"is_private", chaosHub.IsPrivate},
			{"auth_type", chaosHub.AuthType},
			{"token", chaosHub.Token},
			{"username", chaosHub.UserName},
			{"password", chaosHub.Password},
			{"ssh_private_key", chaosHub.SSHPrivateKey},
			{"ssh_public_key", chaosHub.SSHPublicKey},
			{"updated_at", time},
			{"updated_by", mongodb.UserDetailResponse{
				Username: username,
			}},
		},
		},
	}

	// Updating the new hub into database with the given username.
	err = c.chaosHubOperator.UpdateChaosHub(ctx, query, update)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	var newChaosHub model.ChaosHub
	copier.Copy(&newChaosHub, &chaosHub)

	newChaosHub.UpdatedAt = strconv.FormatInt(time, 10)

	return &newChaosHub, nil
}

func (c *chaosHubService) DeleteChaosHub(ctx context.Context, hubID string, projectID string) (bool, error) {
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	chaosHub, err := c.chaosHubOperator.GetHubByID(ctx, hubID, projectID)
	if err != nil {
		log.Error(err)
		return false, err
	}
	query := bson.D{
		{"hub_id", hubID},
		{"project_id", projectID},
	}
	update := bson.D{
		{"$set", bson.D{
			{"is_removed", true},
			{"updated_at", time.Now().UnixMilli()},
			{"updated_by", mongodb.UserDetailResponse{
				Username: username,
			}},
		},
		},
	}

	err = c.chaosHubOperator.UpdateChaosHub(ctx, query, update)
	if err != nil {
		log.Error(err)
		return false, err
	}
	clonePath := DefaultPath + projectID + "/" + chaosHub.Name
	err = os.RemoveAll(clonePath)
	if err != nil {
		log.Error(err)
		return false, err
	}

	return true, nil
}

// ListChaosFaults is responsible for getting the charts details
func (c *chaosHubService) ListChaosFaults(ctx context.Context, hubID string, projectID string) ([]*model.Chart, error) {

	chartsInput := model.CloningInput{}
	hub, err := c.getChaosHubDetails(ctx, hubID, projectID)
	if err != nil {
		return nil, err
	}
	chartsInput = model.CloningInput{
		Name:       hub.Name,
		RepoURL:    hub.RepoURL,
		RepoBranch: hub.RepoBranch,
	}

	ChartsPath := handler.GetChartsPath(chartsInput, projectID, hub.IsDefault)
	ChartsData, err := handler.GetChartsData(ChartsPath)
	if err != nil {
		return nil, err
	}

	return ChartsData, nil
}

// GetChaosFault is used for getting details of chartserviceversion.yaml.
func (c *chaosHubService) GetChaosFault(ctx context.Context, request model.ExperimentRequest, projectID string) (*model.FaultDetails, error) {
	chaosHub, err := c.getChaosHubDetails(ctx, request.HubID, projectID)
	if err != nil {
		return nil, err
	}
	var basePath string
	if chaosHub.IsDefault {
		basePath = "/tmp/default/" + chaosHub.Name + "/faults/" + request.Category + "/" + request.ExperimentName
	} else {
		basePath = DefaultPath + projectID + "/" + chaosHub.Name + "/faults/" + request.Category + "/" + request.ExperimentName
	}

	//Get fault chartserviceversion.yaml data
	csvPath := basePath + "/" + request.ExperimentName + ".chartserviceversion.yaml"
	csvYaml, err := ioutil.ReadFile(csvPath)
	if err != nil {
		csvYaml = []byte("")
	}

	//Get engine.yaml data
	enginePath := basePath + "/" + "engine.yaml"
	engineYaml, err := ioutil.ReadFile(enginePath)
	if err != nil {
		engineYaml = []byte("")
	}

	//Get fault.yaml data
	faultPath := basePath + "/" + "fault.yaml"
	faultYaml, err := ioutil.ReadFile(faultPath)
	if err != nil {
		faultYaml = []byte("")
	}

	return &model.FaultDetails{
		CSV:    string(csvYaml),
		Engine: string(engineYaml),
		Fault:  string(faultYaml),
	}, nil
}

// ListChaosHubs returns the array of hubdetails with their current status.
func (c *chaosHubService) ListChaosHubs(ctx context.Context, projectID string, request *model.ListChaosHubRequest) ([]*model.ChaosHubStatus, error) {
	defaultHub := c.listDefaultHubs()
	updatedDefaultHub := dbSchemaChaosHub.ChaosHub{
		ID: defaultHub.ID,
		ResourceDetails: mongodb.ResourceDetails{
			Name: defaultHub.Name,
		},
		RepoURL:    defaultHub.RepoURL,
		RepoBranch: defaultHub.RepoBranch,
		IsDefault:  true,
	}

	var pipeline mongo.Pipeline

	// Match with identifiers
	matchIdentifierStage := bson.D{
		{"$match", bson.D{
			{"project_id", projectID},
			{"is_removed", false},
		}},
	}
	pipeline = append(pipeline, matchIdentifierStage)

	if request != nil {
		// Match the ChaosHub IDs from the input array
		if request.ChaosHubIDs != nil && len(request.ChaosHubIDs) != 0 {
			matchHubIdStage := bson.D{
				{"$match", bson.D{
					{"hub_id", bson.D{
						{"$in", request.ChaosHubIDs},
					}},
				}},
			}

			pipeline = append(pipeline, matchHubIdStage)
		}

		// Filtering based on given parameters
		if request.Filter != nil {
			// Filtering based on chaos_infra name
			if request.Filter.ChaosHubName != nil && *request.Filter.ChaosHubName != "" {
				matchHubNameStage := bson.D{
					{"$match", bson.D{
						{"name", bson.M{
							"$regex": request.Filter.ChaosHubName, "$options": "mix",
						}},
					}},
				}
				pipeline = append(pipeline, matchHubNameStage)
			}
			// Filtering based on description
			if request.Filter.Description != nil && *request.Filter.Description != "" {
				matchDescriptionStage := bson.D{
					{"$match", bson.D{
						{"description", bson.M{
							"$regex": request.Filter.Description, "$options": "mix",
						}},
					}},
				}
				pipeline = append(pipeline, matchDescriptionStage)
			}
			// Filtering based on tags
			if request.Filter.Tags != nil && len(request.Filter.Tags) > 0 {
				matchHubTagsStage := bson.D{
					{"$match", bson.D{
						{"tags", bson.D{
							{"$all", request.Filter.Tags},
						}},
					}},
				}
				pipeline = append(pipeline, matchHubTagsStage)
			}
		}
	}

	var allHubs []dbSchemaChaosHub.ChaosHub

	hubCursor, err := c.chaosHubOperator.GetAggregateChaosHubs(ctx, pipeline)
	if err != nil {
		return nil, err
	}

	err = hubCursor.All(context.Background(), &allHubs)
	if err != nil {
		return nil, err
	}

	var (
		hubDetails []*model.ChaosHubStatus
	)
	allHubs = append([]dbSchemaChaosHub.ChaosHub{updatedDefaultHub}, allHubs...)

	for _, hub := range allHubs {
		sum := 0
		experimentCount := 0
		isConfirmed := false
		var chartPath string
		if hub.IsDefault {
			chartPath = DefaultPath + "default/" + hub.Name + "/faults/"
		} else {
			chartPath = DefaultPath + hub.ProjectID + "/" + hub.Name + "/faults/"
		}
		chartsData, err := handler.GetChartsData(chartPath)
		if err != nil {
			sum = 0
		} else {
			for _, chart := range chartsData {
				sum = sum + len(chart.Spec.Faults)
			}
		}
		wfs, err := c.ListPredefinedExperiments(ctx, hub.ID, projectID)
		if err != nil {
			experimentCount = 0
		}
		experimentCount = len(wfs)

		isConfirmed, err = handler.ValidateLocalRepository(hub)
		if err != nil {
			isConfirmed = false
		}

		hubDesc := hub.Description

		hubDetail := &model.ChaosHubStatus{
			IsAvailable:      isConfirmed,
			ID:               hub.ID,
			RepoURL:          hub.RepoURL,
			IsDefault:        hub.IsDefault,
			IsPrivate:        hub.IsPrivate,
			Name:             hub.Name,
			Description:      &hubDesc,
			RepoBranch:       hub.RepoBranch,
			Tags:             hub.Tags,
			Token:            hub.Token,
			SSHPublicKey:     hub.SSHPublicKey,
			SSHPrivateKey:    hub.SSHPrivateKey,
			AuthType:         model.AuthType(hub.AuthType),
			LastSyncedAt:     strconv.FormatInt(hub.LastSyncedAt, 10),
			TotalFaults:      strconv.Itoa(sum),
			TotalExperiments: strconv.Itoa(experimentCount),
			CreatedAt:        strconv.Itoa(int(hub.CreatedAt)),
			UpdatedAt:        strconv.Itoa(int(hub.UpdatedAt)),
			CreatedBy:        &model.UserDetails{Username: hub.CreatedBy.Username},
			UpdatedBy:        &model.UserDetails{Username: hub.UpdatedBy.Username},
		}
		hubDetails = append(hubDetails, hubDetail)
	}

	return hubDetails, nil
}

// GetChaosHub returns details of a requested hub
func (c *chaosHubService) GetChaosHub(ctx context.Context, chaosHubID string, projectID string) (*model.ChaosHubStatus, error) {

	hub, err := c.chaosHubOperator.GetHubByID(ctx, chaosHubID, projectID)
	if err != nil {
		return &model.ChaosHubStatus{}, errors.New("DB fetch stage error: " + err.Error())
	}

	sum := 0
	experimentCount := 0
	var chartPath string
	if hub.IsDefault {
		chartPath = DefaultPath + "default/" + hub.Name
	} else {
		chartPath = DefaultPath + hub.ProjectID + "/" + hub.Name
	}
	chartsData, err := handler.GetChartsData(chartPath)
	if err != nil {
		sum = 0
	} else {
		for _, chart := range chartsData {
			sum = sum + len(chart.Spec.Faults)
		}
	}
	wfs, err := c.ListPredefinedExperiments(ctx, hub.ID, projectID)
	if err != nil {
		experimentCount = 0
	}
	experimentCount = len(wfs)

	isConfirmed, err := handler.ValidateLocalRepository(hub)
	if err != nil {
		isConfirmed = false
	}

	hubDesc := hub.Description

	hubDetail := &model.ChaosHubStatus{
		IsAvailable:      isConfirmed,
		ID:               hub.ID,
		RepoURL:          hub.RepoURL,
		Name:             hub.Name,
		Description:      &hubDesc,
		RepoBranch:       hub.RepoBranch,
		Tags:             hub.Tags,
		AuthType:         model.AuthType(hub.AuthType),
		LastSyncedAt:     strconv.FormatInt(hub.LastSyncedAt, 10),
		TotalFaults:      strconv.Itoa(sum),
		TotalExperiments: strconv.Itoa(experimentCount),
		CreatedAt:        strconv.Itoa(int(hub.CreatedAt)),
		UpdatedAt:        strconv.Itoa(int(hub.UpdatedAt)),
		CreatedBy:        &model.UserDetails{Username: hub.CreatedBy.Username},
		UpdatedBy:        &model.UserDetails{Username: hub.UpdatedBy.Username},
	}

	return hubDetail, nil
}

func (c *chaosHubService) ListPredefinedExperiments(ctx context.Context, hubID string, projectID string) ([]*model.PredefinedExperimentList, error) {
	hub, err := c.getChaosHubDetails(ctx, hubID, projectID)
	if err != nil {
		return nil, err
	}

	var hubPath string
	if hub.IsDefault {
		hubPath = "/tmp/default/" + hub.Name + "/experiments/"
	} else {
		hubPath = DefaultPath + projectID + "/" + hub.Name + "/experiments/"
	}
	var predefinedWorkflows []*model.PredefinedExperimentList
	files, err := ioutil.ReadDir(hubPath)
	if err != nil {
		return nil, err
	}

	for _, file := range files {
		if file.Name() != "icons" {
			preDefinedWorkflow := c.getPredefinedExperimentDetails(hubPath, file.Name())
			if preDefinedWorkflow.ExperimentCSV != "" {
				predefinedWorkflows = append(predefinedWorkflows, preDefinedWorkflow)
			}
		}
	}
	return predefinedWorkflows, nil
}

func (c *chaosHubService) getChaosHubDetails(ctx context.Context, hubID string, projectID string) (model.ChaosHub, error) {

	defaultHub := c.listDefaultHubs()
	if defaultHub.ID == hubID {
		return *defaultHub, nil
	}

	hub, err := c.chaosHubOperator.GetHubByID(ctx, hubID, projectID)
	if err != nil {
		return model.ChaosHub{}, errors.New("DB fetch stage error: " + err.Error())
	}

	return model.ChaosHub{
		ID:           hub.ID,
		ProjectID:    hub.ProjectID,
		RepoURL:      hub.RepoURL,
		RepoBranch:   hub.RepoBranch,
		AuthType:     model.AuthType(hub.AuthType),
		Name:         hub.Name,
		CreatedAt:    strconv.Itoa(int(hub.CreatedAt)),
		UpdatedAt:    strconv.Itoa(int(hub.UpdatedAt)),
		LastSyncedAt: strconv.FormatInt(hub.LastSyncedAt, 10),
		Tags:         hub.Tags,
		Description:  &hub.Description,
		//TODO util functions for this
		CreatedBy: &model.UserDetails{Username: hub.CreatedBy.Username},
		UpdatedBy: &model.UserDetails{Username: hub.UpdatedBy.Username},
	}, nil
}

func (c *chaosHubService) GetPredefinedExperiment(ctx context.Context, hubID string, experiments []string, projectID string) ([]*model.PredefinedExperimentList, error) {
	hub, err := c.getChaosHubDetails(ctx, hubID, projectID)
	if err != nil {
		return nil, err
	}
	var hubPath string
	if hub.IsDefault {
		hubPath = "/tmp/default/" + hub.Name + "/experiments/"
	} else {
		hubPath = DefaultPath + projectID + "/" + hub.Name + "/experiments/"
	}
	var predefinedWorkflows []*model.PredefinedExperimentList

	for _, experiment := range experiments {
		preDefinedWorkflow := c.getPredefinedExperimentDetails(hubPath, experiment)
		if preDefinedWorkflow.ExperimentCSV != "" {
			predefinedWorkflows = append(predefinedWorkflows, preDefinedWorkflow)
		}
	}

	return predefinedWorkflows, nil
}

func (c *chaosHubService) getPredefinedExperimentDetails(experimentsPath string, experiment string) *model.PredefinedExperimentList {
	var (
		csvManifest        = ""
		workflowManifest   = ""
		path               = experimentsPath + experiment + "/" + experiment + ".chartserviceversion.yaml"
		isExist            = true
		preDefinedWorkflow = &model.PredefinedExperimentList{}
	)
	_, err := os.Stat(path)
	if err != nil {
		isExist = false
	}

	if isExist {
		yamlData, err := ioutil.ReadFile(experimentsPath + experiment + "/" + experiment + ".chartserviceversion.yaml")
		if err != nil {
			csvManifest = ""
		}

		csvManifest = string(yamlData)

		yamlData, err = ioutil.ReadFile(experimentsPath + experiment + "/" + "experiment.yaml")
		if err != nil {
			workflowManifest = ""
		}

		workflowManifest = string(yamlData)

		preDefinedWorkflow = &model.PredefinedExperimentList{
			ExperimentName:     experiment,
			ExperimentManifest: workflowManifest,
			ExperimentCSV:      csvManifest,
		}
	}

	return preDefinedWorkflow
}

// GetExperimentManifestDetails is used to send the ChaosEngine and ChaosExperiment YAMLs
//func (c *chaosHubService) GetExperimentManifestDetails(ctx context.Context, request model.ExperimentRequest, projectID string) (*model.ExperimentDetails, error) {
//
//	engineType := model.FileTypeEngine
//	experimentType := model.FileTypeExperiment
//
//	engineData, err := c.GetYAMLData(model.ExperimentRequest{
//		ChartName:      request.ChartName,
//		ExperimentName: request.ExperimentName,
//		Name:           request.Name,
//		FileType:       (*string)(&engineType),
//	}, projectID)
//	if err != nil {
//		engineData = ""
//	}
//	experimentData, err := c.GetYAMLData(model.ExperimentRequest{
//		ChartName:      request.ChartName,
//		ExperimentName: request.ExperimentName,
//		Name:           request.Name,
//		FileType:       (*string)(&experimentType),
//	}, projectID)
//	if err != nil {
//		experimentData = ""
//	}
//	experimentDetails := &model.ExperimentDetails{
//		EngineDetails:     engineData,
//		ExperimentDetails: experimentData,
//	}
//	return experimentDetails, nil
//}

//func (c *chaosHubService) ListPredefinedWorkflows(name string, projectID string) ([]*model.PredefinedWorkflowList, error) {
//	workflowsList, err := handler.ListPredefinedWorkflowDetails(name, projectID)
//	if err != nil {
//		return nil, err
//	}
//	return workflowsList, nil
//}

// GetPredefinedExperimentYAMLData is responsible for sending the workflow.yaml for a given pre-defined workflow.
//func (c *chaosHubService) GetPredefinedExperimentYAMLData(request model.ExperimentRequest, projectID string) (string, error) {
//	var YAMLPath string
//	if request.FileType == nil {
//		return "", errors.New("provide a valid filetype")
//	}
//	if strings.ToLower(*request.FileType) != "workflow" {
//		return "", errors.New("invalid file type")
//	}
//	if strings.ToLower(request.ChartName) == "predefined" && strings.ToLower(*request.FileType) == "workflow" {
//		YAMLPath = handler.GetPredefinedExperimentManifest(request, projectID)
//	}
//	YAMLData, err := handler.ReadExperimentYAMLFile(YAMLPath)
//	if err != nil {
//		return "", err
//	}
//	return YAMLData, nil
//}

// IsChaosHubAvailable is used for checking if hub already exist or not
func (c *chaosHubService) IsChaosHubAvailable(ctx context.Context, name string, projectID string) (bool, error) {
	chaosHubs, err := c.chaosHubOperator.GetChaosHubByProjectID(ctx, projectID)
	if err != nil {
		return true, err
	}

	for _, n := range chaosHubs {
		if n.Name == name {
			return true, nil
		}
	}
	return false, nil
}

// GetAllHubs ...
func (c *chaosHubService) GetAllHubs(ctx context.Context) ([]*model.ChaosHub, error) {

	chaosHubs, err := c.chaosHubOperator.GetHubs(ctx)
	if err != nil {
		return nil, err
	}

	var outputChaosHubs []*model.ChaosHub
	for _, chaosHub := range chaosHubs {
		outputChaosHubs = append(outputChaosHubs, chaosHub.GetOutputChaosHub())
	}

	return outputChaosHubs, nil
}

// RecurringHubSync is used for syncing
func (c *chaosHubService) RecurringHubSync() {
	for {
		// Started Syncing of hubs
		chaosHubs, _ := c.GetAllHubs(nil)

		for _, chaosHub := range chaosHubs {
			if !chaosHub.IsRemoved {
				chartsInput := model.CloningInput{
					Name:          chaosHub.Name,
					RepoURL:       chaosHub.RepoURL,
					RepoBranch:    chaosHub.RepoBranch,
					IsPrivate:     chaosHub.IsPrivate,
					AuthType:      chaosHub.AuthType,
					Token:         chaosHub.Token,
					UserName:      chaosHub.UserName,
					Password:      chaosHub.Password,
					SSHPrivateKey: chaosHub.SSHPrivateKey,
					IsDefault:     false,
				}
				if chaosHub.HubType != model.HubTypeRemote {
					err := chaosHubOps.GitSyncHandlerForProjects(chartsInput, chaosHub.ProjectID)
					if err != nil {
						log.Error(err)
					}
				} else {
					err := handler.SyncRemoteRepo(chartsInput, chaosHub.ProjectID)
					if err != nil {
						log.Error(err)
					}
				}
			}
		}

		// Syncing Completed
		time.Sleep(timeInterval)
	}
}

// GetChaosHubStats returns stats related to Chaos Hubs
func (c *chaosHubService) GetChaosHubStats(ctx context.Context, projectID string) (*model.GetChaosHubStatsResponse, error) {

	var pipeline mongo.Pipeline
	// Match with identifiers
	matchIdentifierStage := bson.D{
		{"$match", bson.D{
			{"project_id", projectID},
			{"is_removed", false},
		}},
	}

	facetStage := bson.D{
		{"$facet", bson.D{
			{"total_chaos_hubs", bson.A{
				matchIdentifierStage,
				bson.D{{"$count", "count"}},
			}},
		}},
	}

	pipeline = append(pipeline, facetStage)
	// Call aggregation on pipeline
	hubCursor, err := c.chaosHubOperator.GetAggregateChaosHubs(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	var res []dbSchemaChaosHub.AggregatedChaosHubStats

	if err = hubCursor.All(ctx, &res); err != nil || len(res) == 0 || len(res[0].TotalChaosHubs) == 0 {
		return &model.GetChaosHubStatsResponse{
			TotalChaosHubs: 1,
		}, err
	}

	return &model.GetChaosHubStatsResponse{
		TotalChaosHubs: res[0].TotalChaosHubs[0].Count + 1,
	}, nil

}

func (c *chaosHubService) listDefaultHubs() *model.ChaosHub {
	defaultHubs := &model.ChaosHub{
		ID:         DefaultHubID,
		Name:       "Litmus ChaosHub",
		RepoURL:    "https://github.com/litmuschaos/chaos-charts",
		RepoBranch: utils.Config.DefaultHubBranchName,
		IsDefault:  true,
	}
	return defaultHubs
}

func (c *chaosHubService) SyncDefaultChaosHubs() {
	log.Infof("syncing default chaos hub directories")
	for {
		defaultHub := c.listDefaultHubs()

		chartsInput := model.CloningInput{
			Name:       defaultHub.Name,
			RepoURL:    defaultHub.RepoURL,
			RepoBranch: defaultHub.RepoBranch,
			IsDefault:  true,
		}
		err := chaosHubOps.GitSyncDefaultHub(chartsInput)
		if err != nil {
			log.WithFields(log.Fields{
				"repoUrl":    defaultHub.RepoURL,
				"repoBranch": defaultHub.RepoBranch,
				"hubName":    defaultHub.Name,
			}).WithError(err).Error("failed to sync default chaos hubs")
		}
		// Syncing Completed
		time.Sleep(DefaultHubSyncTimeInterval)
	}
}
