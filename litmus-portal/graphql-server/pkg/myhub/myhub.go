package myhub

import (
	"context"
	"errors"
	"log"
	"strconv"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/operations"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/gitops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/handler"
)

//AddMyHub is used for Adding a new MyHub
func AddMyHub(ctx context.Context, myhub model.CreateMyHub, username string) (*model.User, error) {

	IsExist, err := IsMyHubAvailable(ctx, myhub, username)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("HubName Already exists")
	}

	cloneHub := model.ChartsInput{
		UserName:   username,
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
		RepoURL:    myhub.RepoURL,
		RepoBranch: myhub.RepoBranch,
		HubName:    myhub.HubName,
	}

	//Adding the new hub into database with the given username.
	err = database.AddNewMyHub(ctx, username, newHub)
	if err != nil {
		log.Print("ERROR", err)
		return nil, err
	}

	//Getting the updated user details from database for sending response back.
	user, err := database.GetUserByUserName(ctx, username)
	if err != nil {
		return nil, err
	}
	outputUser := user.GetOutputUser()
	return outputUser, nil

}

//HubStatus returns the array of hubdetails with their current status.
func HubStatus(ctx context.Context, username string) ([]*model.MyHubStatus, error) {
	user, err := database.GetUserByUserName(ctx, username)
	if err != nil {
		return nil, err
	}

	userHubs := user.GetOutputUser().MyHub

	var hubDetails []*model.MyHubStatus
	var hubDetail *model.MyHubStatus
	var isConfirmed bool
	for i, hub := range userHubs {
		sum := 0
		chartsInput := model.ChartsInput{
			HubName:    userHubs[i].HubName,
			UserName:   user.GetOutputUser().Username,
			RepoURL:    userHubs[i].RepoURL,
			RepoBranch: userHubs[i].RepoBranch,
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
func IsMyHubAvailable(ctx context.Context, myhub model.CreateMyHub, username string) (bool, error) {
	user, err := database.GetUserByUserName(ctx, username)
	if err != nil {
		return true, err
	}
	outputUser := user.GetOutputUser()

	for _, n := range outputUser.MyHub {
		if myhub.HubName == n.HubName {
			return true, nil
		}
	}
	return false, nil
}

//GetCharts is responsible for getting the charts details
func GetCharts(ctx context.Context, chartsInput model.ChartsInput) ([]*model.Chart, error) {

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

//GetExperiment is used for getting details or yaml file of given experiment.
func GetExperiment(ctx context.Context, experimentInput model.ExperimentInput) (*model.Chart, error) {

	ExperimentPath := handler.GetExperimentPath(ctx, experimentInput)
	ExperimentData, err := handler.GetExperimentData(ExperimentPath)
	if err != nil {
		return nil, err
	}

	return ExperimentData, nil
}

//SyncHub is used for syncing the hub again if some not present or some error happens.
func SyncHub(ctx context.Context, syncHubInput model.ChartsInput) ([]*model.MyHubStatus, error) {
	err := gitops.GitSyncHandlerForUser(syncHubInput)
	if err != nil {
		return nil, err
	}
	return HubStatus(ctx, syncHubInput.UserName)
}
