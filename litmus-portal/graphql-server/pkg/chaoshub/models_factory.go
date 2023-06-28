package chaoshub

import "github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"

func NewCloningInputFrom(chaosHub model.CreateChaosHubRequest) model.CloningInput {
	return model.CloningInput{
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
}
