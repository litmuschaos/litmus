package myhub

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jinzhu/copier"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	dbOperationsMyHub "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/myhub"
	dbSchemaMyHub "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/myhub"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/handler"
	myHubOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/ops"
)

const (
	timeInterval = 6 * time.Hour
	defaultPath  = "/tmp/version/"
)

// AddChaosHub is used for Adding a new MyHub
func AddChaosHub(ctx context.Context, chaosHub model.CreateChaosHubRequest) (*model.ChaosHub, error) {

	IsExist, err := IsMyHubAvailable(ctx, chaosHub.HubName, chaosHub.ProjectID)
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
	newHub := &dbSchemaMyHub.MyHub{
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
	err = dbOperationsMyHub.CreateMyHub(ctx, newHub)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	// Cloning the repository at a path from myhub link structure.
	err = myHubOps.GitClone(cloneHub)
	if err != nil {
		log.Print("Error", err)
	}

	return newHub.GetOutputMyHub(), nil
}

func AddRemoteMyHub(ctx context.Context, chaosHub model.CreateRemoteMyHub) (*model.ChaosHub, error) {
	IsExist, err := IsMyHubAvailable(ctx, chaosHub.HubName, chaosHub.ProjectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("HubName Already exists")
	}

	// Initialize a UID for new Hub.
	uuid := uuid.New()
	newHub := &dbSchemaMyHub.MyHub{
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
	err = dbSchemaMyHub.CreateMyHub(ctx, newHub)
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

	return newHub.GetOutputMyHub(), nil
}

// SaveChaosHub is used for Adding a new MyHub
func SaveChaosHub(ctx context.Context, chaosHub model.CreateChaosHubRequest) (*model.ChaosHub, error) {

	IsExist, err := IsMyHubAvailable(ctx, chaosHub.HubName, chaosHub.ProjectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("HubName Already exists")
	}

	// Initialize a UID for new Hub.
	uuid := uuid.New()
	newHub := &dbSchemaMyHub.MyHub{
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
	err = dbOperationsMyHub.CreateMyHub(ctx, newHub)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	return newHub.GetOutputMyHub(), nil
}

// ListHubStatus returns the array of hubdetails with their current status.
func ListHubStatus(ctx context.Context, projectID string) ([]*model.ChaosHubStatus, error) {

	allHubs, err := dbOperationsMyHub.GetMyHubByProjectID(ctx, projectID)
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

// IsMyHubAvailable is used for checking if hub already exist or not
func IsMyHubAvailable(ctx context.Context, hubname string, projectID string) (bool, error) {
	myhubs, err := dbOperationsMyHub.GetMyHubByProjectID(ctx, projectID)
	if err != nil {
		return true, err
	}

	for _, n := range myhubs {
		if n.HubName == hubname {
			return true, nil
		}
	}
	return false, nil
}

// ListCharts is responsible for getting the charts details
func ListCharts(ctx context.Context, hubName string, projectID string) ([]*model.Chart, error) {

	chartsInput := model.CloningInput{}
	myhubs, err := dbOperationsMyHub.GetMyHubByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}
	for _, n := range myhubs {
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
	myhub, err := dbOperationsMyHub.GetHubByID(ctx, hubID, projectID)
	if err != nil {
		return "", err
	}

	syncHubInput := model.CloningInput{
		HubName:       myhub.HubName,
		ProjectID:     myhub.ProjectID,
		RepoURL:       myhub.RepoURL,
		RepoBranch:    myhub.RepoBranch,
		IsPrivate:     myhub.IsPrivate,
		UserName:      myhub.UserName,
		Password:      myhub.Password,
		AuthType:      model.AuthType(myhub.AuthType),
		Token:         myhub.Token,
		SSHPrivateKey: myhub.SSHPrivateKey,
	}

	time := strconv.FormatInt(time.Now().Unix(), 10)
	query := bson.D{{"myhub_id", hubID}, {"IsRemoved", false}}
	update := bson.D{{"$set", bson.D{{"last_synced_at", time}}}}

	if myhub.HubType == string(model.HubTypeRemote) {
		err = handler.SyncRemoteRepo(syncHubInput)
		if err != nil {
			return "", err
		}
	} else {
		err = myHubOps.GitSyncHandlerForProjects(syncHubInput)
		if err != nil {
			return "", err
		}
	}
	// Updating the last_synced_at time using hubID
	err = dbOperationsMyHub.UpdateMyHub(ctx, query, update)
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

	myhubs, err := dbOperationsMyHub.GetHubs(ctx)
	if err != nil {
		return nil, err
	}

	var outputMyHubs []*model.ChaosHub
	for _, myhub := range myhubs {
		outputMyHubs = append(outputMyHubs, myhub.GetOutputMyHub())
	}

	return outputMyHubs, nil
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

	prevMyHub, err := dbOperationsMyHub.GetHubByID(ctx, chaosHub.ID, chaosHub.ProjectID)
	if err != nil {
		return nil, err
	}
	clonePath := defaultPath + prevMyHub.ProjectID + "/" + prevMyHub.HubName
	if prevMyHub.HubType == string(model.HubTypeRemote) {
		if prevMyHub.HubName != chaosHub.HubName || prevMyHub.RepoURL != chaosHub.RepoURL {
			remoteHub := model.CreateRemoteMyHub{
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
		// Syncing/Cloning the repository at a path from myhub link structure.
		if prevMyHub.HubName != chaosHub.HubName || prevMyHub.RepoURL != chaosHub.RepoURL || prevMyHub.RepoBranch != chaosHub.RepoBranch || prevMyHub.IsPrivate != chaosHub.IsPrivate || prevMyHub.AuthType != chaosHub.AuthType.String() {
			err = os.RemoveAll(clonePath)
			if err != nil {
				return nil, err
			}
			err = myHubOps.GitClone(cloneHub)
			if err != nil {
				return nil, err
			}
		} else {
			err := myHubOps.GitSyncHandlerForProjects(cloneHub)
			if err != nil {
				return nil, err
			}
		}
	}

	time := strconv.FormatInt(time.Now().Unix(), 10)

	query := bson.D{{"myhub_id", chaosHub.ID}, {"IsRemoved", false}}
	update := bson.D{{"$set", bson.D{{"repo_url", chaosHub.RepoURL}, {"repo_branch", chaosHub.RepoBranch},
		{"hub_name", chaosHub.HubName}, {"IsPrivate", chaosHub.IsPrivate}, {"AuthType", chaosHub.AuthType},
		{"Token", chaosHub.Token}, {"UserName", chaosHub.UserName}, {"Password", chaosHub.Password},
		{"SSHPrivateKey", chaosHub.SSHPrivateKey}, {"SSHPublicKey", chaosHub.SSHPublicKey}, {"updated_at", time}}}}

	// Updating the new hub into database with the given username.
	err = dbOperationsMyHub.UpdateMyHub(ctx, query, update)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	var newMyhub model.ChaosHub
	copier.Copy(&newMyhub, &chaosHub)

	newMyhub.UpdatedAt = time

	return &newMyhub, nil
}

func DeleteChaosHub(ctx context.Context, hubID string, projectID string) (bool, error) {
	myHub, err := dbOperationsMyHub.GetHubByID(ctx, hubID, projectID)
	if err != nil {
		log.Print("ERROR", err)
		return false, err
	}
	query := bson.D{{"myhub_id", hubID}, {"project_id", projectID}}
	update := bson.D{{"$set", bson.D{{"IsRemoved", true}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

	err = dbOperationsMyHub.UpdateMyHub(ctx, query, update)
	if err != nil {
		log.Print("ERROR", err)
		return false, err
	}
	clonePath := defaultPath + projectID + "/" + myHub.HubName
	err = os.RemoveAll(clonePath)
	if err != nil {
		log.Print("ERROR", err)
		return false, err
	}

	return true, nil
}

// GetIconHandler ...
var GetIconHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var img *os.File
	var err error
	var responseStatusCode int
	if strings.ToLower(vars["ChartName"]) == "predefined" {
		img, err = os.Open("/tmp/version/" + vars["ProjectID"] + "/" + vars["HubName"] + "/workflows/icons/" + vars["IconName"])
		responseStatusCode = 200
		if err != nil {
			responseStatusCode = 500
			fmt.Fprint(w, "icon cannot be fetched, err : "+err.Error())
		}
	} else {
		img, err = os.Open("/tmp/version/" + vars["ProjectID"] + "/" + vars["HubName"] + "/charts/" + vars["ChartName"] + "/icons/" + vars["IconName"])
		responseStatusCode = 200
		if err != nil {
			responseStatusCode = 500
			fmt.Fprint(w, "icon cannot be fetched, err : "+err.Error())
		}
	}
	defer img.Close()
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(responseStatusCode)
	w.Header().Set("Content-Type", "image/png") // <-- set the content-type header
	io.Copy(w, img)
})

// RecurringHubSync is used for syncing
func RecurringHubSync() {
	for {
		// Started Syncing of hubs
		myhubs, _ := GetAllHubs(nil)

		for _, myhub := range myhubs {
			if !myhub.IsRemoved {
				chartsInput := model.CloningInput{
					HubName:       myhub.HubName,
					ProjectID:     myhub.ProjectID,
					RepoURL:       myhub.RepoURL,
					RepoBranch:    myhub.RepoBranch,
					IsPrivate:     myhub.IsPrivate,
					AuthType:      myhub.AuthType,
					Token:         myhub.Token,
					UserName:      myhub.UserName,
					Password:      myhub.Password,
					SSHPrivateKey: myhub.SSHPrivateKey,
				}
				if myhub.HubType != model.HubTypeRemote {
					myHubOps.GitSyncHandlerForProjects(chartsInput)
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
