package myhub

import (
	"context"
	"errors"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/operations"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/gitops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/handler"
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
		ProjectID:  projectID,
		RepoBranch: myhub.RepoBranch,
		RepoURL:    myhub.RepoURL,
		HubName:    myhub.HubName,
	}

	//Cloning the repository at a path from myhub link structure.
	err = gitops.GitClone(cloneHub)
	if err != nil {
		return nil, err
	}

	//Initialize a UID for new Hub.
	uuid := uuid.New()
	newHub := &dbSchema.MyHub{
		ID:         uuid.String(),
		ProjectID:  projectID,
		RepoURL:    myhub.RepoURL,
		RepoBranch: myhub.RepoBranch,
		HubName:    myhub.HubName,
		CreatedAt:  strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:  strconv.FormatInt(time.Now().Unix(), 10),
	}

	//Adding the new hub into database with the given username.
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
			IsAvailable: isConfirmed,
			ID:          hub.ID,
			RepoURL:     hub.RepoURL,
			HubName:     hub.HubName,
			RepoBranch:  hub.RepoBranch,
			TotalExp:    strconv.Itoa(sum),
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
func SyncHub(ctx context.Context, projectID string, hubName string) ([]*model.MyHubStatus, error) {
	syncHubInput := model.CloningInput{}
	myhubs, err := database.GetMyHubByProjectID(ctx, projectID)
	for _, n := range myhubs {
		if n.HubName == hubName {
			syncHubInput = model.CloningInput{
				HubName:    hubName,
				ProjectID:  projectID,
				RepoURL:    n.RepoURL,
				RepoBranch: n.RepoBranch,
			}
		}
	}
	err = gitops.GitSyncHandlerForProjects(syncHubInput)
	if err != nil {
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
