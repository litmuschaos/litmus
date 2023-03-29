package chaoshub

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub/handler"
	chaosHubOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub/ops"
	dbOperationsChaosHub "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/chaoshub"
	dbSchemaChaosHub "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/chaoshub"
	"go.mongodb.org/mongo-driver/bson"
)

const (
	timeInterval = 6 * time.Hour
	defaultPath  = "/tmp/version/"
)

// AddChaosHub is used for Adding a new ChaosHub
func AddChaosHub(ctx context.Context, chaosHub model.CreateChaosHubRequest) (*model.ChaosHub, error) {

	IsExist, err := IsChaosHubAvailable(ctx, chaosHub.HubName, chaosHub.ProjectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("HubName Already exists")
	}

	cloneHub := model.CloningInput{
		ProjectID:     chaosHub.ProjectID,
		RepoBranch:    chaosHub.RepoBranch,
		RepoURL:       chaosHub.RepoURL,
		HubName:       chaosHub.HubName,
		IsPrivate:     chaosHub.IsPrivate,
		UserName:      chaosHub.UserName,
		Password:      chaosHub.Password,
		AuthType:      chaosHub.AuthType,
		Token:         chaosHub.Token,
		SSHPrivateKey: chaosHub.SSHPrivateKey,
	}

	// Initialize a UID for new Hub.
	uuid := uuid.New()
	newHub := &dbSchemaChaosHub.ChaosHub{
		ID:            uuid.String(),
		ProjectID:     chaosHub.ProjectID,
		RepoURL:       chaosHub.RepoURL,
		RepoBranch:    chaosHub.RepoBranch,
		HubName:       chaosHub.HubName,
		IsPrivate:     chaosHub.IsPrivate,
		AuthType:      string(chaosHub.AuthType),
		HubType:       string(model.HubTypeGit),
		Token:         chaosHub.Token,
		UserName:      chaosHub.UserName,
		Password:      chaosHub.Password,
		SSHPrivateKey: chaosHub.SSHPrivateKey,
		SSHPublicKey:  chaosHub.SSHPublicKey,
		IsRemoved:     false,
		CreatedAt:     strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:     strconv.FormatInt(time.Now().Unix(), 10),
		LastSyncedAt:  strconv.FormatInt(time.Now().Unix(), 10),
	}

	// Adding the new hub into database with the given username.
	err = dbOperationsChaosHub.CreateChaosHub(ctx, newHub)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	// Cloning the repository at a path from chaoshub link structure.
	err = chaosHubOps.GitClone(cloneHub)
	if err != nil {
		log.Print("Error", err)
	}

	return newHub.GetOutputChaosHub(), nil
}

func AddRemoteChaosHub(ctx context.Context, chaosHub model.CreateRemoteChaosHub) (*model.ChaosHub, error) {
	IsExist, err := IsChaosHubAvailable(ctx, chaosHub.HubName, chaosHub.ProjectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("HubName Already exists")
	}

	// Initialize a UID for new Hub.
	uuid := uuid.New()
	newHub := &dbSchemaChaosHub.ChaosHub{
		ID:           uuid.String(),
		ProjectID:    chaosHub.ProjectID,
		RepoURL:      chaosHub.RepoURL,
		RepoBranch:   "",
		HubName:      chaosHub.HubName,
		IsPrivate:    false,
		HubType:      string(model.HubTypeRemote),
		AuthType:     string(model.AuthTypeNone),
		IsRemoved:    false,
		CreatedAt:    strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:    strconv.FormatInt(time.Now().Unix(), 10),
		LastSyncedAt: strconv.FormatInt(time.Now().Unix(), 10),
	}

	// Adding the new hub into database with the given name.
	err = dbSchemaChaosHub.CreateChaosHub(ctx, newHub)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	err = handler.DownloadRemoteHub(chaosHub)
	if err != nil {
		err = fmt.Errorf("Hub configurations saved successfully. Failed to connect the remote repo: " + err.Error())
		log.Print("Error", err)
		return nil, err
	}

	return newHub.GetOutputChaosHub(), nil
}

// SaveChaosHub is used for Adding a new ChaosHub
func SaveChaosHub(ctx context.Context, chaosHub model.CreateChaosHubRequest) (*model.ChaosHub, error) {

	IsExist, err := IsChaosHubAvailable(ctx, chaosHub.HubName, chaosHub.ProjectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("HubName Already exists")
	}

	// Initialize a UID for new Hub.
	uuid := uuid.New()
	newHub := &dbSchemaChaosHub.ChaosHub{
		ID:            uuid.String(),
		ProjectID:     chaosHub.ProjectID,
		RepoURL:       chaosHub.RepoURL,
		RepoBranch:    chaosHub.RepoBranch,
		HubName:       chaosHub.HubName,
		IsPrivate:     chaosHub.IsPrivate,
		AuthType:      string(chaosHub.AuthType),
		Token:         chaosHub.Token,
		UserName:      chaosHub.UserName,
		Password:      chaosHub.Password,
		SSHPrivateKey: chaosHub.SSHPrivateKey,
		SSHPublicKey:  chaosHub.SSHPublicKey,
		IsRemoved:     false,
		CreatedAt:     strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:     strconv.FormatInt(time.Now().Unix(), 10),
		LastSyncedAt:  strconv.FormatInt(time.Now().Unix(), 10),
	}

	// Adding the new hub into database with the given username without cloning.
	err = dbOperationsChaosHub.CreateChaosHub(ctx, newHub)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	return newHub.GetOutputChaosHub(), nil
}

// ListHubStatus returns the array of hubdetails with their current status.
func ListHubStatus(ctx context.Context, projectID string) ([]*model.ChaosHubStatus, error) {

	allHubs, err := dbOperationsChaosHub.GetChaosHubByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}
	var hubDetails []*model.ChaosHubStatus
	var isConfirmed bool
	for _, hub := range allHubs {
		sum := 0
		chartsInput := model.CloningInput{
			HubName:    hub.HubName,
			ProjectID:  hub.ProjectID,
			RepoURL:    hub.RepoURL,
			RepoBranch: hub.RepoBranch,
		}
		ChartsPath := handler.GetChartsPath(chartsInput)
		ChartData, err := handler.GetChartsData(ChartsPath)
		if err != nil {
			isConfirmed = false
			sum = 0
		} else {
			isConfirmed = true
			for _, chart := range ChartData {
				sum = sum + len(chart.Spec.Experiments)
			}
		}
		hubDetail := &model.ChaosHubStatus{
			IsAvailable:   isConfirmed,
			ID:            hub.ID,
			RepoURL:       hub.RepoURL,
			HubName:       hub.HubName,
			RepoBranch:    hub.RepoBranch,
			IsPrivate:     hub.IsPrivate,
			AuthType:      model.AuthType(hub.AuthType),
			HubType:       model.HubType(hub.HubType),
			Token:         hub.Token,
			UserName:      hub.UserName,
			Password:      hub.Password,
			SSHPrivateKey: hub.SSHPrivateKey,
			SSHPublicKey:  hub.SSHPublicKey,
			IsRemoved:     hub.IsRemoved,
			LastSyncedAt:  hub.LastSyncedAt,
			TotalExp:      strconv.Itoa(sum),
		}
		hubDetails = append(hubDetails, hubDetail)
	}
	return hubDetails, nil

}

// IsChaosHubAvailable is used for checking if hub already exist or not
func IsChaosHubAvailable(ctx context.Context, hubName string, projectID string) (bool, error) {
	chaosHubs, err := dbOperationsChaosHub.GetChaosHubByProjectID(ctx, projectID)
	if err != nil {
		return true, err
	}

	for _, n := range chaosHubs {
		if n.HubName == hubName {
			return true, nil
		}
	}
	return false, nil
}

// ListCharts is responsible for getting the charts details
func ListCharts(ctx context.Context, hubName string, projectID string) ([]*model.Chart, error) {

	chartsInput := model.CloningInput{}
	chaosHubs, err := dbOperationsChaosHub.GetChaosHubByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}
	for _, n := range chaosHubs {
		if n.HubName == hubName {
			chartsInput = model.CloningInput{
				HubName:    hubName,
				ProjectID:  projectID,
				RepoURL:    n.RepoURL,
				RepoBranch: n.RepoBranch,
			}
		}
	}

	ChartsPath := handler.GetChartsPath(chartsInput)
	ChartsData, err := handler.GetChartsData(ChartsPath)
	if err != nil {
		return nil, err
	}

	return ChartsData, nil
}

// GetHubExperiment is used for getting details of chartserviceversion.yaml.
func GetHubExperiment(ctx context.Context, request model.ExperimentRequest) (*model.Chart, error) {
	var ExperimentPath string

	if strings.ToLower(*request.FileType) != "csv" {
		return nil, errors.New("invalid file type")
	}
	ExperimentPath = handler.GetCSVData(request)

	ExperimentData, err := handler.GetExperimentData(ExperimentPath)
	if err != nil {
		return nil, err
	}
	return ExperimentData, nil
}

// SyncHub is used for syncing the hub again if some not present or some error happens.
func SyncHub(ctx context.Context, hubID string, projectID string) (string, error) {
	chaosHub, err := dbOperationsChaosHub.GetHubByID(ctx, hubID, projectID)
	if err != nil {
		return "", err
	}

	syncHubInput := model.CloningInput{
		HubName:       chaosHub.HubName,
		ProjectID:     chaosHub.ProjectID,
		RepoURL:       chaosHub.RepoURL,
		RepoBranch:    chaosHub.RepoBranch,
		IsPrivate:     chaosHub.IsPrivate,
		UserName:      chaosHub.UserName,
		Password:      chaosHub.Password,
		AuthType:      model.AuthType(chaosHub.AuthType),
		Token:         chaosHub.Token,
		SSHPrivateKey: chaosHub.SSHPrivateKey,
	}

	time := strconv.FormatInt(time.Now().Unix(), 10)
	query := bson.D{{"chaoshub_id", hubID}, {"IsRemoved", false}}
	update := bson.D{{"$set", bson.D{{"last_synced_at", time}}}}

	if chaosHub.HubType == string(model.HubTypeRemote) {
		err = handler.SyncRemoteRepo(syncHubInput)
		if err != nil {
			return "", err
		}
	} else {
		err = chaosHubOps.GitSyncHandlerForProjects(syncHubInput)
		if err != nil {
			return "", err
		}
	}
	// Updating the last_synced_at time using hubID
	err = dbOperationsChaosHub.UpdateChaosHub(ctx, query, update)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	return "Successfully synced ChaosHub", nil
}

// GetYAMLData is responsible for sending the experiment/engine.yaml for a given experiment.
func GetYAMLData(request model.ExperimentRequest) (string, error) {
	if strings.ToLower(*request.FileType) == "csv" || strings.ToLower(*request.FileType) == "workflow" {
		return "", errors.New("invalid file type")
	}
	YAMLPath := handler.GetExperimentYAMLPath(request)
	YAMLData, err := handler.ReadExperimentYAMLFile(YAMLPath)
	if err != nil {
		return "", err
	}
	return YAMLData, nil
}

// GetPredefinedExperimentYAMLData is responsible for sending the workflow.yaml for a given pre-defined workflow.
func GetPredefinedExperimentYAMLData(request model.ExperimentRequest) (string, error) {
	var YAMLPath string
	if request.FileType == nil {
		return "", errors.New("provide a valid filetype")
	}
	if strings.ToLower(*request.FileType) != "workflow" {
		return "", errors.New("invalid file type")
	}
	if strings.ToLower(request.ChartName) == "predefined" && strings.ToLower(*request.FileType) == "workflow" {
		YAMLPath = handler.GetPredefinedExperimentManifest(request)
	}
	YAMLData, err := handler.ReadExperimentYAMLFile(YAMLPath)
	if err != nil {
		return "", err
	}
	return YAMLData, nil
}

// GetExperimentManifestDetails is used to send the ChaosEngine and ChaosExperiment YAMLs
func GetExperimentManifestDetails(ctx context.Context, request model.ExperimentRequest) (*model.ExperimentDetails, error) {

	engineType := model.FileTypeEngine
	experimentType := model.FileTypeExperiment

	engineData, err := GetYAMLData(model.ExperimentRequest{
		ProjectID:      request.ProjectID,
		ChartName:      request.ChartName,
		ExperimentName: request.ExperimentName,
		HubName:        request.HubName,
		FileType:       (*string)(&engineType),
	})
	if err != nil {
		engineData = ""
	}
	experimentData, err := GetYAMLData(model.ExperimentRequest{
		ProjectID:      request.ProjectID,
		ChartName:      request.ChartName,
		ExperimentName: request.ExperimentName,
		HubName:        request.HubName,
		FileType:       (*string)(&experimentType),
	})
	if err != nil {
		experimentData = ""
	}
	experimentDetails := &model.ExperimentDetails{
		EngineDetails:     engineData,
		ExperimentDetails: experimentData,
	}
	return experimentDetails, nil
}

// GetAllHubs ...
func GetAllHubs(ctx context.Context) ([]*model.ChaosHub, error) {

	chaosHubs, err := dbOperationsChaosHub.GetHubs(ctx)
	if err != nil {
		return nil, err
	}

	var outputChaosHubs []*model.ChaosHub
	for _, chaosHub := range chaosHubs {
		outputChaosHubs = append(outputChaosHubs, chaosHub.GetOutputChaosHub())
	}

	return outputChaosHubs, nil
}

func UpdateChaosHub(ctx context.Context, chaosHub model.UpdateChaosHubRequest) (*model.ChaosHub, error) {

	cloneHub := model.CloningInput{
		ProjectID:     chaosHub.ProjectID,
		RepoBranch:    chaosHub.RepoBranch,
		RepoURL:       chaosHub.RepoURL,
		HubName:       chaosHub.HubName,
		IsPrivate:     chaosHub.IsPrivate,
		UserName:      chaosHub.UserName,
		Password:      chaosHub.Password,
		AuthType:      chaosHub.AuthType,
		Token:         chaosHub.Token,
		SSHPrivateKey: chaosHub.SSHPrivateKey,
	}

	prevChaosHub, err := dbOperationsChaosHub.GetHubByID(ctx, chaosHub.ID, chaosHub.ProjectID)
	if err != nil {
		return nil, err
	}
	clonePath := defaultPath + prevChaosHub.ProjectID + "/" + prevChaosHub.HubName
	if prevChaosHub.HubType == string(model.HubTypeRemote) {
		if prevChaosHub.HubName != chaosHub.HubName || prevChaosHub.RepoURL != chaosHub.RepoURL {
			remoteHub := model.CreateRemoteChaosHub{
				HubName:   chaosHub.HubName,
				RepoURL:   chaosHub.RepoURL,
				ProjectID: chaosHub.ProjectID,
			}
			err = os.RemoveAll(clonePath)
			if err != nil {
				return nil, err
			}
			err = handler.DownloadRemoteHub(remoteHub)
			if err != nil {
				return nil, err
			}
		}
	} else {
		// Syncing/Cloning the repository at a path from chaoshub link structure.
		if prevChaosHub.HubName != chaosHub.HubName || prevChaosHub.RepoURL != chaosHub.RepoURL || prevChaosHub.RepoBranch != chaosHub.RepoBranch || prevChaosHub.IsPrivate != chaosHub.IsPrivate || prevChaosHub.AuthType != chaosHub.AuthType.String() {
			err = os.RemoveAll(clonePath)
			if err != nil {
				return nil, err
			}
			err = chaosHubOps.GitClone(cloneHub)
			if err != nil {
				return nil, err
			}
		} else {
			err := chaosHubOps.GitSyncHandlerForProjects(cloneHub)
			if err != nil {
				return nil, err
			}
		}
	}

	time := strconv.FormatInt(time.Now().Unix(), 10)

	query := bson.D{{"chaoshub_id", chaosHub.ID}, {"IsRemoved", false}}
	update := bson.D{{"$set", bson.D{{"repo_url", chaosHub.RepoURL}, {"repo_branch", chaosHub.RepoBranch},
		{"hub_name", chaosHub.HubName}, {"IsPrivate", chaosHub.IsPrivate}, {"AuthType", chaosHub.AuthType},
		{"Token", chaosHub.Token}, {"UserName", chaosHub.UserName}, {"Password", chaosHub.Password},
		{"SSHPrivateKey", chaosHub.SSHPrivateKey}, {"SSHPublicKey", chaosHub.SSHPublicKey}, {"updated_at", time}}}}

	// Updating the new hub into database with the given username.
	err = dbOperationsChaosHub.UpdateChaosHub(ctx, query, update)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	var newChaosHub model.ChaosHub
	copier.Copy(&newChaosHub, &chaosHub)

	newChaosHub.UpdatedAt = time

	return &newChaosHub, nil
}

func DeleteChaosHub(ctx context.Context, hubID string, projectID string) (bool, error) {
	chaosHub, err := dbOperationsChaosHub.GetHubByID(ctx, hubID, projectID)
	if err != nil {
		log.Print("ERROR", err)
		return false, err
	}
	query := bson.D{{"chaoshub_id", hubID}, {"project_id", projectID}}
	update := bson.D{{"$set", bson.D{{"IsRemoved", true}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

	err = dbOperationsChaosHub.UpdateChaosHub(ctx, query, update)
	if err != nil {
		log.Print("ERROR", err)
		return false, err
	}
	clonePath := defaultPath + projectID + "/" + chaosHub.HubName
	err = os.RemoveAll(clonePath)
	if err != nil {
		log.Print("ERROR", err)
		return false, err
	}

	return true, nil
}

// GetIconHandler ...
var GetIconHandler = gin.HandlerFunc(func(c *gin.Context) {
	var (
		projectID          = c.Param("ProjectID")
		hubName            = c.Param("HubName")
		chartName          = c.Param("ChartName")
		iconName           = c.Param("IconName")
		img                *os.File
		err                error
		responseStatusCode = 200
	)

	if strings.ToLower(chartName) == "predefined" {
		img, err = os.Open("/tmp/version/" + projectID + "/" + hubName + "/workflows/icons/" + iconName)
	} else {
		img, err = os.Open("/tmp/version/" + projectID + "/" + hubName + "/charts/" + chartName + "/icons/" + iconName)
	}

	if err != nil {
		responseStatusCode = 500
		fmt.Fprint(c.Writer, "icon cannot be fetched, err : "+err.Error())
	}

	defer img.Close()

	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.WriteHeader(responseStatusCode)
	c.Writer.Header().Set("Content-Type", "image/png") // <-- set the content-type header
	io.Copy(c.Writer, img)
})

// RecurringHubSync is used for syncing
func RecurringHubSync() {
	for {
		// Started Syncing of hubs
		chaosHubs, _ := GetAllHubs(nil)

		for _, chaosHub := range chaosHubs {
			if !chaosHub.IsRemoved {
				chartsInput := model.CloningInput{
					HubName:       chaosHub.HubName,
					ProjectID:     chaosHub.ProjectID,
					RepoURL:       chaosHub.RepoURL,
					RepoBranch:    chaosHub.RepoBranch,
					IsPrivate:     chaosHub.IsPrivate,
					AuthType:      chaosHub.AuthType,
					Token:         chaosHub.Token,
					UserName:      chaosHub.UserName,
					Password:      chaosHub.Password,
					SSHPrivateKey: chaosHub.SSHPrivateKey,
				}
				if chaosHub.HubType != model.HubTypeRemote {
					chaosHubOps.GitSyncHandlerForProjects(chartsInput)
				} else {
					handler.SyncRemoteRepo(chartsInput)
				}
			}
		}

		// Syncing Completed
		time.Sleep(timeInterval)
	}
}

func ListPredefinedWorkflows(hubName string, projectID string) ([]*model.PredefinedWorkflowList, error) {
	workflowsList, err := handler.ListPredefinedWorkflowDetails(hubName, projectID)
	if err != nil {
		return nil, err
	}
	return workflowsList, nil
}
