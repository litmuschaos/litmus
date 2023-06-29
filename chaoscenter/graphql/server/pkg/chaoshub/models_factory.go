package chaoshub

import "github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"

func NewCloningInputFrom(chaosHub model.CreateChaosHubRequest) model.CloningInput {
	return model.CloningInput{
		RepoBranch:    chaosHub.RepoBranch,
		RepoURL:       chaosHub.RepoURL,
		Name:          chaosHub.Name,
		IsPrivate:     chaosHub.IsPrivate,
		UserName:      chaosHub.UserName,
		Password:      chaosHub.Password,
		AuthType:      chaosHub.AuthType,
		Token:         chaosHub.Token,
		SSHPrivateKey: chaosHub.SSHPrivateKey,
	}
}
