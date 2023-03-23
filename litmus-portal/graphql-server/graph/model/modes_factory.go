package model

func NewCloningInputFrom(chaosHub CreateChaosHubRequest) CloningInput {
	return CloningInput{
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
