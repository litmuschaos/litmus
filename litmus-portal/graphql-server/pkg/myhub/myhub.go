package myhub

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/operations"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
)

//AddMyHub ...
func AddMyHub(ctx context.Context, myhub model.CreateMyHub, username string) (*model.User, error) {

	gitLink := strings.Split(myhub.GitURL, "/")
	owner := gitLink[3]
	repo := gitLink[4]

	response, err := http.Get("https://api.github.com/repos/" + owner + "/" + repo + "/branches/" + myhub.GitBranch)
	fmt.Print(err)
	if err != nil {
		log.Print(err)
		return nil, err
	}
	data := response.StatusCode

	if data >= 200 && data <= 299 {
		IsExist, err := IsMyHubAvailable(ctx, myhub, username)
		if err != nil {
			return nil, err
		}
		if IsExist == true {
			return nil, err
		}

		fmt.Println("HTTP Status is in the 2xx range")
		//Initialize a UID for new Hub
		uuid := uuid.New()
		newHub := &dbSchema.MyHub{
			ID:        uuid.String(),
			GitURL:    myhub.GitURL,
			GitBranch: myhub.GitBranch,
		}
		err = database.AddNewMyHub(ctx, username, newHub)
		if err != nil {
			log.Print("ERROR", err)
			return nil, err
		}
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
