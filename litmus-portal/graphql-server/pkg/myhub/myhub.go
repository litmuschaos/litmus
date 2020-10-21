package myhub

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/operations"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/gitops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/handler"
)

//AddMyHub ...
func AddMyHub(ctx context.Context, myhub model.CreateMyHub, username string) (*model.User, error) {

	gitLink := strings.Split(myhub.GitURL, "/")
	owner := gitLink[3]
	repo := gitLink[4]

	//Checking if the link and branch are existing or not.
	response, err := http.Get("https://api.github.com/repos/" + owner + "/" + repo + "/branches/" + myhub.GitBranch)
	if err != nil {
		log.Print(err)
		return nil, err
	}
	data := response.StatusCode

	//If link and branch are good, then check if they are already present or not.
	if data >= 200 && data <= 299 {
		IsExist, err := IsMyHubAvailable(ctx, myhub, username)
		if err != nil {
			return nil, err
		}
		if IsExist == true {
			return nil, err
		}

		fmt.Println("HTTP Status is in the 2xx range")
		//Initialize a UID for new Hub.
		uuid := uuid.New()
		newHub := &dbSchema.MyHub{
			ID:        uuid.String(),
			GitURL:    myhub.GitURL,
			GitBranch: myhub.GitBranch,
			HubName:   myhub.HubName,
		}

		//Adding the new hub into database with the given username.
		err = database.AddNewMyHub(ctx, username, newHub)
		if err != nil {
			log.Print("ERROR", err)
			return nil, err
		}

		//Cloning the repository at a path from myhub link structure.
		err = gitops.GitClone(username, repo, myhub.GitBranch, owner, myhub.HubName)
		if err != nil {
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

	return nil, err
}

//IsMyHubAvailable ...
func IsMyHubAvailable(ctx context.Context, myhub model.CreateMyHub, username string) (bool, error) {
	user, err := database.GetUserByUserName(ctx, username)
	if err != nil {
		return true, err
	}
	outputUser := user.GetOutputUser()

	for _, n := range outputUser.MyHub {
		if myhub.GitURL == n.GitURL && myhub.GitBranch == n.GitBranch {
			return true, nil
		}
	}
	return false, nil
}

//GetCharts is responsible for getting the charts details
func GetCharts(ctx context.Context, chartsInput model.ChartsInput) ([]*model.Chart, error) {
	username := chartsInput.UserName
	reponame := chartsInput.RepoName
	repobranch := chartsInput.RepoBranch
	repoowner := chartsInput.RepoOwner
	hubname := chartsInput.HubName
	data, err := handler.GetChartsData(username, reponame, repobranch, repoowner, hubname)
	if err != nil {
		err = gitops.GitClone(username, reponame, repobranch, repoowner, hubname)
		if err != nil {
			return nil, err
		}
		data, err = handler.GetChartsData(username, reponame, repobranch, repoowner, hubname)
		if err != nil {
			return nil, err
		}
	}

	var data1 []*model.Chart
	json.Unmarshal([]byte(data), &data1)
	return data1, nil
}
