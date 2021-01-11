package myhub

import (
	"context"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/operations"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/gitops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/handler"
	"go.mongodb.org/mongo-driver/bson"
	"log"
	"strconv"
	"time"
)

//AddMyHub is used for Adding a new MyHub
func AddMyHub(ctx context.Context, myhub model.CreateMyHub, projectID string) (*model.MyHub, error) {

	IsExist, err := IsMyHubAvailable(ctx, myhub.HubName, projectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("HubName Already exists")
	}

	cloneHub := model.CloningInput{
		ProjectID:     projectID,
		RepoBranch:    myhub.RepoBranch,
		RepoURL:       myhub.RepoURL,
		HubName:       myhub.HubName,
		IsPrivate:     myhub.IsPrivate,
		UserName:      myhub.UserName,
		Password:      myhub.Password,
		AuthType:      myhub.AuthType,
		Token:         myhub.Token,
		SSHPrivateKey: myhub.SSHPrivateKey,
	}

	//Cloning the repository at a path from myhub link structure.
	err = gitops.GitClone(cloneHub)
	if err != nil {
		return nil, err
	}

	//Initialize a UID for new Hub.
	uuid := uuid.New()
	newHub := &dbSchema.MyHub{
		ID:            uuid.String(),
		ProjectID:     projectID,
		RepoURL:       myhub.RepoURL,
		RepoBranch:    myhub.RepoBranch,
		HubName:       myhub.HubName,
		IsPrivate:     myhub.IsPrivate,
		AuthType:      string(myhub.AuthType),
		Token:         myhub.Token,
		UserName:      myhub.UserName,
		Password:      myhub.Password,
		SSHPrivateKey: myhub.SSHPrivateKey,
		SSHPublicKey:  myhub.SSHPublicKey,
		IsRemoved:     false,
		CreatedAt:     strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:     strconv.FormatInt(time.Now().Unix(), 10),
		LastSyncedAt:  strconv.FormatInt(time.Now().Unix(), 10),
	}

	//Adding the new hub into database with the given username.
	err = database.CreateMyHub(ctx, newHub)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	return newHub.GetOutputMyHub(), nil
}

//SaveMyHub is used for Adding a new MyHub
func SaveMyHub(ctx context.Context, myhub model.CreateMyHub, projectID string) (*model.MyHub, error) {

	IsExist, err := IsMyHubAvailable(ctx, myhub.HubName, projectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("HubName Already exists")
	}

	//Initialize a UID for new Hub.
	uuid := uuid.New()
	newHub := &dbSchema.MyHub{
		ID:            uuid.String(),
		ProjectID:     projectID,
		RepoURL:       myhub.RepoURL,
		RepoBranch:    myhub.RepoBranch,
		HubName:       myhub.HubName,
		IsPrivate:     myhub.IsPrivate,
		AuthType:      string(myhub.AuthType),
		Token:         myhub.Token,
		UserName:      myhub.UserName,
		Password:      myhub.Password,
		SSHPrivateKey: myhub.SSHPrivateKey,
		SSHPublicKey:  myhub.SSHPublicKey,
		IsRemoved:     false,
		CreatedAt:     strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:     strconv.FormatInt(time.Now().Unix(), 10),
		LastSyncedAt:  strconv.FormatInt(time.Now().Unix(), 10),
	}

	//Adding the new hub into database with the given username without cloning.
	err = database.CreateMyHub(ctx, newHub)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	return newHub.GetOutputMyHub(), nil
}

//HubStatus returns the array of hubdetails with their current status.
func HubStatus(ctx context.Context, projectID string) ([]*model.MyHubStatus, error) {

	allHubs, err := database.GetMyHubByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}
	var hubDetails []*model.MyHubStatus
	var hubDetail *model.MyHubStatus
	var isConfirmed bool
	for _, hub := range allHubs {
		sum := 0
		chartsInput := model.CloningInput{
			HubName:    hub.HubName,
			ProjectID:  hub.ProjectID,
			RepoURL:    hub.RepoURL,
			RepoBranch: hub.RepoBranch,
		}
		ChartsPath := handler.GetChartsPath(ctx, chartsInput)
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
		hubDetail = &model.MyHubStatus{
			IsAvailable:   isConfirmed,
			ID:            hub.ID,
			RepoURL:       hub.RepoURL,
			HubName:       hub.HubName,
			RepoBranch:    hub.RepoBranch,
			IsPrivate:     hub.IsPrivate,
			AuthType:      model.AuthType(hub.AuthType),
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

//IsMyHubAvailable is used for checking if hub already exist or not
func IsMyHubAvailable(ctx context.Context, hubname string, projectID string) (bool, error) {
	myhubs, err := database.GetMyHubByProjectID(ctx, projectID)
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

//GetCharts is responsible for getting the charts details
func GetCharts(ctx context.Context, hubName string, projectID string) ([]*model.Chart, error) {

	chartsInput := model.CloningInput{}
	myhubs, err := database.GetMyHubByProjectID(ctx, projectID)
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

	ChartsPath := handler.GetChartsPath(ctx, chartsInput)
	ChartsData, err := handler.GetChartsData(ChartsPath)
	if err != nil {
		err = gitops.GitClone(chartsInput)
		if err != nil {
			return nil, err
		}
		ChartsData, err = handler.GetChartsData(ChartsPath)
		if err != nil {
			return nil, err
		}
	}

	return ChartsData, nil
}

//GetExperiment is used for getting details of a given experiment using chartserviceversion.yaml.
func GetExperiment(ctx context.Context, experimentInput model.ExperimentInput) (*model.Chart, error) {

	ExperimentPath := handler.GetExperimentChartsVersionYamlPath(ctx, experimentInput)
	ExperimentData, err := handler.GetExperimentData(ExperimentPath)
	if err != nil {
		return nil, err
	}

	return ExperimentData, nil
}

//SyncHub is used for syncing the hub again if some not present or some error happens.
func SyncHub(ctx context.Context, hubID string) ([]*model.MyHubStatus, error) {
	myhub, err := database.GetHubByID(ctx, hubID)
	if err != nil {
		return nil, err
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

	err = gitops.GitSyncHandlerForProjects(syncHubInput)
	if err != nil {
		return nil, err
	}
	//Updating the last_synced_at time using hubID
	err = database.UpdateMyHub(ctx, query, update)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}
	return HubStatus(ctx, syncHubInput.ProjectID)
}

// GetYAMLData is responsible for sending the experiment/engine.yaml for a given experiment.
func GetYAMLData(ctx context.Context, experimentInput model.ExperimentInput) (string, error) {
	YAMLPath := handler.GetExperimentYAMLPath(ctx, experimentInput)
	YAMLData, err := handler.ReadExperimentYAMLFile(YAMLPath)
	if err != nil {
		return "", err
	}
	return YAMLData, nil
}

//GetAllHubs ...
func GetAllHubs(ctx context.Context) ([]*model.MyHub, error) {

	myhubs, err := database.GetHubs(ctx)
	if err != nil {
		return nil, err
	}

	var outputMyHubs []*model.MyHub
	for _, myhub := range myhubs {
		outputMyHubs = append(outputMyHubs, myhub.GetOutputMyHub())
	}

	return outputMyHubs, nil
}

func UpdateMyHub(ctx context.Context, myhub model.UpdateMyHub, projectID string) (*model.MyHub, error) {

	cloneHub := model.CloningInput{
		ProjectID:     projectID,
		RepoBranch:    myhub.RepoBranch,
		RepoURL:       myhub.RepoURL,
		HubName:       myhub.HubName,
		IsPrivate:     myhub.IsPrivate,
		UserName:      myhub.UserName,
		Password:      myhub.Password,
		AuthType:      myhub.AuthType,
		Token:         myhub.Token,
		SSHPrivateKey: myhub.SSHPrivateKey,
	}

	prevMyHub, err := database.GetHubByID(ctx, myhub.ID)
	if err != nil {
		return nil, err
	}

	// Syncing/Cloning the repository at a path from myhub link structure.
	if prevMyHub.RepoURL != myhub.RepoURL || prevMyHub.RepoBranch != myhub.RepoBranch || prevMyHub.IsPrivate != myhub.IsPrivate || prevMyHub.AuthType != myhub.AuthType.String() {
		fmt.Println(myhub.AuthType.String())
		err := gitops.GitClone(cloneHub)
		if err != nil {
			return nil, err
		}
	} else {
		err := gitops.GitSyncHandlerForProjects(cloneHub)
		if err != nil {
			return nil, err
		}
	}

	time := strconv.FormatInt(time.Now().Unix(), 10)

	query := bson.D{{"myhub_id", myhub.ID}, {"IsRemoved", false}}
	update := bson.D{{"$set", bson.D{{"repo_url", myhub.RepoURL}, {"repo_branch", myhub.RepoBranch},
		{"hub_name", myhub.HubName}, {"IsPrivate", myhub.IsPrivate}, {"AuthType", myhub.AuthType},
		{"Token", myhub.Token}, {"UserName", myhub.UserName}, {"Password", myhub.Password},
		{"SSHPrivateKey", myhub.SSHPrivateKey}, {"SSHPublicKey", myhub.SSHPublicKey}, {"updated_at", time}}}}

	//Updating the new hub into database with the given username.
	err = database.UpdateMyHub(ctx, query, update)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	var newMyhub model.MyHub
	copier.Copy(&newMyhub, &myhub)

	newMyhub.UpdatedAt = time

	return &newMyhub, nil
}

func DeleteMyHub(ctx context.Context, hubID string) (bool, error) {
	query := bson.D{{"myhub_id", hubID}}
	update := bson.D{{"$set", bson.D{{"IsRemoved", true}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

	err := database.UpdateMyHub(ctx, query, update)
	if err != nil {
		log.Print("ERROR", err)
		return false, err
	}
	return true, nil
}
